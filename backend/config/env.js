const dotenv = require('dotenv');
const { z } = require('zod');

dotenv.config();

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  HOST: z.string().default('0.0.0.0'),
  DATABASE_URL: z.string().min(1),
  DATABASE_SSL: z.string().default('false'),
  JWT_SECRET: z.string().min(32),
  JWT_ISSUER: z.string().default('datemate-api'),
  JWT_AUDIENCE: z.string().default('datemate-app'),
  ACCESS_TOKEN_TTL: z.string().default('15m'),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().min(1).max(365).default(30),
  PASSWORD_RESET_TTL_MINUTES: z.coerce.number().int().min(5).max(120).default(30),
  PASSWORD_RESET_URL: z.string().default(''),
  CORS_ORIGINS: z.string().default('http://localhost:8081,http://localhost:19006'),
  TRUST_PROXY: z.coerce.number().int().min(0).max(10).default(0),
  SMTP_HOST: z.string().default(''), SMTP_PORT: z.coerce.number().int().min(1).max(65535).default(587),
  SMTP_SECURE: z.string().default('false'), SMTP_USER: z.string().default(''), SMTP_PASSWORD: z.string().default(''),
  SMTP_FROM: z.string().default('DateMate <no-reply@example.com>'),
  S3_REGION: z.string().default('auto'), S3_BUCKET: z.string().default(''), S3_ENDPOINT: z.string().default(''),
  S3_ACCESS_KEY_ID: z.string().default(''), S3_SECRET_ACCESS_KEY: z.string().default(''),
  S3_FORCE_PATH_STYLE: z.string().default('true'), S3_SIGNED_URL_TTL_SECONDS: z.coerce.number().int().min(60).max(604800).default(3600),
  GOOGLE_CLIENT_ID: z.string().default(''), GOOGLE_CLIENT_SECRET: z.string().default(''),
  APPLE_CLIENT_ID: z.string().default(''), APPLE_TEAM_ID: z.string().default(''), APPLE_KEY_ID: z.string().default(''), APPLE_PRIVATE_KEY: z.string().default(''),
  OAUTH_REDIRECT_URIS: z.string().default(''),
});

function loadEnv(source = process.env) {
  const result = schema.safeParse(source);
  if (!result.success) {
    const fields = result.error.issues.map((issue) => issue.path.join('.')).join(', ');
    throw new Error(`Invalid backend environment. Check: ${fields}`);
  }
  const config = result.data;
  if (config.NODE_ENV === 'production' && config.CORS_ORIGINS.trim() === '') throw new Error('CORS_ORIGINS must be explicitly set in production.');
  if (config.NODE_ENV === 'production' && config.JWT_SECRET === 'replace-with-at-least-32-random-bytes') throw new Error('Set a unique production JWT_SECRET.');
  return Object.freeze({
    ...config,
    databaseSsl: config.DATABASE_SSL === 'true',
    smtpSecure: config.SMTP_SECURE === 'true',
    s3ForcePathStyle: config.S3_FORCE_PATH_STYLE === 'true',
    corsOrigins: config.CORS_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean),
  });
}

module.exports = { loadEnv };
