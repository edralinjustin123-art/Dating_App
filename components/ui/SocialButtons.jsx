import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { signInWithProvider } from '../../utils/auth';

const PROVIDERS = [
  { id: 'google', name: 'Google', icon: 'logo-google', color: '#EA4335' },
  { id: 'apple', name: 'Apple', icon: 'logo-apple', color: '#151218' },
];

export default function SocialButtons({ disabled = false }) {
  const [error, setError] = useState('');
  const [pendingProvider, setPendingProvider] = useState('');

  const signIn = async (provider) => {
    if (disabled || pendingProvider) return;
    setError('');
    setPendingProvider(provider);
    try {
      await signInWithProvider(provider);
    } catch (cause) {
      setError(cause.message || 'Sign-in failed. Please try again.');
    } finally {
      setPendingProvider('');
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
            <Ionicons name={provider.icon} size={21} color={provider.color} />
            <Text style={styles.text}>
              {pendingProvider === provider.id ? 'Signing in...' : provider.name}
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
  container: { flexDirection: 'row', gap: 12 },
  button: {
    flex: 1,
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
  error: { color: '#B42318', fontSize: 13, lineHeight: 18 },
});
