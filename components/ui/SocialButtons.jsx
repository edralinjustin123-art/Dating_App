import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { signInWithProvider } from '../../utils/auth';

const PROVIDERS = [
  { id: 'google', name: 'Google' },
  { id: 'facebook', name: 'Facebook', icon: 'logo-facebook', color: '#1877F2' },
];

export default function SocialButtons({ disabled = false, onPendingChange }) {
  const [error, setError] = useState('');
  const [pendingProvider, setPendingProvider] = useState('');
  const requestInProgress = useRef(false);

  const signIn = async (provider) => {
    if (disabled || requestInProgress.current) return;
    requestInProgress.current = true;
    setError('');
    setPendingProvider(provider);
    onPendingChange?.(true);
    try {
      const result = await signInWithProvider(provider);
      if (result?.cancelled) return;
    } catch (cause) {
      const message = cause.message || '';
      if (/provider.*not enabled|unsupported provider/i.test(message)) {
        const name = provider === 'google' ? 'Google' : 'Facebook';
        setError(`${name} sign-in is not enabled in Supabase. Configure its provider credentials in Authentication > Sign In / Providers.`);
      } else {
        setError(message || 'Sign-in failed. Please try again.');
      }
    } finally {
      requestInProgress.current = false;
      setPendingProvider('');
      onPendingChange?.(false);
    }
  };

  return (
    <View style={styles.group}>
      <View style={styles.container}>
        {PROVIDERS.map((provider) => (
          <Pressable
            key={provider.id}
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel={'Sign in with ' + provider.name}
            accessibilityState={{
              disabled: disabled || Boolean(pendingProvider),
              busy: pendingProvider === provider.id,
            }}
            disabled={disabled || Boolean(pendingProvider)}
            onPress={() => signIn(provider.id)}>
            {pendingProvider === provider.id ? <ActivityIndicator color="#2D2933" /> : provider.id === 'google' ? (
              <Image source={require('../../assets/images/google-g.png')} style={styles.googleLogo} accessibilityLabel="Google" />
            ) : <Ionicons name={provider.icon} size={21} color={provider.color} />}
            <Text style={styles.text}>
              {pendingProvider === provider.id ? 'Signing in...' : `Continue with ${provider.name}`}
            </Text>
          </Pressable>
        ))}
      </View>
      {error ? (
        <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}
const styles = StyleSheet.create({
  group: { gap: 8 },
  container: { gap: 10 },
  button: {
    width: '100%',
    height: 50,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E7E3E9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    backgroundColor: '#FFFFFF',
  },
  pressed: { opacity: 0.72 },
  text: { color: '#2D2933', fontSize: 15, fontWeight: '600' },
  googleLogo: { width: 21, height: 21, resizeMode: 'contain' },
  error: { color: '#B42318', fontSize: 13, lineHeight: 18 },
});
