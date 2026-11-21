
import {
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useChat } from '../../context/ChatContext';
import { useMate } from '../../context/MateContext';
import { useProfile } from '../../context/ProfileContext';

export default function MatchScreen() {
  const router = useRouter();

  const { currentUserId, demoProfiles, isOnline } = useProfile();

  const { currentMateId, unmate } = useMate();

  const { accountConversations } = useChat();

  // Find the currently accepted Mate
  const mateProfile = demoProfiles.find(
    (person) => person.id === currentMateId
  );

  // Check the accepted Mate's online status
  const mateIsOnline = mateProfile
    ? isOnline(mateProfile.id)
    : false;

  // Get the conversation with the accepted Mate
  const conversationId =
    currentUserId && currentMateId
      ? [currentUserId, currentMateId].sort().join('_')
      : '';

  const messages = conversationId
    ? accountConversations[conversationId]?.messages ?? []
    : [];

  const latestMessage = messages[messages.length - 1];

  const [showUnmateConfirmation, setShowUnmateConfirmation] =
    useState(false);

  const handleUnmate = () => {
    if (Platform.OS === 'web') {
      setShowUnmateConfirmation(true);
      return;
    }

    Alert.alert(
      'Unmate',
      `Are you sure you want to unmate ${mateProfile?.profile.name}? Your conversation history will be kept.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Unmate',
          style: 'destructive',
          onPress: unmate,
        },
      ]
    );
  };

  const confirmUnmate = () => {
    unmate();
    setShowUnmateConfirmation(false);
  };

  return (
    <SafeAreaView style={styles.background} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>My Mates</Text>

          <Text style={styles.subtitle}>
            Your accepted Mate
          </Text>
        </View>

        {!mateProfile ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💗</Text>

            <Text style={styles.emptyTitle}>
              No Mate Yet
            </Text>

            <Text style={styles.emptyText}>
              When you and another person both agree to become
              Mates, their profile will appear here.
            </Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.list}
          >
            <View style={styles.mateCard}>
              <Image
                source={require('../../components/images/profile.png')}
                style={styles.profileImage}
              />

              <Text style={styles.name}>
                {mateProfile.profile.name}
              </Text>

              <Text style={styles.age}>
                {mateProfile.profile.age} years old
              </Text>

              <View style={styles.statusRow}>
                <View
                  style={[
                    styles.statusDot,
                    mateIsOnline && styles.onlineDot,
                  ]}
                />

                <Text
                  style={[
                    styles.onlineStatus,
                    mateIsOnline
                      ? styles.onlineText
                      : styles.offlineText,
                  ]}
                >
                  {mateIsOnline ? 'Online' : 'Offline'}
                </Text>
              </View>

              <View style={styles.mateBadge}>
                <Text style={styles.mateBadgeText}>
                  💗 Your Mate
                </Text>
              </View>

              <Text style={styles.lastMessage}>
                {latestMessage
                  ? `Latest message: ${latestMessage.text}`
                  : 'Your conversation is ready!'}
              </Text>

              <Pressable
                style={styles.chatButton}
                onPress={() =>
                  router.push({
                    pathname: '/chat/[id]',
                    params: { id: mateProfile.id },
                  })
                }
              >
                <Text style={styles.chatButtonText}>
                  Open Conversation
                </Text>
              </Pressable>

              <Pressable
                style={styles.unmateButton}
                onPress={handleUnmate}
              >
                <Text style={styles.unmateButtonText}>
                  Unmate
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        )}
      </View>

      {showUnmateConfirmation && (
        <View style={styles.confirmationOverlay}>
          <View style={styles.confirmationCard}>
            <Text style={styles.confirmationTitle}>
              Unmate
            </Text>

            <Text style={styles.confirmationText}>
              Are you sure you want to unmate{' '}
              {mateProfile?.profile.name}? Your conversation
              history will be kept.
            </Text>

            <View style={styles.confirmationButtons}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => setShowUnmateConfirmation(false)}
              >
                <Text style={styles.cancelButtonText}>
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                style={styles.confirmButton}
                onPress={confirmUnmate}
              >
                <Text style={styles.confirmButtonText}>
                  Unmate
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  header: {
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
  },

  title: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#292929',
  },

  subtitle: {
    fontSize: 14,
    color: '#888888',
    marginTop: 5,
  },

  list: {
    padding: 20,
    flexGrow: 1,
  },

  mateCard: {
    alignItems: 'center',
    backgroundColor: '#FFF8FA',
    borderWidth: 1,
    borderColor: '#F5E7EB',
    borderRadius: 22,
    padding: 24,
    marginTop: 10,
  },

  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#FCE8EC',
    marginBottom: 16,
  },

  name: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#292929',
  },

  age: {
    fontSize: 14,
    color: '#888888',
    marginTop: 5,
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#A0A0A0',
  },

  onlineDot: {
    backgroundColor: '#2EAD72',
  },

  onlineStatus: {
    fontSize: 12,
    fontWeight: '600',
  },

  onlineText: {
    color: '#2EAD72',
  },

  offlineText: {
    color: '#A0A0A0',
  },

  mateBadge: {
    backgroundColor: '#FCE8EC',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 15,
  },

  mateBadgeText: {
    fontSize: 13,
    color: '#E85D75',
    fontWeight: 'bold',
  },

  lastMessage: {
    fontSize: 13,
    color: '#777777',
    textAlign: 'center',
    marginTop: 22,
    marginBottom: 20,
  },

  chatButton: {
    width: '100%',
    backgroundColor: '#E85D75',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },

  chatButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },

  unmateButton: {
    width: '100%',
    backgroundColor: '#FCE8EC',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },

  unmateButtonText: {
    color: '#E85D75',
    fontSize: 14,
    fontWeight: 'bold',
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 35,
  },

  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#292929',
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 22,
  },

  confirmationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
    zIndex: 10,
  },

  confirmationCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
  },

  confirmationTitle: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#292929',
    textAlign: 'center',
  },

  confirmationText: {
    fontSize: 14,
    color: '#777777',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 12,
  },

  confirmationButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },

  cancelButton: {
    flex: 1,
    backgroundColor: '#F2F2F2',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },

  cancelButtonText: {
    color: '#555555',
    fontWeight: 'bold',
  },

  confirmButton: {
    flex: 1,
    backgroundColor: '#E85D75',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },

  confirmButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
