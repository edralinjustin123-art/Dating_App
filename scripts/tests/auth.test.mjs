import assert from 'node:assert/strict';
import test from 'node:test';
import { readOAuthCode, createCodeExchanger } from '../../utils/oauth-callback.js';
import { createSecureSessionStorage } from '../../utils/secure-session-storage.js';

const redirect = 'http://localhost:8081/auth/callback';

test('accepts web and native authorization codes', () => {
  assert.equal(readOAuthCode(redirect + '?code=web-code', redirect), 'web-code');
  assert.equal(readOAuthCode('datingapp://auth/callback?code=native-code', 'datingapp://auth/callback'), 'native-code');
});

test('rejects a wrong origin or callback route', () => {
  assert.throws(() => readOAuthCode('https://other.example/auth/callback?code=bad', redirect), /unexpected address/);
  assert.throws(() => readOAuthCode('http://localhost:8081/other?code=bad', redirect), /unexpected address/);
});

test('rejects cancellation, missing/duplicate codes, and injected access tokens', () => {
  assert.throws(() => readOAuthCode(redirect + '?error=access_denied&code=ignored', redirect), /cancelled/);
  for (const query of ['', '?code=', '?code=one&code=two', '#access_token=untrusted&refresh_token=untrusted']) {
    assert.throws(() => readOAuthCode(redirect + query, redirect), /No valid sign-in code/);
  }
});

test('concurrent native browser/router callbacks exchange their code only once', async () => {
  let calls = 0;
  const session = { user: { id: 'verified-user' } };
  const exchange = createCodeExchanger({
    async exchangeCodeForSession(code) {
      calls += 1;
      assert.equal(code, 'one-use-code');
      return { data: { session }, error: null };
    },
  });
  const sessions = await Promise.all([exchange('one-use-code'), exchange('one-use-code')]);
  assert.equal(calls, 1);
  assert.deepEqual(sessions, [session, session]);
});

test('a rejected exchange or missing session never produces a signed-in user', async () => {
  const rejected = createCodeExchanger({
    async exchangeCodeForSession() { return { data: {}, error: new Error('Expired code') }; },
  });
  await assert.rejects(rejected('expired'), /Expired code/);
  const empty = createCodeExchanger({
    async exchangeCodeForSession() { return { data: { session: null }, error: null }; },
  });
  await assert.rejects(empty('empty'), /did not create a session/);
});

function memoryStore() {
  const values = new Map();
  return {
    values,
    failNextWrite: false,
    async getItemAsync(key) { return values.get(key) ?? null; },
    async setItemAsync(key, value) {
      if (this.failNextWrite) {
        this.failNextWrite = false;
        throw new Error('Device storage unavailable');
      }
      assert.ok(Buffer.byteLength(value, 'utf8') <= 1800);
      values.set(key, value);
    },
    async deleteItemAsync(key) { values.delete(key); },
  };
}

test('large Unicode sessions round-trip without exceeding secure storage value sizes', async () => {
  const store = memoryStore();
  const storage = createSecureSessionStorage(store);
  const session = JSON.stringify({ token: 'a'.repeat(6500), displayName: '\u00e9\u4f60\ud83d\ude0a'.repeat(100) });
  await storage.setItem('session', session);
  assert.equal(await storage.getItem('session'), session);
  assert.ok(store.values.size > 2);
});

test('a failed refresh write preserves the previously stored session', async () => {
  const store = memoryStore();
  const storage = createSecureSessionStorage(store);
  await storage.setItem('session', 'original session');
  store.failNextWrite = true;
  await assert.rejects(storage.setItem('session', 'replacement session'), /Device storage unavailable/);
  assert.equal(await storage.getItem('session'), 'original session');
  await storage.setItem('session', 'later valid refresh');
  assert.equal(await storage.getItem('session'), 'later valid refresh');
});

test('overlapping refresh writes remain ordered and logout removes all session data', async () => {
  const store = memoryStore();
  const storage = createSecureSessionStorage(store);
  await Promise.all([
    storage.setItem('session', 'first'),
    storage.setItem('session', 'second'.repeat(1000)),
    storage.setItem('session', 'latest'),
  ]);
  assert.equal(await storage.getItem('session'), 'latest');
  await storage.removeItem('session');
  assert.equal(await storage.getItem('session'), null);
  assert.equal(store.values.size, 0);
});

test('an incomplete secure session fails closed', async () => {
  const store = memoryStore();
  const storage = createSecureSessionStorage(store);
  await storage.setItem('session', 'saved session');
  const metadata = JSON.parse(store.values.get('session'));
  store.values.delete('session.' + metadata.id + '.0');
  await assert.rejects(storage.getItem('session'), /incomplete/);
});
