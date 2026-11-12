const { Pool } = require('pg');
const { loadEnv } = require('./env');

function createPool(config = loadEnv()) {
  const pool = new Pool({
    connectionString: config.DATABASE_URL,
    ssl: config.databaseSsl ? { rejectUnauthorized: true } : false,
    max: 15,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    application_name: 'datemate-api',
  });
  pool.on('error', (error) => console.error('PostgreSQL idle client error:', error.message));
  return pool;
}

module.exports = { createPool };
