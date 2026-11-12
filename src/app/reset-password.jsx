import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { api } from '../lib/api';

export default function ResetPasswordScreen() {
  const { token } = useLocalSearchParams();
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const reset = async () => {
    if (password.length < 12) return Alert.alert('Choose a stronger password', 'Use at least 12 characters.');
    if (typeof token !== 'string' || !token) return Alert.alert('Reset link invalid', 'Request a new password reset link from the sign-in screen.');
    setBusy(true);
    try {
      await api.resetPassword(token, password);
      Alert.alert('Password updated', 'You can now sign in with your new password.', [{ text: 'Sign in', onPress: () => router.replace('/(auth)/login') }]);
    } catch (error) {
      Alert.alert('Could not reset password', error.message);
    } finally {
      setBusy(false);
    }
  };
  return <SafeAreaView style={s.safe}><KeyboardAvoidingView style={s.content} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><View><Text style={s.kicker}>ACCOUNT SECURITY</Text><Text style={s.title}>Choose a new password</Text><Text style={s.subtitle}>Use at least 12 characters to keep your account secure.</Text><TextInput style={s.input} value={password} onChangeText={setPassword} placeholder="New password" secureTextEntry autoCapitalize="none" autoCorrect={false} /><TouchableOpacity style={s.button} disabled={busy} onPress={reset}><Text style={s.buttonText}>{busy ? 'Updating…' : 'Update password'}</Text></TouchableOpacity></View></KeyboardAvoidingView></SafeAreaView>;
}

const s = StyleSheet.create({ safe: { flex: 1, backgroundColor: '#FFF' }, content: { flex: 1, justifyContent: 'center', padding: 26 }, kicker: { fontSize: 10, fontWeight: '800', letterSpacing: 1.6, color: '#EF7180' }, title: { fontSize: 27, fontWeight: '800', color: '#302D34', marginTop: 8 }, subtitle: { fontSize: 14, color: '#89848B', lineHeight: 20, marginTop: 7, marginBottom: 24 }, input: { height: 52, borderRadius: 15, backgroundColor: '#FFF7F7', paddingHorizontal: 15, borderWidth: 1, borderColor: '#F4E8E9', marginBottom: 13 }, button: { height: 54, borderRadius: 17, backgroundColor: '#F16D7A', alignItems: 'center', justifyContent: 'center' }, buttonText: { color: '#FFF', fontWeight: '800', fontSize: 15 } });
