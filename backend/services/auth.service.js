const crypto = require('node:crypto');
const bcrypt = require('bcrypt');
const { withTransaction } = require('../utils/transaction');
const { sha256, randomToken, signAccessToken } = require('../utils/tokens');
const { unauthorized, notFound, unavailable } = require('../utils/errors');

function createAuthService({ pool, config, emailService }) {
  const dummyHash = bcrypt.hashSync(crypto.randomBytes(32).toString('hex'), 12);
  const refreshTtlMs = config.REFRESH_TOKEN_TTL_DAYS * 86_400_000;

  async function issueSession(client, userId, remember) {
    const sessionId = crypto.randomUUID();
    const jti = crypto.randomUUID();
    const refreshToken = remember ? randomToken(48) : null;
    const expiresAt = new Date(Date.now() + refreshTtlMs);
    await client.query(
      `INSERT INTO auth_sessions (id, user_id, access_jti, refresh_token_hash, expires_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [sessionId, userId, jti, refreshToken ? sha256(refreshToken) : null, expiresAt],
    );
    return { accessToken: signAccessToken({ userId, sessionId, jti }, config), refreshToken };
  }

  async function completeAccount(userId, tokenData, client = pool) {
    const profile = await client.query('SELECT 1 FROM profiles WHERE user_id = $1', [userId]);
    return { ...tokenData, profileComplete: profile.rowCount > 0 };
  }

  return {
    async register({ email, password, name }) {
      const hash = await bcrypt.hash(password, 12);
      return withTransaction(pool, async (client) => {
        const inserted = await client.query(
          'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id', [email, hash],
        );
        const tokenData = await issueSession(client, inserted.rows[0].id, true);
        return { ...(await completeAccount(inserted.rows[0].id, tokenData, client)), profileName: name };
      });
    },

    async login({ email, password, remember }) {
      const result = await pool.query(
        'SELECT id, password_hash FROM users WHERE lower(email) = $1 AND deleted_at IS NULL', [email],
      );
      const user = result.rows[0];
      const hash = user?.password_hash || dummyHash;
      const matches = await bcrypt.compare(password, hash);
      if (!user || !user.password_hash || !matches) throw unauthorized();
      return withTransaction(pool, async (client) => {
        const tokenData = await issueSession(client, user.id, remember);
        return completeAccount(user.id, tokenData, client);
      });
    },

    async oauthLogin({ provider, subject, email, emailVerified }) {
      const subjectColumn = provider === 'google' ? 'google_subject' : 'apple_subject';
      return withTransaction(pool, async (client) => {
        let result = await client.query(`SELECT id FROM users WHERE ${subjectColumn} = $1 AND deleted_at IS NULL`, [subject]);
        let userId = result.rows[0]?.id;
        if (!userId) {
          if (!email || !emailVerified) throw unauthorized();
          result = await client.query('SELECT id FROM users WHERE lower(email) = $1 AND deleted_at IS NULL', [email]);
          if (result.rows[0]) {
            const { AppError } = require('../utils/errors');
            throw new AppError(409, 'ACCOUNT_LINK_REQUIRED', 'This email already has an account. Sign in with that account before linking a provider.');
          }
          result = await client.query(
            `INSERT INTO users (email, email_verified_at, ${subjectColumn}) VALUES ($1, now(), $2) RETURNING id`,
            [email, subject],
          );
          userId = result.rows[0].id;
        }
        const tokenData = await issueSession(client, userId, true);
        return completeAccount(userId, tokenData, client);
      });
    },

    async refresh(refreshToken) {
      return withTransaction(pool, async (client) => {
        const result = await client.query(
          `SELECT s.id, s.user_id FROM auth_sessions s
             JOIN users u ON u.id = s.user_id AND u.deleted_at IS NULL
            WHERE s.refresh_token_hash = $1 AND s.revoked_at IS NULL AND s.expires_at > now()
            FOR UPDATE OF s`,
          [sha256(refreshToken)],
        );
        const session = result.rows[0];
        if (!session) throw unauthorized();
        const jti = crypto.randomUUID();
        const nextRefresh = randomToken(48);
        await client.query(
          `UPDATE auth_sessions SET access_jti = $2, refresh_token_hash = $3, last_used_at = now()
            WHERE id = $1`, [session.id, jti, sha256(nextRefresh)],
        );
        return {
          accessToken: signAccessToken({ userId: session.user_id, sessionId: session.id, jti }, config),
          refreshToken: nextRefresh,
        };
      });
    },

    async logout(sessionId) {
      await pool.query('UPDATE auth_sessions SET revoked_at = now(), refresh_token_hash = NULL WHERE id = $1 AND revoked_at IS NULL', [sessionId]);
    },

    async validateSession(userId, sessionId) {
      const result = await pool.query(
        `SELECT u.id, u.email, u.email_verified_at,
                EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = u.id) AS profile_complete
           FROM users u JOIN auth_sessions s ON s.user_id = u.id
          WHERE u.id = $1 AND s.id = $2 AND s.revoked_at IS NULL AND s.expires_at > now() AND u.deleted_at IS NULL`,
        [userId, sessionId],
      );
      const row = result.rows[0];
      if (!row) throw unauthorized();
      return { user: { id: row.id, email: row.email, emailVerified: Boolean(row.email_verified_at), profileComplete: row.profile_complete } };
    },

    async requestPasswordReset(email) {
      if (!emailService.isConfigured || !config.PASSWORD_RESET_URL) {
        throw unavailable('Password reset requires SMTP credentials and PASSWORD_RESET_URL.');
      }
      const userResult = await pool.query('SELECT id, email FROM users WHERE lower(email) = $1 AND deleted_at IS NULL AND password_hash IS NOT NULL', [email]);
      const user = userResult.rows[0];
      if (!user) return { message: 'If an account matches that email, a reset link has been sent.' };
      const token = randomToken(32);
      const tokenHash = sha256(token);
      await withTransaction(pool, async (client) => {
        await client.query('UPDATE password_reset_tokens SET used_at = now() WHERE user_id = $1 AND used_at IS NULL', [user.id]);
        await client.query(
          `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
           VALUES ($1, $2, now() + ($3 * interval '1 minute'))`,
          [user.id, tokenHash, config.PASSWORD_RESET_TTL_MINUTES],
        );
      });
      try {
        await emailService.sendPasswordReset(user.email, token);
      } catch (error) {
        await pool.query('DELETE FROM password_reset_tokens WHERE token_hash = $1', [tokenHash]);
        throw error;
      }
      return { message: 'If an account matches that email, a reset link has been sent.' };
    },

    async resetPassword({ token, password }) {
      const hash = await bcrypt.hash(password, 12);
      await withTransaction(pool, async (client) => {
        const found = await client.query(
          `SELECT id, user_id FROM password_reset_tokens
            WHERE token_hash = $1 AND used_at IS NULL AND expires_at > now() FOR UPDATE`,
          [sha256(token)],
        );
        const reset = found.rows[0];
        if (!reset) throw notFound('Password reset link');
        await client.query('UPDATE users SET password_hash = $2, updated_at = now() WHERE id = $1', [reset.user_id, hash]);
        await client.query('UPDATE password_reset_tokens SET used_at = now() WHERE user_id = $1 AND used_at IS NULL', [reset.user_id]);
        await client.query('UPDATE auth_sessions SET revoked_at = now(), refresh_token_hash = NULL WHERE user_id = $1 AND revoked_at IS NULL', [reset.user_id]);
      });
      return { message: 'Your password has been changed. Please sign in again.' };
    },
  };
}

module.exports = { createAuthService };
