const { verifyAccessToken } = require('../utils/tokens');
const { unauthorized } = require('../utils/errors');

function createAuthenticate(pool, config) {
  return async function authenticate(req, res, next) {
    const header = req.get('authorization') || '';
    const match = /^Bearer\s+([A-Za-z0-9._-]+)$/i.exec(header);
    if (!match) return next(unauthorized());
    try {
      const claims = verifyAccessToken(match[1], config);
      if (!claims.sub || !claims.sid || !claims.jti) return next(unauthorized());
      const { rows } = await pool.query(
        `SELECT s.user_id
           FROM auth_sessions s
           JOIN users u ON u.id = s.user_id AND u.deleted_at IS NULL
          WHERE s.id = $1 AND s.user_id = $2 AND s.access_jti = $3
            AND s.revoked_at IS NULL AND s.expires_at > now()`,
        [claims.sid, claims.sub, claims.jti],
      );
      if (!rows[0]) return next(unauthorized());
      req.auth = { userId: rows[0].user_id, sessionId: claims.sid, jti: claims.jti };
      return next();
    } catch {
      return next(unauthorized());
    }
  };
}

module.exports = { createAuthenticate };
