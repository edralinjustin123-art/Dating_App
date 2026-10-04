import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import CustomSwitch from './CustomSwitch';
import InputField from './InputField';
import PasswordInput from './PasswordInput';
import SocialButtons from './SocialButtons';
import { sendPasswordReset } from '../../utils/auth';
export default function LoginScreen({
  onSwitch,
  onLogin,
  initialEmail = '',
  isSubmitting = false,
}) {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [resetting, setResetting] = useState(false);
  const [socialSubmitting, setSocialSubmitting] = useState(false);
  const [remember, setRemember] = useState(Boolean(initialEmail));
  const [previousInitialEmail, setPreviousInitialEmail] = useState(initialEmail);
  if (previousInitialEmail !== initialEmail) {
    setPreviousInitialEmail(initialEmail);
    setEmail(initialEmail);
    setRemember(Boolean(initialEmail));
  }
  return (
    <View style={styles.container}>
      <View style={styles.heading}>
        <Text style={styles.eyebrow}>WELCOME BACK</Text>
        <Text style={styles.title}>Log in to continue</Text>
        <Text style={styles.subtitle}>Your next meaningful connection could be one tap away.</Text>
      </View>

      <View style={styles.fields}>
        <InputField
          label="Email address"
          value={email}
          onChangeText={setEmail}
          placeholder="name@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <PasswordInput
          label="Password"
          value={password}
          placeholder="Enter your password"
          helperText={null}
          errorMessage={passwordError}
          onChangeText={(value) => {
            setPassword(value);
            setPasswordError('');
          }}
        />
      </View>

      <View style={styles.options}>
        <Pressable
          style={styles.remember}
          onPress={() => setRemember((current) => !current)}
          accessibilityRole="switch"
          accessibilityState={{ checked: remember }}>
          <CustomSwitch value={remember} onValueChange={setRemember} />
          <Text style={styles.optionText}>Remember me</Text>
        </Pressable>
        <Pressable
          disabled={resetting || isSubmitting || socialSubmitting}
          onPress={async () => {
            if (!email.trim()) {
              Alert.alert('Reset password', 'Enter your email address first.');
              return;
            }
            setResetting(true);
            try {
              await sendPasswordReset(email.trim());
              Alert.alert('Check your email', 'If an account exists for this address, a password reset link is on its way.');
            } catch (error) {
              Alert.alert('Could not send reset link', error.message || 'Please try again.');
            } finally {
              setResetting(false);
            }
          }}
          accessibilityRole="button">
          {resetting ? <ActivityIndicator size="small" color="#ED4567" /> : <Text style={styles.forgot}>Forgot password?</Text>}
        </Pressable>
      </View>

      <Pressable
        style={({ pressed }) => [styles.primaryWrap, pressed && styles.pressed]}
        onPress={() => {
          setPasswordError('');
          onLogin(email.trim(), password, remember);
        }}
        disabled={isSubmitting || socialSubmitting || resetting}
        accessibilityState={{ disabled: isSubmitting || socialSubmitting || resetting, busy: isSubmitting || socialSubmitting }}
        accessibilityRole="button">
        <LinearGradient
          colors={['#FF416C', '#FF6B6B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.primary}>
          {isSubmitting || socialSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>Log in</Text>}
        </LinearGradient>
      </Pressable>

      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={styles.dividerText}>or continue with</Text>
        <View style={styles.line} />
      </View>
      <SocialButtons disabled={isSubmitting || resetting} onPendingChange={setSocialSubmitting} />

      <Pressable disabled={isSubmitting || socialSubmitting} onPress={onSwitch} style={styles.switchLink} accessibilityRole="button">
        <Text style={styles.switchText}>
          New to DateMate? <Text style={styles.accent}>Create account</Text>
        </Text>
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { width: '100%', gap: 20 },
  heading: { gap: 6 },
  eyebrow: { color: '#FF4F73', fontSize: 12, fontWeight: '800', letterSpacing: 1.5 },
  title: { color: '#211D26', fontSize: 26, lineHeight: 32, fontWeight: '800' },
  subtitle: { color: '#77717F', fontSize: 14, lineHeight: 20 },
  fields: { gap: 15 },
  options: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  remember: { flexDirection: 'row', alignItems: 'center', marginLeft: -8 },
  optionText: { color: '#625C68', fontSize: 13 },
  forgot: { color: '#ED4567', fontSize: 13, fontWeight: '700' },
  primaryWrap: { borderRadius: 17, overflow: 'hidden' },
  primary: { height: 56, alignItems: 'center', justifyContent: 'center' },
  primaryText: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  pressed: { opacity: 0.82 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  line: { flex: 1, height: 1, backgroundColor: '#EBE7ED' },
  dividerText: { color: '#98929E', fontSize: 12 },
  switchLink: { alignItems: 'center', paddingTop: 2 },
  switchText: { color: '#746E79', fontSize: 14 },
  accent: { color: '#ED4567', fontWeight: '800' },
});
