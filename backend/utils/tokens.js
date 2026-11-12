const crypto = require('node:crypto');
const jwt = require('jsonwebtoken');
const { loadEnv } = require('../config/env');

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function randomToken(bytes = 48) {
  return crypto.randomBytes(bytes).toString('base64url');
}

function signAccessToken({ userId, sessionId, jti }, config = loadEnv()) {
  return jwt.sign({ sid: sessionId }, config.JWT_SECRET, {
    algorithm: 'HS256', subject: userId, jwtid: jti,
    issuer: config.JWT_ISSUER, audience: config.JWT_AUDIENCE,
    expiresIn: config.ACCESS_TOKEN_TTL,
  });
}

function verifyAccessToken(token, config = loadEnv()) {
  return jwt.verify(token, config.JWT_SECRET, {
    algorithms: ['HS256'], issuer: config.JWT_ISSUER, audience: config.JWT_AUDIENCE,
  });
}

module.exports = { sha256, randomToken, signAccessToken, verifyAccessToken };
