
import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ProfileDetails from '../../components/imports/ProfileDetails';
import { useProfile } from '../../context/ProfileContext';

export default function Profile() {
  const { profile, logout } = useProfile();
  const router = useRouter();

  const [isOnline, setIsOnline] = useState(true);

  if (!profile) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>My Profile</Text>
          <Text style={styles.subtitle}>
            Your space to show who you are.
          </Text>
        </View>

        {/* Reusable Profile Component */}
        <ProfileDetails
          profile={profile}
          isOnline={isOnline}
          onToggleOnline={() => setIsOnline(!isOnline)}
        />

        {/* Edit Profile Button */}
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push('/profile/edit')}
          activeOpacity={0.8}
        >
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Make connections. Be yourself. 💗
        </Text>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => {
            logout();
            router.replace('/(auth)/login');
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 30,
  },
  header: {
    marginBottom: 22,
  },
  title: {
    fontSize: 29,
    fontWeight: 'bold',
    color: '#252525',
  },
  subtitle: {
    fontSize: 14,
    color: '#777777',
    marginTop: 5,
  },
  editButton: {
    width: '100%',
    minHeight: 50,
    backgroundColor: '#E85D75',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  footerText: {
    color: '#999999',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 24,
  },
  logoutButton: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#E85D75',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  logoutButtonText: {
    color: '#E85D75',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
