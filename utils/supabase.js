import 'react-native-url-polyfill/auto';
import { createClient, processLock } from '@supabase/supabase-js';
import { authStorage } from './auth-storage';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
const validUrl = (() => {
  try {
    return Boolean(url && new URL(url).protocol === 'https:');
  } catch {
    return false;
  }
})();

const validKey = Boolean(key?.startsWith('sb_publishable_'));
export const isAuthConfigured = Boolean(validUrl && validKey);
export const supabase = isAuthConfigured
  ? createClient(url, key, {
      auth: {
        storage: authStorage,
        flowType: 'pkce',
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        lock: processLock,
      },
    })
  : null;

export function requireAuthClient() {
  if (!validUrl) {
    throw new Error('Sign-in needs the Supabase project URL. Add EXPO_PUBLIC_SUPABASE_URL to .env.local and restart Expo.');
  }
  if (!validKey) {
    throw new Error('Sign-in needs the Supabase publishable key. Add EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY to .env.local and restart Expo.');
  }
  return supabase;
}
