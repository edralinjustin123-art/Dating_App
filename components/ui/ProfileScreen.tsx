import React from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Gradients } from '../../constants/colors';

interface ProfileScreenProps {
  email: string;
  onLogout: () => void;
}

export default function ProfileScreen({ email, onLogout }: ProfileScreenProps) {
  return (
    <LinearGradient
      colors={Gradients.login as [string, string, ...string[]]}
      style={styles.container}
    >
      <View style={styles.profileContainer}>
        <BlurView intensity={30} style={styles.glassCard}>
          <Text style={styles.glassTitle}>DateMate</Text>
          <Text style={styles.welcomeText}>Welcome back!</Text>
          
          <View style={styles.profileInfo}>
            <Text style={styles.profileLabel}>Email</Text>
            <Text style={styles.profileValue}>{email}</Text>
          </View>
          
          <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </BlurView>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  glassCard: {
    borderRadius: 30,
    padding: 32,
    backgroundColor: 'rgba(43, 18, 76, 0.28)',
    borderWidth: 1,
    borderColor: 'rgba(255, 209, 102, 0.24)',
    overflow: 'hidden',
  },
  glassTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 20,
    color: '#FFE8B8',
    textAlign: 'center',
    marginBottom: 25,
  },
  profileInfo: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  profileLabel: {
    color: '#FFE8B8',
    fontSize: 13,
    marginBottom: 4,
  },
  profileValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  logoutBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
