
import { router, useLocalSearchParams } from 'expo-router';

import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import ProfileDetails from '../../components/imports/ProfileDetails';
import { useProfile } from '../../context/ProfileContext';
import { profiles } from '../../data/profiles';

export default function ProfileDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { demoProfiles } = useProfile();

  // Search the sample profiles
  const sampleProfile = profiles.find(
    (person) => String(person.id) === String(id)
  );

  // Search the real demo accounts
  const accountProfile = demoProfiles.find(
    (person) => person.id === String(id)
  );

  // Use whichever profile was found
  const profile = sampleProfile ?? accountProfile?.profile;

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Profile not found</Text>

        <Text style={styles.description}>
          Sorry, we couldn't find this profile.
          It may not exist.
        </Text>

        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>
            Go Back
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Pressable
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backButtonText}>
          ← Back
        </Text>
      </Pressable>

      <ProfileDetails profile={profile} />

      <Text style={styles.idText}>
        Profile ID: {id}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    padding: 24,
    paddingTop: 55,
  },

  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#FCE8EC',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    marginBottom: 24,
  },

  backButtonText: {
    color: '#E85D75',
    fontSize: 16,
    fontWeight: '600',
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#292929',
    marginBottom: 12,
  },

  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666666',
    marginBottom: 20,
  },

  idText: {
    fontSize: 13,
    color: '#999999',
    marginTop: 20,
  },
});
