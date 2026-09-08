import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Animated, KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import LoginScreen from '../../components/ui/LoginScreen';
import ProfileScreen from '../../components/ui/ProfileScreen';
import SignupScreen from '../../components/ui/SignupScreen';
import { clearCredentials, loadCredentials, saveCredentials } from '../../utils/storage';

export default function HomeScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const intro = useRef(new Animated.Value(0)).current;
  const form = useRef(new Animated.Value(1)).current;

  const checkSavedCredentials = useCallback(async () => {
    const { email, remember } = await loadCredentials();
    if (remember && email) setLoginEmail(email);
  }, []);

  useEffect(() => {
    checkSavedCredentials();
    Animated.spring(intro, { toValue: 1, damping: 16, stiffness: 110, useNativeDriver: true }).start();
  }, [checkSavedCredentials, intro]);

  const animateTransition = (next: () => void) => {
    Animated.timing(form, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      next();
      Animated.timing(form, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    });
  };

  const handleLogin = async (email: string, password: string, remember: boolean) => {
    if (!email || !password) return Alert.alert('Missing information', 'Please enter your email and password.');
    if (!/^\S+@\S+\.\S+$/.test(email)) return Alert.alert('Invalid email', 'Enter a valid email address.');
    await saveCredentials(email, password, remember);
    setLoginEmail(email);
    setIsLoggedIn(true);
  };

  const handleSignup = (email: string, password: string, confirmPassword: string, agreeTerms: boolean) => {
    if (!email || !password || !confirmPassword) return Alert.alert('Missing information', 'Please fill in all fields.');
    if (password !== confirmPassword) return Alert.alert('Password mismatch', 'Passwords do not match.');
    if (!agreeTerms) return Alert.alert('Terms required', 'Please agree to the Terms and Privacy Policy.');
    Alert.alert('Account created', 'You can now log in with your account.');
    animateTransition(() => setIsLogin(true));
  };

  const handleLogout = async () => { await clearCredentials(); setIsLoggedIn(false); setLoginEmail(''); };

  if (isLoggedIn) return <ProfileScreen email={loginEmail} onLogout={handleLogout} />;

  return <LinearGradient colors={['#541548', '#A72655', '#FF6B6B']} style={styles.screen}>
    <StatusBar barStyle="light-content" />
    <View style={styles.glowOne} /><View style={styles.glowTwo} />
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentInsetAdjustmentBehavior="automatic">
        <Animated.View style={[styles.brand, { opacity: intro, transform: [{ translateY: intro.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
          <View style={styles.logo}><Ionicons name="heart" size={31} color="#FF4F73" /></View>
          <View><Text style={styles.appName}>DateMate</Text><Text style={styles.tagline}>Meet safely. Connect genuinely.</Text></View>
        </Animated.View>

        <Animated.View style={[styles.card, { opacity: form, transform: [{ translateY: form.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }]}>
          {isLogin
            ? <LoginScreen initialEmail={loginEmail} onLogin={handleLogin} onSwitch={() => animateTransition(() => setIsLogin(false))} />
            : <SignupScreen onSignup={handleSignup} onSwitch={() => animateTransition(() => setIsLogin(true))} />}
        </Animated.View>

        <View style={styles.safety}><Ionicons name="shield-checkmark-outline" size={16} color="#FFDDE4" /><Text style={styles.safetyText}>For adults 18+ · Stay respectful and report suspicious behavior</Text></View>
      </ScrollView>
    </KeyboardAvoidingView>
  </LinearGradient>;
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { flexGrow: 1, width: '100%', maxWidth: 480, alignSelf: 'center', justifyContent: 'center', paddingHorizontal: 20, paddingTop: 44, paddingBottom: 28, gap: 22 },
  glowOne: { position: 'absolute', width: 260, height: 260, borderRadius: 130, backgroundColor: 'rgba(255,190,178,0.13)', top: -80, right: -100 },
  glowTwo: { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(255,255,255,0.07)', bottom: -90, left: -100 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingHorizontal: 4 },
  logo: { width: 58, height: 58, borderRadius: 19, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  appName: { color: '#FFFFFF', fontSize: 30, fontWeight: '900', letterSpacing: -0.8 },
  tagline: { color: '#FFDDE4', fontSize: 13, marginTop: 1 },
  card: { width: '100%', borderRadius: 30, padding: 24, backgroundColor: '#FFFFFF', boxShadow: '0 18px 45px rgba(52, 9, 42, 0.28)' },
  safety: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7, paddingHorizontal: 8 },
  safetyText: { flexShrink: 1, color: '#FFDDE4', fontSize: 11, lineHeight: 16, textAlign: 'center' },
});
