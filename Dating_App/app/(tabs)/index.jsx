import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LoginScreen from '../../components/ui/LoginScreen';
import ProfileScreen from '../../components/ui/ProfileScreen';
import SignupScreen from '../../components/ui/SignupScreen';
import { clearCredentials, loadCredentials, saveCredentials } from '../../utils/storage';
import { useAuth } from '../../hooks/use-auth';
import { signInWithEmail, signUpWithEmail, signOut } from '../../utils/auth';
export default function HomeScreen() {
  const { user, initializing, error: sessionError } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [intro] = useState(() => new Animated.Value(0));
  const [form] = useState(() => new Animated.Value(1));
  useEffect(() => {
    let active = true;
    loadCredentials().then(({ email, remember }) => {
      if (active && remember && email) setLoginEmail(email);
    });
    const animation = Animated.spring(intro, {
      toValue: 1,
      damping: 16,
      stiffness: 110,
      useNativeDriver: true,
    });
    animation.start();
    return () => {
      active = false;
      animation.stop();
    };
  }, [intro]);
  const animateTransition = (next) => {
    Animated.timing(form, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      next();
      Animated.timing(form, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    });
  };
  const handleLogin = async (email, password, remember) => {
    if (isSubmitting) return;
    if (!email || !password)
      return setNotice({ type: 'error', message: 'Please enter your email and password.' });
    if (!/^\S+@\S+\.\S+$/.test(email))
      return setNotice({ type: 'error', message: 'Enter a valid email address.' });
    setIsSubmitting(true);
    setNotice(null);
    try {
      await signInWithEmail(email, password);
      await saveCredentials(email, '', remember);
      setLoginEmail(email);
    } catch (cause) {
      setNotice({ type: 'error', message: cause.message || 'Sign-in failed. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleSignup = async (email, password, confirmPassword, agreeTerms) => {
    if (isSubmitting) return;
    if (!email || !password || !confirmPassword)
      return setNotice({ type: 'error', message: 'Please fill in all fields.' });
    if (!/^\S+@\S+\.\S+$/.test(email))
      return setNotice({ type: 'error', message: 'Enter a valid email address.' });
    if (password !== confirmPassword)
      return setNotice({ type: 'error', message: 'Passwords do not match.' });
    if (!agreeTerms)
      return setNotice({ type: 'error', message: 'Please agree to the Terms and Privacy Policy.' });
    setIsSubmitting(true);
    setNotice(null);
    try {
      const { session } = await signUpWithEmail(email, password);
      setLoginEmail(email);
      if (!session) {
        setNotice({
          type: 'success',
          message: 'Check your email to confirm your account, then sign in.',
        });
        animateTransition(() => setIsLogin(true));
      }
    } catch (cause) {
      setNotice({
        type: 'error',
        message: cause.message || 'Account creation failed. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleLogout = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setNotice(null);
    try {
      await signOut();
      await clearCredentials();
      setLoginEmail('');
    } catch (cause) {
      setNotice({
        type: 'error',
        message: cause.message || 'Could not sign out. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  if (initializing)
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#FF4F73" />
        <Text>Restoring your session...</Text>
      </View>
    );
  if (user)
    return (
      <ProfileScreen
        email={user.email || 'Signed-in account'}
        onLogout={handleLogout}
        isSigningOut={isSubmitting}
        error={notice?.type === 'error' ? notice.message : ''}
      />
    );
  return (
    <LinearGradient colors={['#541548', '#A72655', '#FF6B6B']} style={styles.screen}>
      <StatusBar barStyle="light-content" />
      <View style={styles.glowOne} />
      <View style={styles.glowTwo} />
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="automatic">
          <Animated.View
            style={[
              styles.brand,
              {
                opacity: intro,
                transform: [
                  { translateY: intro.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) },
                ],
              },
            ]}>
            <View style={styles.logo}>
              <Ionicons name="heart" size={31} color="#FF4F73" />
            </View>
            <View>
              <Text style={styles.appName}>DateMate</Text>
              <Text style={styles.tagline}>Meet safely. Connect genuinely.</Text>
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.card,
              {
                opacity: form,
                transform: [
                  { translateY: form.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) },
                ],
              },
            ]}>
            {notice || sessionError ? (
              <Text
                accessibilityRole="alert"
                style={[styles.notice, notice?.type === 'success' && styles.success]}>
                {notice?.message || sessionError}
              </Text>
            ) : null}
            {isLogin ? (
              <LoginScreen
                isSubmitting={isSubmitting}
                initialEmail={loginEmail}
                onLogin={handleLogin}
                onSwitch={() => animateTransition(() => setIsLogin(false))}
              />
            ) : (
              <SignupScreen
                isSubmitting={isSubmitting}
                onSignup={handleSignup}
                onSwitch={() => animateTransition(() => setIsLogin(true))}
              />
            )}
          </Animated.View>

          <View style={styles.safety}>
            <Ionicons name="shield-checkmark-outline" size={16} color="#FFDDE4" />
            <Text style={styles.safetyText}>
              For adults 18+ · Stay respectful and report suspicious behavior
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    backgroundColor: '#FFFFFF',
  },
  notice: { color: '#B42318', fontSize: 14, lineHeight: 20, marginBottom: 16 },
  success: { color: '#166534' },
  screen: { flex: 1 },
  scroll: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 44,
    paddingBottom: 28,
    gap: 22,
  },
  glowOne: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(255,190,178,0.13)',
    top: -80,
    right: -100,
  },
  glowTwo: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.07)',
    bottom: -90,
    left: -100,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingHorizontal: 4 },
  logo: {
    width: 58,
    height: 58,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: { color: '#FFFFFF', fontSize: 30, fontWeight: '900', letterSpacing: -0.8 },
  tagline: { color: '#FFDDE4', fontSize: 13, marginTop: 1 },
  card: {
    width: '100%',
    borderRadius: 30,
    padding: 24,
    backgroundColor: '#FFFFFF',
    boxShadow: '0 18px 45px rgba(52, 9, 42, 0.28)',
  },
  safety: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 8,
  },
  safetyText: {
    flexShrink: 1,
    color: '#FFDDE4',
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
  },
});
