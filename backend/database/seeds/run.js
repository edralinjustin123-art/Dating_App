const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const bcrypt = require('bcrypt');
const { createPool } = require('../../config/database');
const { runMigrations } = require('../migrate');

async function seedCatalogs(pool) {
  const sql = await fs.readFile(path.join(__dirname, 'catalogs.sql'), 'utf8');
  await pool.query(sql);
}

async function seedDemo(pool) {
  if (process.env.NODE_ENV === 'production') throw new Error('Demo accounts cannot be seeded in production.');
  const intentions = await pool.query('SELECT id,slug FROM dating_intentions');
  const intentionId = new Map(intentions.rows.map((row) => [row.slug,row.id]));
  const interests = await pool.query('SELECT id,slug FROM interests');
  const interestId = new Map(interests.rows.map((row) => [row.slug,row.id]));
  const samples = [
    { id:'11111111-1111-4111-8111-111111111111',name:'Mia',age:27,gender:'woman',location:'Manila',bio:'Weekend coffee walks, art books, and finding the best dumplings.',intention:'long_term',interests:['coffee','travel','art'] },
    { id:'22222222-2222-4222-8222-222222222222',name:'Noah',age:30,gender:'man',location:'Quezon City',bio:'A good playlist and an unhurried Sunday are my kind of plans.',intention:'long_term',interests:['music','cooking','hiking'] },
    { id:'33333333-3333-4333-8333-333333333333',name:'Sam',age:25,gender:'non-binary',location:'Makati',bio:'Curious about new places, small galleries, and big conversations.',intention:'exploring',interests:['travel','art','books'] },
  ];
  const passwordHash = await bcrypt.hash(crypto.randomBytes(32).toString('hex'),12);
  for (const sample of samples) {
    const email=`demo-${sample.name.toLowerCase()}@example.invalid`;
    await pool.query(
      `INSERT INTO users(id,email,password_hash,is_demo) VALUES($1,$2,$3,true)
       ON CONFLICT(id) DO UPDATE SET email=EXCLUDED.email,is_demo=true`, [sample.id,email,passwordHash],
    );
    await pool.query(
      `INSERT INTO profiles(user_id,name,age,gender,location,bio,intention_id) VALUES($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT(user_id) DO UPDATE SET name=EXCLUDED.name,age=EXCLUDED.age,gender=EXCLUDED.gender,location=EXCLUDED.location,bio=EXCLUDED.bio,intention_id=EXCLUDED.intention_id`,
      [sample.id,sample.name,sample.age,sample.gender,sample.location,sample.bio,intentionId.get(sample.intention)],
    );
    for (const slug of sample.interests) {
      const id=interestId.get(slug);
      if(id) await pool.query('INSERT INTO user_interests(user_id,interest_id) VALUES($1,$2) ON CONFLICT DO NOTHING',[sample.id,id]);
    }
    await pool.query('INSERT INTO user_preferences(user_id,min_age,max_age,max_distance_km) VALUES($1,18,99,500) ON CONFLICT(user_id) DO NOTHING',[sample.id]);
  }
}

async function seed(pool) {
  await runMigrations(pool);
  await seedCatalogs(pool);
  const { rows } = await pool.query('SELECT count(*)::int AS total FROM interests');
  console.log(`Catalog seed ready (${rows[0].total} interests).`);
  if (process.argv.includes('--demo')) {
    await seedDemo(pool);
    console.log('Three non-login demo profiles were added for local development.');
  }
}

if (require.main === module) {
  const pool = createPool();
  seed(pool).then(async () => { await pool.end(); }).catch(async (error) => {
    console.error('Database seed failed:', error.message);
    await pool.end();
    process.exitCode = 1;
  });
}

module.exports = { seed, seedCatalogs, seedDemo };
