import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import PasswordInput from '../../components/ui/PasswordInput';
import { updatePassword } from '../../utils/auth';
import { getPasswordError } from '../../utils/password-validation';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (submitting) return;
    const validationError = getPasswordError(password);
    setPasswordError(validationError);
    if (validationError) return;
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await updatePassword(password);
      router.replace('/');
    } catch (cause) {
      setError(cause.message || 'Could not update your password. Request a new reset link and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>DATEMATE ACCOUNT</Text>
        <Text style={styles.title}>Choose a new password</Text>
        <Text style={styles.subtitle}>Make it strong so your account stays yours.</Text>
        <PasswordInput
          label="Password"
          value={password}
          onChangeText={(value) => { setPassword(value); setPasswordError(''); setError(''); }}
          placeholder="8–10 characters"
          maxLength={10}
          errorMessage={passwordError}
        />
        <PasswordInput
          label="Confirm password"
          value={confirmPassword}
          onChangeText={(value) => { setConfirmPassword(value); setError(''); }}
          placeholder="Enter it again"
          maxLength={10}
          errorMessage={error === 'Passwords do not match.' ? error : ''}
        />
        {error && error !== 'Passwords do not match.' ? (
          <Text accessibilityRole="alert" style={styles.error}>{error}</Text>
        ) : null}
        <Pressable
          onPress={submit}
          disabled={submitting}
          accessibilityRole="button"
          accessibilityState={{ disabled: submitting, busy: submitting }}
          style={({ pressed }) => [styles.buttonWrap, pressed && styles.pressed]}>
          <LinearGradient colors={['#FF416C', '#FF6B6B']} style={styles.button}>
            {submitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Update password</Text>}
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, justifyContent: 'center', padding: 22, backgroundColor: '#FFF7FA' },
  card: { width: '100%', maxWidth: 460, alignSelf: 'center', gap: 18, padding: 24, borderRadius: 28, backgroundColor: '#FFFFFF' },
  eyebrow: { color: '#FF4F73', fontSize: 12, fontWeight: '800', letterSpacing: 1.4 },
  title: { color: '#211D26', fontSize: 26, fontWeight: '800' },
  subtitle: { color: '#77717F', fontSize: 14, lineHeight: 20, marginTop: -12 },
  error: { color: '#B42318', fontSize: 13, lineHeight: 18 },
  buttonWrap: { overflow: 'hidden', borderRadius: 16 },
  button: { height: 54, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  pressed: { opacity: 0.82 },
});
