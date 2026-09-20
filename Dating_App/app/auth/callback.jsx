import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { completeOAuthSignIn, getAuthRedirectUri } from '../../utils/auth';

export default function AuthCallback() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [error, setError] = useState('');
  const code = typeof params.code === 'string' ? params.code : '';
  const providerError = typeof params.error === 'string' ? params.error : '';

  useEffect(() => {
    let active = true;
    const callback = new URL(getAuthRedirectUri());
    if (code) callback.searchParams.set('code', code);
    if (providerError) callback.searchParams.set('error', providerError);
    completeOAuthSignIn(callback.toString())
      .then(() => {
        if (active) router.replace('/');
      })
      .catch((cause) => {
        if (active) setError(cause.message || 'Sign-in could not be completed. Please try again.');
      });
    return () => {
      active = false;
    };
  }, [code, providerError, router]);

  return (
    <View style={styles.container}>
      {error ? (
        <>
          <Text accessibilityRole="alert" style={styles.message}>
            {error}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace('/')}
            style={styles.button}>
            <Text style={styles.buttonText}>Back to sign in</Text>
          </Pressable>
        </>
      ) : (
        <>
          <ActivityIndicator size="large" color="#FF4F73" />
          <Text style={styles.message}>Completing sign-in...</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 20,
    backgroundColor: '#FFFFFF',
  },
  message: { color: '#211D26', fontSize: 17, textAlign: 'center' },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#FF4F73',
  },
  buttonText: { color: '#FFFFFF', fontWeight: '700' },
});
