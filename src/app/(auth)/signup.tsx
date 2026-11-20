
import { router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
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
import { useProfile } from '@/context/ProfileContext';

export default function SignupScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const { registerAccount } = useProfile();

  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    username: '',
    age: '',
    gender: '',
    password: '',
    confirmPassword: '',
  });

  const handleSignup = () => {
    const newErrors = {
      firstName: firstName.trim()
        ? ''
        : 'Please enter your first name.',

      lastName: lastName.trim()
        ? ''
        : 'Please enter your last name.',

      username: username.trim()
        ? ''
        : 'Please choose a username.',

      age: '',

      gender: gender.trim()
        ? ''
        : 'Please enter your gender.',

      password: password
        ? ''
        : 'Please create a password.',

      confirmPassword: confirmPassword
        ? ''
        : 'Please confirm your password.',
    };

    const numericAge = Number(age);

    if (!age.trim()) {
      newErrors.age = 'Please enter your age.';
    } else if (!Number.isInteger(numericAge)) {
      newErrors.age = 'Please enter a valid whole number.';
    } else if (numericAge < 18) {
      newErrors.age = 'You must be at least 18 years old.';
    }

    if (
      password &&
      confirmPassword &&
      password !== confirmPassword
    ) {
      newErrors.confirmPassword =
        'Passwords do not match. Please try again.';
    }

    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some(
      (error) => error !== ''
    );

    if (hasErrors) return;

    const newProfile = {
      name: `${firstName.trim()} ${lastName.trim()}`,
      age: age.trim(),
      gender: gender.trim(),
      relationshipStatus: 'Not specified',
      aboutMe: '',
      favorites: '',
      hobbies: '',
      birthdate: '',
    };

    const registered = registerAccount(
      username,
      password,
      newProfile
    );

    if (!registered) {
      setErrors((previous) => ({
        ...previous,
        username:
          'This username is already taken. Please choose another.',
      }));
      return;
    }

    // Show the success popup after successful registration
    setShowSuccessModal(true);
  };

  const handleGoToLogin = () => {
    setShowSuccessModal(false);
    router.replace('/(auth)/login');
  };

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

              {/* First Name and Last Name */}
              <View style={styles.nameRow}>
                <View style={styles.nameField}>
                  <AuthInput
                    label="First Name"
                    placeholder="First name"
                    value={firstName}
                    onChangeText={(text) => {
                      setFirstName(text);
                      setErrors((previous) => ({
                        ...previous,
                        firstName: '',
                      }));
                    }}
                    autoCapitalize="words"
                  />

                  {errors.firstName !== '' && (
                    <Text style={styles.errorText}>
                      {errors.firstName}
                    </Text>
                  )}
                </View>

                <View style={styles.nameField}>
                  <AuthInput
                    label="Last Name"
                    placeholder="Last name"
                    value={lastName}
                    onChangeText={(text) => {
                      setLastName(text);
                      setErrors((previous) => ({
                        ...previous,
                        lastName: '',
                      }));
                    }}
                    autoCapitalize="words"
                  />

                  {errors.lastName !== '' && (
                    <Text style={styles.errorText}>
                      {errors.lastName}
                    </Text>
                  )}
                </View>
              </View>

              {/* Username */}
              <AuthInput
                label="Username"
                placeholder="Choose a username"
                value={username}
                onChangeText={(text) => {
                  setUsername(text);
                  setErrors((previous) => ({
                    ...previous,
                    username: '',
                  }));
                }}
                autoCapitalize="none"
              />

              {errors.username !== '' && (
                <Text style={styles.errorText}>
                  {errors.username}
                </Text>
              )}

              {/* Age */}
              <AuthInput
                label="Age"
                placeholder="Enter your age"
                value={age}
                onChangeText={(text) => {
                  setAge(text.replace(/[^0-9]/g, ''));
                  setErrors((previous) => ({
                    ...previous,
                    age: '',
                  }));
                }}
                keyboardType="number-pad"
              />

              {errors.age !== '' && (
                <Text style={styles.errorText}>
                  {errors.age}
                </Text>
              )}

              {/* Gender */}
              <AuthInput
                label="Gender"
                placeholder="Enter your gender"
                value={gender}
                onChangeText={(text) => {
                  setGender(text);
                  setErrors((previous) => ({
                    ...previous,
                    gender: '',
                  }));
                }}
                autoCapitalize="words"
              />

              {errors.gender !== '' && (
                <Text style={styles.errorText}>
                  {errors.gender}
                </Text>
              )}

              {/* Password */}
              <AuthInput
                label="Password"
                placeholder="Create a password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setErrors((previous) => ({
                    ...previous,
                    password: '',
                    confirmPassword: '',
                  }));
                }}
                secureTextEntry
              />

              {errors.password !== '' && (
                <Text style={styles.errorText}>
                  {errors.password}
                </Text>
              )}

              {/* Confirm Password */}
              <AuthInput
                label="Confirm Password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setErrors((previous) => ({
                    ...previous,
                    confirmPassword: '',
                  }));
                }}
                secureTextEntry
              />

              {errors.confirmPassword !== '' && (
                <Text style={styles.errorText}>
                  {errors.confirmPassword}
                </Text>
              )}

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
                  onPress={handleSignup}
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

      {/* Account Created Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.successIcon}>
              <Text style={styles.successCheck}>✓</Text>
            </View>

            <Text style={styles.modalTitle}>
              Account Created!
            </Text>

            <Text style={styles.modalMessage}>
              Your Date-Mate account has been successfully created.
              You can now log in using your new username and password.
            </Text>

            {/* Close Popup */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowSuccessModal(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.closeButtonText}>
                Close
              </Text>
            </TouchableOpacity>

            {/* Go to Login */}
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleGoToLogin}
              activeOpacity={0.8}
            >
              <Text style={styles.loginButtonText}>
                Go to Login
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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

  errorText: {
    color: '#D93025',
    fontSize: 12,
    marginTop: -12,
    marginBottom: 14,
    marginLeft: 2,
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

  // Success Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  modalContainer: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 26,
    alignItems: 'center',
  },

  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E8F8EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  successCheck: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#28A45B',
  },

  modalTitle: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#252525',
    textAlign: 'center',
    marginBottom: 10,
  },

  modalMessage: {
    fontSize: 14,
    color: '#777777',
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 24,
  },

  closeButton: {
    width: '100%',
    minHeight: 48,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#E85D75',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  closeButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#E85D75',
  },

  loginButton: {
    width: '100%',
    minHeight: 48,
    borderRadius: 13,
    backgroundColor: '#E85D75',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loginButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
