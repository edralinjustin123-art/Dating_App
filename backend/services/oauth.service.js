const crypto = require('node:crypto');
const { sha256, randomToken } = require('../utils/tokens');
const { AppError, unavailable, unauthorized } = require('../utils/errors');
const { withTransaction } = require('../utils/transaction');

const PROVIDERS = {
  google: {
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
    jwks: 'https://www.googleapis.com/oauth2/v3/certs',
    issuer: ['https://accounts.google.com', 'accounts.google.com'],
    scope: 'openid email profile',
  },
  apple: {
    authorizationEndpoint: 'https://appleid.apple.com/auth/authorize',
    tokenEndpoint: 'https://appleid.apple.com/auth/token',
    jwks: 'https://appleid.apple.com/auth/keys',
    issuer: 'https://appleid.apple.com',
    scope: 'email name',
  },
};

function createOAuthService({ pool, config }) {
  const joseReady = import('jose');
  function providerConfig(provider) {
    if (!PROVIDERS[provider]) throw new AppError(400, 'INVALID_PROVIDER', 'The requested sign-in provider is not supported.');
    const ready = provider === 'google'
      ? Boolean(config.GOOGLE_CLIENT_ID && config.GOOGLE_CLIENT_SECRET)
      : Boolean(config.APPLE_CLIENT_ID && config.APPLE_TEAM_ID && config.APPLE_KEY_ID && config.APPLE_PRIVATE_KEY);
    if (!ready) throw unavailable(`${provider === 'google' ? 'Google' : 'Apple'} sign-in requires its provider credentials.`);
    return PROVIDERS[provider];
  }

  function validateRedirect(redirectUri) {
    const allowlist = config.OAUTH_REDIRECT_URIS.split(',').map((item) => item.trim()).filter(Boolean);
    if (!allowlist.length || !allowlist.includes(redirectUri)) {
      throw new AppError(400, 'INVALID_REDIRECT_URI', 'This OAuth redirect URI is not allowlisted by the server.');
    }
  }

  async function appleClientSecret() {
    const { SignJWT, importPKCS8 } = await joseReady;
    const privateKey = await importPKCS8(config.APPLE_PRIVATE_KEY.replace(/\\n/g, '\n'), 'ES256');
    return new SignJWT({})
      .setProtectedHeader({ alg: 'ES256', kid: config.APPLE_KEY_ID, typ: 'JWT' })
      .setIssuer(config.APPLE_TEAM_ID)
      .setSubject(config.APPLE_CLIENT_ID)
      .setAudience('https://appleid.apple.com')
      .setIssuedAt()
      .setExpirationTime('5m')
      .sign(privateKey);
  }

  return {
    async start(provider, redirectUri) {
      const details = providerConfig(provider);
      validateRedirect(redirectUri);
      const state = randomToken(32);
      const nonce = randomToken(32);
      const verifier = randomToken(48);
      const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');
      await pool.query(
        `INSERT INTO oauth_states (state_hash, provider, nonce, code_verifier, redirect_uri, expires_at)
         VALUES ($1, $2, $3, $4, $5, now() + interval '10 minutes')`,
        [sha256(state), provider, nonce, verifier, redirectUri],
      );
      const clientId = provider === 'google' ? config.GOOGLE_CLIENT_ID : config.APPLE_CLIENT_ID;
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        response_mode: 'query',
        scope: details.scope,
        state,
        nonce,
        code_challenge: challenge,
        code_challenge_method: 'S256',
      });
      return { authorizationUrl: `${details.authorizationEndpoint}?${params.toString()}` };
    },

    async complete({ provider, code, redirectUri, state }) {
      const details = providerConfig(provider);
      validateRedirect(redirectUri);
      const stateData = await withTransaction(pool, async (client) => {
        const result = await client.query(
          `DELETE FROM oauth_states WHERE state_hash = $1 AND provider = $2 AND redirect_uri = $3 AND expires_at > now()
           RETURNING nonce, code_verifier`,
          [sha256(state), provider, redirectUri],
        );
        if (!result.rows[0]) throw unauthorized();
        return result.rows[0];
      });

      const body = new URLSearchParams({
        grant_type: 'authorization_code', code, redirect_uri: redirectUri,
        client_id: provider === 'google' ? config.GOOGLE_CLIENT_ID : config.APPLE_CLIENT_ID,
        code_verifier: stateData.code_verifier,
      });
      if (provider === 'google') body.set('client_secret', config.GOOGLE_CLIENT_SECRET);
      else body.set('client_secret', await appleClientSecret());
      let tokenResponse;
      try {
        const response = await fetch(details.tokenEndpoint, {
          method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
          body, signal: AbortSignal.timeout(10_000),
        });
        tokenResponse = await response.json();
        if (!response.ok || !tokenResponse.id_token) throw unauthorized();
      } catch (error) {
        if (error?.status) throw error;
        throw new AppError(401, 'OAUTH_FAILED', 'The identity provider could not verify this sign-in.');
      }

      try {
        const { createRemoteJWKSet, jwtVerify } = await joseReady;
        const clientId = provider === 'google' ? config.GOOGLE_CLIENT_ID : config.APPLE_CLIENT_ID;
        const keySet = createRemoteJWKSet(new URL(details.jwks));
        const verified = await jwtVerify(tokenResponse.id_token, keySet, { issuer: details.issuer, audience: clientId });
        const claims = verified.payload;
        if (claims.nonce !== stateData.nonce || typeof claims.sub !== 'string') throw unauthorized();
        const emailVerified = claims.email_verified === true || claims.email_verified === 'true';
        return { provider, subject: claims.sub, email: typeof claims.email === 'string' ? claims.email.toLowerCase() : null, emailVerified };
      } catch {
        throw new AppError(401, 'OAUTH_FAILED', 'The identity provider returned an invalid identity token.');
      }
    },
  };
}

module.exports = { createOAuthService };
