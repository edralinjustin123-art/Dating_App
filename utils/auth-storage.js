import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { createSecureSessionStorage } from './secure-session-storage';

// Keep the Supabase session and PKCE verifier in device secure storage.
const nativeStorage = createSecureSessionStorage(SecureStore);

export const authStorage =
  Platform.OS === 'web'
    ? {
        getItem: (key) => (typeof window === 'undefined' ? null : window.localStorage.getItem(key)),
        setItem: (key, value) => {
          if (typeof window !== 'undefined') window.localStorage.setItem(key, value);
        },
        removeItem: (key) => {
          if (typeof window !== 'undefined') window.localStorage.removeItem(key);
        },
      }
    : nativeStorage;
