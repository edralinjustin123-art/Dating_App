
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import { useRouter } from 'expo-router';
import { useState } from 'react';

import DateMateCard from '../../components/imports/DateMateCard';
import { useChat } from '../../context/ChatContext';
import { useDiscovery } from '../../context/DiscoveryContext';
import { useProfile } from '../../context/ProfileContext';
import { profiles } from '../../data/profiles';

const profilePhoto = require('../../components/images/profile.png');

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const router = useRouter();

  const {
    isLiked,
    toggleLike,
    isSampleProfileOnline,
  } = useDiscovery();

  const { startConversation } = useChat();

  const {
    currentUserId,
    demoProfiles,
    isOnline,
  } = useProfile();

  const [currentIndex, setCurrentIndex] = useState(0);

  // Convert demo accounts into the same structure as sample profiles
  const accountProfiles = demoProfiles.map((account) => ({
    id: account.id,
    ...account.profile,
  }));

  // Combine sample profiles and real demo accounts
  // Hide the currently logged-in account
  const discoveryProfiles = [
    ...profiles,
    ...accountProfiles,
  ].filter((person) => person.id !== currentUserId);

  const currentProfile = discoveryProfiles[currentIndex];

  // Check whether the selected profile is a real demo account
  const isAccountProfile = currentProfile
    ? demoProfiles.some(
        (account) => account.id === currentProfile.id
      )
    : false;

  // Get the correct online status based on profile type
  const currentProfileIsOnline = currentProfile
    ? isAccountProfile
      ? isOnline(currentProfile.id)
      : isSampleProfileOnline(currentProfile.id)
    : false;

  const handleSkip = () => {
    setCurrentIndex((previousIndex) => previousIndex + 1);
  };

  const handlePrevious = () => {
    setCurrentIndex((previousIndex) =>
      Math.max(0, previousIndex - 1)
    );
  };

  const handleViewProfile = () => {
    if (!currentProfile) return;

    router.push({
      pathname: '/profile/[id]',
      params: { id: currentProfile.id },
    });
  };

  const handleMessage = () => {
    if (!currentProfile) return;

    // Sample profile conversation
    if (!isAccountProfile) {
      startConversation(currentProfile.id);
    }

    router.push({
      pathname: '/chat/[id]',
      params: { id: currentProfile.id },
    });
  };

  const handleStartOver = () => {
    setCurrentIndex(0);
  };

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={[
        styles.container,
        isDesktop && styles.desktopContainer,
      ]}
      showsVerticalScrollIndicator={isDesktop}
    >
      <View style={styles.header}>
        <Text style={styles.logo}>
          Date<Text style={styles.logoAccent}>Mate</Text>
        </Text>

        <Text style={styles.subtitle}>
          Find someone who makes every day special.
        </Text>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Discover People
        </Text>

        <Text style={styles.sectionSubtitle}>
          Meet people who share your interests
        </Text>
      </View>

      {currentProfile ? (
        <View style={styles.discoveryContainer}>
          <Text style={styles.counter}>
            Profile {currentIndex + 1} of {discoveryProfiles.length}
          </Text>

          <DateMateCard
            photo={profilePhoto}
            name={currentProfile.name}
            age={String(currentProfile.age)}
            gender={currentProfile.gender}
            status={
              currentProfileIsOnline ? 'Online' : 'Offline'
            }
            isOnline={currentProfileIsOnline}
            isLiked={isLiked(currentProfile.id)}
            onToggleLike={() =>
              toggleLike(currentProfile.id)
            }
            onSkip={handleSkip}
            onViewProfile={handleViewProfile}
            onMessage={handleMessage}
          />

          {currentIndex > 0 && (
            <TouchableOpacity
              style={styles.previousButton}
              onPress={handlePrevious}
            >
              <Text style={styles.previousButtonText}>
                ← Previous Profile
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={styles.endContainer}>
          <Text style={styles.endTitle}>
            You've seen everyone! 💗
          </Text>

          <Text style={styles.endSubtitle}>
            You've reached the end of the available profiles.
            You can go back and review them anytime.
          </Text>

          <TouchableOpacity
            style={styles.startOverButton}
            onPress={handleStartOver}
          >
            <Text style={styles.startOverButtonText}>
              Review Profiles
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.footer}>
        Your next connection could be just one tap away 💗
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  container: {
    flexGrow: 1,
    paddingTop: 30,
    paddingBottom: 24,
  },

  header: {
    paddingHorizontal: 22,
    marginBottom: 28,
  },

  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#292929',
  },

  logoAccent: {
    color: '#E85D75',
  },

  subtitle: {
    fontSize: 14,
    color: '#777777',
    marginTop: 6,
  },

  sectionHeader: {
    paddingHorizontal: 22,
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#252525',
  },

  sectionSubtitle: {
    fontSize: 13,
    color: '#888888',
    marginTop: 5,
  },

  discoveryContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },

  counter: {
    fontSize: 13,
    color: '#999999',
    marginBottom: 12,
  },

  previousButton: {
    marginTop: 18,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },

  previousButtonText: {
    color: '#E85D75',
    fontSize: 14,
    fontWeight: '600',
  },

  endContainer: {
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 50,
  },

  endTitle: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#252525',
    textAlign: 'center',
  },

  endSubtitle: {
    fontSize: 14,
    color: '#777777',
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 12,
    marginBottom: 22,
  },

  startOverButton: {
    backgroundColor: '#E85D75',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
  },

  startOverButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  footer: {
    textAlign: 'center',
    color: '#999999',
    fontSize: 12,
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 20,
  },

  desktopContainer: {
    paddingTop: 30,
    paddingBottom: 30,
  },
});
