const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const { createPool } = require('../config/database');

async function runMigrations(pool) {
  await pool.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
    filename text PRIMARY KEY,
    checksum text NOT NULL,
    applied_at timestamptz NOT NULL DEFAULT now()
  )`);
  const client = await pool.connect();
  try {
    await client.query('SELECT pg_advisory_lock(hashtext($1))', ['datemate:migrations']);
    const folder = path.join(__dirname, 'migrations');
    const files = (await fs.readdir(folder)).filter((name) => name.endsWith('.sql')).sort();
    for (const filename of files) {
      const source = await fs.readFile(path.join(folder, filename), 'utf8');
      const checksum = crypto.createHash('sha256').update(source).digest('hex');
      const prior = await client.query('SELECT checksum FROM schema_migrations WHERE filename = $1', [filename]);
      if (prior.rows[0]) {
        if (prior.rows[0].checksum !== checksum) throw new Error(`Applied migration ${filename} has changed. Add a new migration instead.`);
        continue;
      }
      await client.query('BEGIN');
      try {
        await client.query(source);
        await client.query('INSERT INTO schema_migrations (filename, checksum) VALUES ($1, $2)', [filename, checksum]);
        await client.query('COMMIT');
        console.log(`Applied ${filename}`);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }
  } finally {
    try { await client.query('SELECT pg_advisory_unlock(hashtext($1))', ['datemate:migrations']); } finally { client.release(); }
  }
}

if (require.main === module) {
  const pool = createPool();
  runMigrations(pool).then(() => pool.end()).catch(async (error) => {
    console.error('Database migration failed:', error.message);
    await pool.end();
    process.exitCode = 1;
  });
}

module.exports = { runMigrations };
