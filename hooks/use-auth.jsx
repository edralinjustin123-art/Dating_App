import { createContext, useContext, useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';
import { isAuthConfigured, supabase } from '../utils/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [initializing, setInitializing] = useState(isAuthConfigured);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    let revision = 0;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!active || event === 'INITIAL_SESSION') return;
      revision += 1;
      setSession(nextSession);
      setInitializing(false);
      setError('');
    });
    const initialRevision = revision;
    supabase.auth
      .getSession()
      .then(async ({ data, error: sessionError }) => {
        if (sessionError) throw sessionError;
        if (!data.session) return null;
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        return { ...data.session, user: userData.user };
      })
      .then((restoredSession) => {
        if (active && revision === initialRevision) setSession(restoredSession);
      })
      .catch(() => {
        if (active && revision === initialRevision) {
          setSession(null);
          setError('Your session could not be restored. Please sign in again.');
        }
      })
      .finally(() => {
        if (active) setInitializing(false);
      });

    const updateRefresh = (state) => {
      if (state === 'active') supabase.auth.startAutoRefresh();
      else supabase.auth.stopAutoRefresh();
    };
    let appStateSubscription;
    if (Platform.OS !== 'web') {
      updateRefresh(AppState.currentState);
      appStateSubscription = AppState.addEventListener('change', updateRefresh);
    }
    return () => {
      active = false;
      subscription.unsubscribe();
      appStateSubscription?.remove();
      if (Platform.OS !== 'web') supabase.auth.stopAutoRefresh();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{ user: session?.user ?? null, initializing, error, configured: isAuthConfigured }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}
