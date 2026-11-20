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
        if (prior.rows[0].checksum !== checksum) {
          // 001 and 002 have evolved in existing development checkouts. Reconcile
          // their checksum only after confirming the actual schema is present.
          const expectedLegacy = {
            '001_initial_schema.sql': [
              ['users', 'email'], ['profiles', 'user_id'], ['auth_sessions', 'refresh_token_hash'],
              ['profile_photos', 'storage_key', 'cloudinary_public_id'],
              ['dating_intentions', 'slug'], ['interests', 'slug'],
            ],
            '002_seed_catalogs.sql': [['dating_intentions', 'slug'], ['interests', 'slug']],
            '003_cloudinary_profile_photos.sql': [
              ['profile_photos', 'cloudinary_public_id'], ['profile_photos', 'position'], ['profile_photos', 'photo_url'],
            ],
            '004_cleanup_profile_photo_constraint.sql': [],
          };
          const checks = expectedLegacy[filename];
          if (!checks) throw new Error(`Applied migration ${filename} has changed. Add a new migration instead.`);
          for (const [table, column, alternateColumn] of checks) {
            const exists = await client.query(
              'SELECT 1 FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = $1 AND column_name = $2',
              [table, column],
            );
            if (!exists.rowCount && alternateColumn) {
              const alternate = await client.query(
                'SELECT 1 FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = $1 AND column_name = $2',
                [table, alternateColumn],
              );
              if (alternate.rowCount) continue;
            }
            if (!exists.rowCount) throw new Error(`Cannot reconcile ${filename}: expected ${table}.${column} is missing.`);
          }
          if (filename === '003_cloudinary_profile_photos.sql') {
            const unique = await client.query(
              "SELECT 1 FROM pg_constraint WHERE conrelid = 'profile_photos'::regclass AND conname = 'profile_photos_user_position_key' AND contype = 'u'",
            );
            const orderIndex = await client.query(
              "SELECT indexdef FROM pg_indexes WHERE tablename = 'profile_photos' AND indexname = 'profile_photos_user_order_idx'",
            );
            if (!unique.rowCount || !orderIndex.rows[0]?.indexdef.includes('position')) {
              throw new Error(`Cannot reconcile ${filename}: expected profile photo ordering constraints are missing.`);
            }
          }
          if (filename === '004_cleanup_profile_photo_constraint.sql') {
            const remainingLegacyConstraints = await client.query(
              "SELECT 1 FROM pg_constraint WHERE conrelid = 'profile_photos'::regclass AND conname IN ('profile_photos_sort_order_key', 'profile_photos_storage_key_key')",
            );
            if (remainingLegacyConstraints.rowCount) {
              throw new Error(`Cannot reconcile ${filename}: legacy profile photo constraints are still present.`);
            }
          }
          await client.query('UPDATE schema_migrations SET checksum = $2 WHERE filename = $1', [filename, checksum]);
          console.log(`Reconciled checksum for ${filename} after confirming its schema.`);
        }
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
