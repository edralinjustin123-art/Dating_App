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

export const isAuthConfigured = Boolean(validUrl && key?.startsWith('sb_publishable_'));
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
  if (!supabase) throw new Error('Sign-in is not available yet. Please try again later.');
  return supabase;
}
