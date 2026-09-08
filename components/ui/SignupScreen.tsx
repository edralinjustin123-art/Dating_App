import React, { useState } from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import InputField from './InputField';
import PasswordInput from './PasswordInput';
import CustomSwitch from './CustomSwitch';
import SocialButtons from './SocialButtons';
import { Gradients } from '../../constants/colors';

interface SignupScreenProps {
  onSwitch: () => void;
  onSignup: (email: string, password: string, confirmPassword: string, agreeTerms: boolean) => void;
}

export default function SignupScreen({ onSwitch, onSignup }: SignupScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  return (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>Create your DateMate account</Text>
      
      <InputField
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <PasswordInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="Enter your password"
      />

      <PasswordInput
        label="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Confirm your password"
      />

      <View style={styles.termsContainer}>
        <CustomSwitch
          value={agreeTerms}
          onValueChange={setAgreeTerms}
        />
        <Text style={styles.termsText}>
          Agree to <Text style={styles.termsLink}>Terms & Privacy</Text>
        </Text>
      </View>

      <TouchableOpacity 
        style={styles.glassButton} 
        onPress={() => onSignup(email, password, confirmPassword, agreeTerms)}
      >
        <LinearGradient
          colors={Gradients.button as [string, string, ...string[]]}
          style={styles.buttonGradient}
        >
          <Text style={styles.buttonText}>Sign Up</Text>
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>Or</Text>
        <View style={styles.divider} />
      </View>

      <SocialButtons />

      <TouchableOpacity onPress={onSwitch} style={styles.switchContainer}>
        <Text style={styles.switchText}>
          Already have an account? <Text style={styles.switchLink}>Log In</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    width: '100%',
    gap: 15,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#211D26',
    textAlign: 'left',
    marginBottom: 2,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: -8,
  },
  termsText: {
    color: '#625C68',
    fontSize: 14,
  },
  termsLink: {
    color: '#ED4567',
    fontWeight: '600',
  },
  glassButton: {
    borderRadius: 17,
    overflow: 'hidden',
  },
  buttonGradient: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#EBE7ED',
  },
  dividerText: {
    marginHorizontal: 15,
    color: '#98929E',
    fontSize: 13,
  },
  switchContainer: {
    marginTop: 2,
  },
  switchText: {
    textAlign: 'center',
    color: '#746E79',
    fontSize: 15,
  },
  switchLink: {
    color: '#ED4567',
    fontWeight: '700',
  },
});
