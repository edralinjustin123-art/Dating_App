import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { fileURLToPath } from 'node:url';

// Match Expo's file precedence; existing shell variables take priority.
const environment = process.env.NODE_ENV || 'development';
for (const name of [`.env.${environment}.local`, '.env.local', `.env.${environment}`, '.env']) {
  const path = fileURLToPath(new URL(`../${name}`, import.meta.url));
  if (existsSync(path)) loadEnvFile(path);
}

async function checkSupabase() {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  let projectUrl;
  try {
    projectUrl = new URL(url);
  } catch {
    throw new Error('Set EXPO_PUBLIC_SUPABASE_URL in .env.local to your project URL.');
  }
  if (projectUrl.protocol !== 'https:' || projectUrl.username || projectUrl.password) {
    throw new Error('The Supabase project URL must use HTTPS and contain no credentials.');
  }
  if (!key?.startsWith('sb_publishable_') || /your_key|placeholder/i.test(key)) {
    throw new Error('Set EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY to the project publishable key.');
  }
  let response;
  try {
    response = await fetch(new URL('/auth/v1/settings', projectUrl), {
      headers: { apikey: key },
      signal: AbortSignal.timeout(15000),
      redirect: 'error',
    });
  } catch {
    throw new Error('Could not reach Supabase. Check your connection and project URL.');
  }
  if (!response.ok) {
    throw new Error(`Supabase returned HTTP ${response.status}. Check the project URL, key, and project status.`);
  }
  const settings = await response.json();
  if (!settings.external || typeof settings.external.email !== 'boolean') {
    throw new Error('Unexpected authentication settings response.');
  }
  console.log(`Connected: ${projectUrl.origin}`);
  console.log('Publishable key: accepted (value hidden)');
  console.log(`Email/password: ${settings.external.email ? 'enabled' : 'disabled'}`);
  console.log(`New sign-ups: ${settings.disable_signup ? 'disabled' : 'enabled'}`);
  console.log(`Email confirmation: ${settings.mailer_autoconfirm ? 'not required' : 'required'}`);
  for (const provider of ['google', 'apple']) {
    console.log(`${provider}: ${settings.external[provider] ? 'enabled' : 'disabled - provider setup required'}`);
  }
  console.log('\nRedirect settings and a complete sign-in still need testing.');
  console.log('Setup instructions: docs/auth-setup.md');
}

checkSupabase().catch((error) => {
  console.error(`Supabase check failed: ${error.message}`);
  process.exitCode = 1;
});
