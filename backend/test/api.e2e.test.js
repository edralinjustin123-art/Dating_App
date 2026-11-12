const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const net = require('node:net');
const request = require('supertest');
const { Pool } = require('pg');
const http = require('node:http');
const { Server } = require('socket.io');
const { io: socketClient } = require('socket.io-client');
const { PGlite } = require('@electric-sql/pglite');
const { PGLiteSocketServer } = require('@electric-sql/pglite-socket');
const { runMigrations } = require('../database/migrate');
const { createApp } = require('../app');
const { createServices } = require('../services');
const { attachSocketHandlers } = require('../services/socket.service');
const { PostgresRateLimitStore } = require('../middleware/rateLimit');
const { sha256 } = require('../utils/tokens');
const { seedDemo } = require('../database/seeds/run');

process.env.NODE_ENV = 'test';

let db; let postgres; let pool; let app; let port; let config; let services; let httpServer; let io;

async function availablePort() {
  const server = net.createServer();
  await new Promise((resolve, reject) => server.once('error', reject).listen(0, '127.0.0.1', resolve));
  const value = server.address().port;
  await new Promise((resolve) => server.close(resolve));
  return value;
}

function auth(token) { return { Authorization: `Bearer ${token}` }; }
function userId(token) { return JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8')).sub; }

before(async () => {
  config = {
    NODE_ENV: 'test', PORT: 4000, HOST: '127.0.0.1', DATABASE_URL: '', DATABASE_SSL: false,
    JWT_SECRET: 'test-only-secret-that-is-at-least-32-characters-long', JWT_ISSUER: 'datemate-api',
    JWT_AUDIENCE: 'datemate-app', ACCESS_TOKEN_TTL: '15m', REFRESH_TOKEN_TTL_DAYS: 30,
    PASSWORD_RESET_TTL_MINUTES: 30, PASSWORD_RESET_URL: '', TRUST_PROXY: 0,
    SMTP_HOST: '', SMTP_PORT: 587, SMTP_SECURE: false, SMTP_USER: '', SMTP_PASSWORD: '', SMTP_FROM: 'DateMate test <test@example.invalid>',
    S3_REGION: 'auto', S3_BUCKET: '', S3_ENDPOINT: '', S3_ACCESS_KEY_ID: '', S3_SECRET_ACCESS_KEY: '',
    S3_SIGNED_URL_TTL_SECONDS: 3600, s3ForcePathStyle: true, smtpSecure: false,
    GOOGLE_CLIENT_ID: '', GOOGLE_CLIENT_SECRET: '', APPLE_CLIENT_ID: '', APPLE_TEAM_ID: '', APPLE_KEY_ID: '', APPLE_PRIVATE_KEY: '',
    OAUTH_REDIRECT_URIS: '', corsOrigins: [],
  };
  db = await PGlite.create();
  port = await availablePort();
  postgres = new PGLiteSocketServer({ db, port, host: '127.0.0.1' });
  await postgres.start();
  pool = new Pool({ connectionString: `postgres://postgres:postgres@127.0.0.1:${port}/postgres`, max: 1 });
  await runMigrations(pool);
  httpServer = http.createServer();
  io = new Server({ cors: { origin: [] } });
  services = createServices({ pool, config, io });
  app = createApp({ pool, config, services });
  httpServer.on('request', app);
  io.attach(httpServer);
  attachSocketHandlers(io, { pool, messagingService: services.messagingService, socketRateStore: new PostgresRateLimitStore(pool, 'test-socket'), config });
  await new Promise((resolve) => httpServer.listen(0, '127.0.0.1', resolve));
});

after(async () => {
  if (io) await new Promise((resolve) => io.close(resolve));
  await pool?.end();
  await postgres?.stop();
  await db?.close();
});

test('authenticated API covers account, profile, discovery, matching, chat, blocking and session lifecycle', async () => {
  const register = async (name, email) => request(app).post('/api/auth/register').send({ name, email, password: 'a-long-enough-password-123' }).expect(201);
  const alice = (await register('Alice', 'alice@example.test')).body;
  alice.userId = userId(alice.accessToken);
  const bob = (await register('Bob', 'bob@example.test')).body;
  bob.userId = userId(bob.accessToken);
  const carol = (await register('Carol', 'carol@example.test')).body;
  carol.userId = userId(carol.accessToken);
  assert.equal(alice.profileComplete, false);
  assert.equal(alice.password, undefined);

  await request(app).post('/api/auth/register').send({ name: 'Duplicate', email: 'ALICE@example.test', password: 'a-long-enough-password-123' }).expect(409);
  await request(app).post('/api/auth/login').send({ email: 'alice@example.test', password: 'wrong-password-123', remember: true }).expect(401);
  const login = (await request(app).post('/api/auth/login').send({ email: 'alice@example.test', password: 'a-long-enough-password-123', remember: true }).expect(200)).body;
  assert.ok(login.accessToken); assert.ok(login.refreshToken);
  const aliceHeaders = auth(login.accessToken);
  await request(app).get('/api/auth/session').set(aliceHeaders).expect(200);
  await request(app).get('/api/interests').set(aliceHeaders).expect(200);

  const profile = (token, name, age) => request(app).put('/api/profiles/me').set(auth(token)).send({
    name, age, location: 'Manila', intention: 'long_term', bio: 'A thoughtful introduction.',
    interests: ['Coffee', 'Travel'], prompt: { question: 'Ideal first date?', answer: 'Coffee and a walk.' },
  }).expect(200);
  await profile(alice.accessToken, 'Alice', 29);
  await profile(bob.accessToken, 'Bob', 30);
  await profile(carol.accessToken, 'Carol', 32);
  await request(app).put('/api/profiles/me').set(aliceHeaders).send({ prompt: { question: 'A tiny joy?', answer: 'Sunlight and coffee.' } }).expect(200);
  const me = await request(app).get('/api/profiles/me').set(aliceHeaders).expect(200);
  assert.equal(me.body.profile.email, undefined);
  assert.deepEqual(me.body.profile.interests.sort(), ['Coffee', 'Travel']);
  assert.equal(me.body.profile.prompt.answer, 'Sunlight and coffee.');
  await request(app).get('/api/profiles/me/photos').set(aliceHeaders).expect(200).expect((res) => assert.deepEqual(res.body.photos, []));
  await request(app).delete('/api/profiles/me/photos/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa').set(aliceHeaders).expect(404);
  const image = Buffer.from([0xff,0xd8,0xff,0xe0,0,0x10,0x4a,0x46,0x49,0x46,0,1]);
  await request(app).post('/api/profiles/me/photos').set(aliceHeaders).attach('photo', image, 'profile.jpg').expect(503);
  await request(app).get(`/api/profiles/${carol.userId}`).set(aliceHeaders).expect(200);

  await request(app).put('/api/preferences').set(aliceHeaders).send({ minAge: 24, maxAge: 40, maxDistance: 50, intentions: ['long_term'] }).expect(200);
  await request(app).get('/api/preferences').set(aliceHeaders).expect(200);
  const discovery = await request(app).get('/api/discover?location=Manila&limit=10').set(aliceHeaders).expect(200);
  assert.ok(discovery.body.profiles.some((item) => item.name === 'Bob'));
  await request(app).get('/api/discover?minAge=40&maxAge=20').set(aliceHeaders).expect(400);

  await request(app).post('/api/likes').set(aliceHeaders).send({ profileId: bob.userId, direction: 'like' }).expect(200);
  const incoming = await request(app).get('/api/likes').set(auth(bob.accessToken)).expect(200);
  assert.ok(incoming.body.likes.some((item) => item.name === 'Alice'));
  const mutual = await request(app).post('/api/likes').set(auth(bob.accessToken)).send({ profileId: alice.userId, direction: 'like' }).expect(200);
  assert.ok(mutual.body.match?.conversationId);
  const matches = await request(app).get('/api/matches').set(aliceHeaders).expect(200);
  assert.equal(matches.body.matches.length, 1);
  const conversations = await request(app).get('/api/conversations').set(aliceHeaders).expect(200);
  assert.equal(conversations.body.conversations.length, 1);
  const conversationId = mutual.body.match.conversationId;

  const socket = socketClient(`http://127.0.0.1:${httpServer.address().port}`, { auth: { accessToken: alice.accessToken }, transports: ['websocket'] });
  try {
    await new Promise((resolve, reject) => { socket.once('connect', resolve); socket.once('connect_error', reject); setTimeout(() => reject(new Error('Socket connection timed out')), 4000); });
    const joined = await socket.timeout(3000).emitWithAck('conversation:join', { conversationId });
    assert.equal(joined.joined, true);
    const broadcast = new Promise((resolve, reject) => { socket.once('message:new', resolve); setTimeout(() => reject(new Error('Socket message broadcast timed out')), 4000); });
    const sent = await socket.timeout(3000).emitWithAck('message:send', { conversationId, text: 'A live socket hello.' });
    assert.equal(sent.message.text, 'A live socket hello.');
    assert.equal((await broadcast).id, sent.message.id);
  } finally {
    socket.disconnect();
  }

  await request(app).post('/api/messages').set(aliceHeaders).send({ conversationId, text: 'Hi Bob, it is great to meet you.' }).expect(201);
  const messages = await request(app).get(`/api/conversations/${conversationId}/messages`).set(auth(bob.accessToken)).expect(200);
  const socketMessage = messages.body.messages.find((message) => message.text === 'A live socket hello.');
  const restMessage = messages.body.messages.find((message) => message.text === 'Hi Bob, it is great to meet you.');
  assert.equal(socketMessage?.sender, 'mate');
  assert.equal(restMessage?.sender, 'mate');
  await request(app).post(`/api/conversations/${conversationId}/read`).set(auth(bob.accessToken)).expect(200);
  await request(app).get(`/api/conversations/${conversationId}/messages`).set(auth(carol.accessToken)).expect(403);

  await request(app).post(`/api/profiles/${bob.userId}/block`).set(aliceHeaders).expect(200);
  await request(app).get('/api/matches').set(aliceHeaders).expect(200).expect((res) => assert.equal(res.body.matches.length, 0));
  await request(app).delete(`/api/profiles/${bob.userId}/block`).set(aliceHeaders).expect(200);
  const rematch = await request(app).post('/api/likes').set(auth(bob.accessToken)).send({ profileId: alice.userId, direction: 'like' }).expect(200);
  assert.ok(rematch.body.match);
  await request(app).delete(`/api/matches/${rematch.body.match.id}`).set(aliceHeaders).expect(200);
  await request(app).post('/api/likes').set(aliceHeaders).send({ profileId: carol.userId, direction: 'pass' }).expect(200);
  await request(app).post('/api/likes/undo').set(aliceHeaders).expect(200).expect((res) => assert.equal(res.body.undone, true));

  await request(app).post('/api/profiles/me/photos').set(aliceHeaders).attach('photo', Buffer.from('not an image'), 'bad.jpg').expect(415);
  await request(app).post('/api/auth/reset-password').send({ token: 'x'.repeat(48), password: 'a-new-long-password-456' }).expect(404);
  await request(app).post('/api/auth/forgot-password').send({ email: 'alice@example.test' }).expect(503);
  await request(app).post('/api/auth/oauth/google').send({ redirectUri: 'datematee://auth/callback' }).expect(503);
  await request(app).post('/api/auth/oauth/callback').send({ provider: 'google', code: 'provider-code', redirectUri: 'datematee://auth/callback', state: 'x'.repeat(40) }).expect(400);

  const refreshed = await request(app).post('/api/auth/refresh').send({ refreshToken: login.refreshToken }).expect(200);
  assert.ok(refreshed.body.accessToken);
  await request(app).post('/api/auth/logout').set(auth(refreshed.body.accessToken)).expect(200);
  await request(app).get('/api/auth/session').set(auth(refreshed.body.accessToken)).expect(401);
  await request(app).post('/api/auth/refresh').send({ refreshToken: refreshed.body.refreshToken }).expect(401);
  await request(app).get('/api/profiles/me').expect(401);
  const resetToken = 'a-real-test-reset-token-with-sufficient-entropy';
  await pool.query('INSERT INTO password_reset_tokens(user_id,token_hash,expires_at) VALUES($1,$2,now()+interval \'10 minutes\')', [carol.userId,sha256(resetToken)]);
  await request(app).post('/api/auth/reset-password').send({ token: resetToken, password: 'a-new-long-password-456' }).expect(200);
  await request(app).get('/api/auth/session').set(auth(carol.accessToken)).expect(401);
  await request(app).post('/api/auth/login').send({ email: 'carol@example.test', password: 'a-long-enough-password-123', remember: false }).expect(401);
  const recovered = (await request(app).post('/api/auth/login').send({ email: 'carol@example.test', password: 'a-new-long-password-456', remember: false }).expect(200)).body;
  await request(app).delete('/api/profiles/me').set(auth(recovered.accessToken)).expect(200);
  await request(app).get('/api/auth/session').set(auth(recovered.accessToken)).expect(401);
  await request(app).get('/health').expect(200);
  await seedDemo(pool);
  const demos = await pool.query('SELECT count(*)::int AS total FROM users WHERE is_demo=true');
  assert.equal(demos.rows[0].total, 3);
});
