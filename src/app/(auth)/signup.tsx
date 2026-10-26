
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

export default function SignupScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [age, setAge] = useState('');
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
                Your next connection starts here.
              </Text>
            </View>

            {/* Sign Up Form */}
            <View style={styles.formContainer}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.description}>
                Join Date-Mate and start meeting new people.
              </Text>

              <View style={styles.nameRow}>
                <View style={styles.nameField}>
                  <AuthInput
                    label="First Name"
                    placeholder="First name"
                    value={firstName}
                    onChangeText={setFirstName}
                    autoCapitalize="words"
                  />
                </View>

                <View style={styles.nameField}>
                  <AuthInput
                    label="Last Name"
                    placeholder="Last name"
                    value={lastName}
                    onChangeText={setLastName}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              <AuthInput
                label="Username"
                placeholder="Choose a username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />

              <AuthInput
                label="Age"
                placeholder="Enter your age"
                value={age}
                onChangeText={(text) =>
                  setAge(text.replace(/[^0-9]/g, ''))
                }
                keyboardType="number-pad"
              />

              <AuthInput
                label="Password"
                placeholder="Create a password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              {/* Remember me */}
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

                <Text style={styles.rememberText}>
                  Remember me on this device
                </Text>
              </TouchableOpacity>

              {/* Create Account */}
              <View style={styles.buttonContainer}>
                <AuthButton
                  title="Create Account"
                  onPress={() => router.replace('/(auth)/login')}
                />
              </View>

              {/* Login navigation */}
              <View style={styles.loginRow}>
                <Text style={styles.loginPrompt}>
                  Already have an account?
                </Text>

                <TouchableOpacity
                  onPress={() => router.replace('/(auth)/login')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.loginLink}> Log in</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.footer}>
              Make connections. Be yourself. ♥
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
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },

  brandContainer: {
    alignItems: 'center',
    marginBottom: 26,
  },

  logoCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFF0F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  logo: {
    fontSize: 29,
    color: '#E85D75',
  },

  brandName: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#E85D75',
  },

  tagline: {
    fontSize: 13,
    color: '#777777',
    marginTop: 4,
    textAlign: 'center',
  },

  formContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#252525',
  },

  description: {
    fontSize: 13,
    color: '#777777',
    lineHeight: 20,
    marginTop: 6,
    marginBottom: 22,
  },

  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },

  nameField: {
    flex: 1,
    minWidth: 0,
  },

  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: -2,
    marginBottom: 22,
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
    marginRight: 9,
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

  buttonContainer: {
    width: '100%',
  },

  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 22,
  },

  loginPrompt: {
    fontSize: 13,
    color: '#777777',
  },

  loginLink: {
    fontSize: 13,
    color: '#E85D75',
    fontWeight: 'bold',
  },

  footer: {
    fontSize: 12,
    color: '#AAAAAA',
    textAlign: 'center',
    marginTop: 25,
  },
});
