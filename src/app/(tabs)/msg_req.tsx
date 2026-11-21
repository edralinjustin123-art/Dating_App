
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useRouter } from 'expo-router';

import { useChat } from '../../context/ChatContext';
import { useDiscovery } from '../../context/DiscoveryContext';
import { useMate } from '../../context/MateContext';
import { useProfile } from '../../context/ProfileContext';
import { profiles } from '../../data/profiles';

export default function RequestsScreen() {
  const router = useRouter();

  const {
    currentUserId,
    demoProfiles,
    isOnline,
  } = useProfile();

  const {
    isSampleProfileOnline,
  } = useDiscovery();

  const { currentMateId } = useMate();

  const {
    conversations,
    accountConversations,
    getSampleConversationId,
  } = useChat();

  // Only include sample profiles with at least one message
  const requestIds = new Set<string>();

  profiles.forEach((profile) => {
    const conversationId = getSampleConversationId(
      String(profile.id)
    );

    if (
      conversationId &&
      (conversations[conversationId]?.length ?? 0) > 0
    ) {
      requestIds.add(String(profile.id));
    }
  });

  // Include real demo accounts only when their conversation
  // contains at least one message
  Object.values(accountConversations).forEach(
    (conversation) => {
      if (
        currentUserId &&
        conversation.participants.includes(currentUserId) &&
        conversation.messages.length > 0
      ) {
        const otherUserId = conversation.participants.find(
          (id) => id !== currentUserId
        );

        if (otherUserId) {
          requestIds.add(otherUserId);
        }
      }
    }
  );

  // Find the actual profile information
  const requestProfiles = Array.from(requestIds)
    .map((id) => {
      const sampleProfile = profiles.find(
        (person) => person.id === id
      );

      const accountProfile = demoProfiles.find(
        (person) => person.id === id
      );

      const profile = sampleProfile ?? accountProfile?.profile;

      if (!profile) {
        return null;
      }

      const isAccount = Boolean(accountProfile);

      return {
        id,
        name: profile.name,
        age: profile.age,
        isOnline: isAccount
          ? isOnline(id)
          : isSampleProfileOnline(id),
        messageCount: isAccount
          ? accountConversations[
              [currentUserId, id].sort().join('_')
            ]?.messages.length ?? 0
          : conversations[
              getSampleConversationId(id)
            ]?.length ?? 0,
      };
    })
    // Remove missing profiles and the currently accepted Mate
    .filter(
      (person): person is NonNullable<typeof person> =>
        person !== null &&
        person.id !== currentMateId
    );

  const openChat = (profileId: string) => {
    router.push({
      pathname: '/chat/[id]',
      params: { id: profileId },
    });
  };

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Message Requests</Text>

        <Text style={styles.subtitle}>
          People you've started a conversation with.
        </Text>
      </View>

      {requestProfiles.length > 0 ? (
        <View style={styles.list}>
          {requestProfiles.map((person) => (
            <TouchableOpacity
              key={person.id}
              style={styles.requestCard}
              onPress={() => openChat(person.id)}
              activeOpacity={0.8}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {person.name.charAt(0).toUpperCase()}
                </Text>
              </View>

              <View style={styles.profileInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.name}>
                    {person.name}, {person.age}
                  </Text>

                  <View
                    style={[
                      styles.statusDot,
                      person.isOnline && styles.onlineDot,
                    ]}
                  />
                </View>

                <Text style={styles.status}>
                  Conversation started
                </Text>

                <Text style={styles.messageInfo}>
                  {person.messageCount} messages
                </Text>

                <Text
                  style={[
                    styles.onlineStatus,
                    person.isOnline
                      ? styles.onlineText
                      : styles.offlineText,
                  ]}
                >
                  {person.isOnline ? 'Online' : 'Offline'}
                </Text>
              </View>

              <View style={styles.chatButton}>
                <Text style={styles.chatButtonText}>
                  Chat
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>💗</Text>

          <Text style={styles.emptyTitle}>
            No Message Requests Yet
          </Text>

          <Text style={styles.emptyDescription}>
            Send someone a message to see them here.
          </Text>
        </View>
      )}
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
    padding: 22,
    paddingTop: 35,
  },

  header: {
    marginBottom: 25,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#252525',
  },

  subtitle: {
    fontSize: 14,
    color: '#777777',
    marginTop: 7,
    lineHeight: 21,
  },

  list: {
    gap: 14,
  },

  requestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8FA',
    borderWidth: 1,
    borderColor: '#F5E7EB',
    borderRadius: 18,
    padding: 14,
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FCE8EC',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#E85D75',
  },

  profileInfo: {
    flex: 1,
    marginLeft: 13,
  },

  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#252525',
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#A0A0A0',
  },

  onlineDot: {
    backgroundColor: '#2EAD72',
  },

  status: {
    fontSize: 12,
    color: '#777777',
    marginTop: 4,
  },

  messageInfo: {
    fontSize: 11,
    color: '#999999',
    marginTop: 4,
  },

  onlineStatus: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },

  onlineText: {
    color: '#2EAD72',
  },

  offlineText: {
    color: '#A0A0A0',
  },

  chatButton: {
    backgroundColor: '#E85D75',
    paddingVertical: 9,
    paddingHorizontal: 17,
    borderRadius: 18,
  },

  chatButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingVertical: 70,
  },

  emptyIcon: {
    fontSize: 45,
    marginBottom: 15,
  },

  emptyTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#252525',
    textAlign: 'center',
  },

  emptyDescription: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 9,
  },
});
