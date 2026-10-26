import { router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthButton } from '@/components/imports/AuthButton';
import { AuthInput } from '@/components/imports/AuthInput';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            {/* Branding */}
            <View style={styles.brandContainer}>
              <View style={styles.logoCircle}>
                <Text style={styles.logo}>♥</Text>
              </View>

              <Text style={styles.brandName}>Date-Mate</Text>
              <Text style={styles.tagline}>
                Find someone worth knowing.
              </Text>
            </View>

            {/* Login form */}
            <View style={styles.formContainer}>
              <Text style={styles.title}>Welcome!</Text>
              <Text style={styles.description}>
                Log in to continue your journey.
              </Text>

              <View style={styles.fields}>
                <AuthInput
                  label="Username"
                  placeholder="Enter your username"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />

                <AuthInput
                  label="Password"
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              {/* Remember me and forgot password */}
              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={styles.rememberContainer}
                  onPress={() => setRememberMe(!rememberMe)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.checkbox,
                      rememberMe && styles.checkboxChecked,
                    ]}
                  >
                    {rememberMe && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </View>

                  <Text style={styles.rememberText}>Remember me</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {}}
                  activeOpacity={0.7}
                >
                  <Text style={styles.forgotText}>Forgot password?</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.buttonContainer}>
                <AuthButton
                  title="Continue"
                  onPress={() => router.replace('/(tabs)/home')}
                />
              </View>

              {/* Sign up navigation */}
              <View style={styles.signupRow}>
                <Text style={styles.signupPrompt}>
                  New to Date-Mate?
                </Text>

                <TouchableOpacity
                  onPress={() => router.push('/(auth)/signup')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.signupLink}> Sign up</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.footer}>
              Made for meaningful connections. ♥
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  keyboardContainer: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
  },

  container: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
    justifyContent: 'center',
  },

  brandContainer: {
    alignItems: 'center',
    marginBottom: 34,
  },

  logoCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#FFF0F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  logo: {
    fontSize: 34,
    color: '#E85D75',
  },

  brandName: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#E85D75',
  },

  tagline: {
    fontSize: 14,
    color: '#777777',
    marginTop: 5,
    textAlign: 'center',
  },

  formContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
  },

  title: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#252525',
  },

  description: {
    fontSize: 14,
    color: '#777777',
    marginTop: 7,
    marginBottom: 26,
  },

  fields: {
    width: '100%',
  },

  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    rowGap: 12,
    marginTop: -2,
    marginBottom: 24,
  },

  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  checkbox: {
    width: 19,
    height: 19,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#D5C7CB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  checkboxChecked: {
    backgroundColor: '#E85D75',
    borderColor: '#E85D75',
  },

  checkmark: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },

  rememberText: {
    color: '#555555',
    fontSize: 13,
  },

  forgotText: {
    color: '#E85D75',
    fontSize: 13,
    fontWeight: '600',
  },

  buttonContainer: {
    width: '100%',
  },

  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 24,
  },

  signupPrompt: {
    color: '#777777',
    fontSize: 14,
  },

  signupLink: {
    color: '#E85D75',
    fontSize: 14,
    fontWeight: 'bold',
  },

  footer: {
    textAlign: 'center',
    color: '#AAAAAA',
    fontSize: 12,
    marginTop: 30,
  },
});
