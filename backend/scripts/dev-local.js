const path = require('node:path');
const { PGlite } = require('@electric-sql/pglite');
const { PGLiteSocketServer } = require('@electric-sql/pglite-socket');
const { runMigrations } = require('../database/migrate');
const { seedCatalogs } = require('../database/seeds/run');
const { start } = require('../server');

const databasePort = Number(process.env.LOCAL_DATABASE_PORT || 55432);
const databaseUrl = `postgresql://postgres:postgres@127.0.0.1:${databasePort}/postgres`;

async function startLocal() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('The embedded database is only for local development.');
  }

  const db = await PGlite.create(path.join(__dirname, '..', '.local-db'));
  const postgres = new PGLiteSocketServer({ db, port: databasePort, host: '127.0.0.1' });

  try {
    await postgres.start();
    process.env.DATABASE_URL = databaseUrl;
    process.env.DATABASE_SSL = 'false';
    process.env.JWT_SECRET ||= 'local-development-only-secret-change-for-real-deployments';

    const { createPool } = require('../config/database');
    const pool = createPool();
    await runMigrations(pool);
    await seedCatalogs(pool);

    console.log(`Local PostgreSQL-compatible database is ready at 127.0.0.1:${databasePort}.`);
    await start({ pool });
    console.log('Local database files are stored in backend/.local-db.');
  } catch (error) {
    await postgres.stop().catch(() => {});
    await db.close().catch(() => {});
    throw error;
  }
}

startLocal().catch((error) => {
  console.error('Local DateMate startup failed:', error.message);
  process.exitCode = 1;
});
