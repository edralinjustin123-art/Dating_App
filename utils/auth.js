import { makeRedirectUri } from 'expo-auth-session';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { createCodeExchanger, readOAuthCode } from './oauth-callback';
import { requireAuthClient, supabase } from './supabase';

const exchangeCode = supabase ? createCodeExchanger(supabase.auth) : null;

export function getAuthRedirectUri() {
  return makeRedirectUri({ scheme: 'datingapp', path: 'auth/callback' });
}

export async function completeOAuthSignIn(url) {
  requireAuthClient();
  return exchangeCode(readOAuthCode(url, getAuthRedirectUri()));
}

export async function signInWithProvider(provider) {
  if (!['google', 'apple'].includes(provider)) throw new Error('Unsupported sign-in provider.');
  const client = requireAuthClient();
  if (
    Platform.OS !== 'web' &&
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient
  ) {
    throw new Error(
      'Use the DateMate web app or a development build to sign in. Expo Go cannot return from this sign-in flow.',
    );
  }
  const redirectTo = getAuthRedirectUri();
  const { data, error } = await client.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      skipBrowserRedirect: true,
      ...(provider === 'google' ? { queryParams: { prompt: 'select_account' } } : {}),
    },
  });
  if (error) throw error;
  if (!data.url) throw new Error('Could not open the sign-in page. Please try again.');
  if (Platform.OS === 'web') {
    window.location.assign(data.url);
    return;
  }
  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type === 'cancel' || result.type === 'dismiss') return;
  if (result.type !== 'success') throw new Error('Sign-in did not finish. Please try again.');
  await completeOAuthSignIn(result.url);
}

export async function signInWithEmail(email, password) {
  const { data, error } = await requireAuthClient().auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUpWithEmail(email, password) {
  const { data, error } = await requireAuthClient().auth.signUp({
    email,
    password,
    options: { emailRedirectTo: getAuthRedirectUri() },
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await requireAuthClient().auth.signOut({ scope: 'local' });
  if (error) throw error;
}
