
import { useEffect, useState } from 'react';

import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useLocalSearchParams, useRouter } from 'expo-router';

import { useChat } from '../../context/ChatContext';
import { useDiscovery } from '../../context/DiscoveryContext';
import { useMate } from '../../context/MateContext';
import { useProfile } from '../../context/ProfileContext';
import { profiles } from '../../data/profiles';

import { ChatMessages } from '../../components/imports/ChatMessages';
import { InputChat } from '../../components/imports/InputChat';
import { MiniProfileChat } from '../../components/imports/MiniProfileChat';

export default function ChatScreen() {
  const router = useRouter();

  const {
    id,
  } = useLocalSearchParams<{
    id?: string | string[];
  }>();

  const profileId = Array.isArray(id) ? id[0] : id;

  const { currentUserId, demoProfiles, isOnline } = useProfile();

  const { isSampleProfileOnline } = useDiscovery();

  const {
  conversations,
  accountConversations,
  getSampleConversationId,
  startAccountConversation,
  sendAccountMessage,
  startConversation,
  sendMessage,
  hasBothSentMessages,
} = useChat();

  const {
    mates,
    currentMateId,
    hasAgreed,
    becomeMates,
  } = useMate();

  const [messageText, setMessageText] = useState('');

  // Check whether the selected ID belongs to a real demo account
  const account = demoProfiles.find(
    (person) => person.id === profileId
  );

  // Check whether the selected ID belongs to a sample profile
  const sampleProfile = profiles.find(
    (person) => String(person.id) === profileId
  );

  const isAccountChat = Boolean(account);

  const selectedProfile = account?.profile ?? sampleProfile;

  const isSelf = Boolean(
    account && account.id === currentUserId
  );

  // Determine the selected profile's online status
  const selectedProfileIsOnline = account
    ? isOnline(account.id)
    : sampleProfile
      ? isSampleProfileOnline(String(sampleProfile.id))
      : false;

  // Get the conversation ID for real account chats
  const conversationId =
    account && !isSelf
      ? [currentUserId, account.id].sort().join('_')
      : '';

  const accountMessages = conversationId
    ? accountConversations[conversationId]?.messages ?? []
    : [];

  const sampleConversationId = sampleProfile
  ? getSampleConversationId(String(sampleProfile.id))
  : '';

  const sampleMessages = sampleConversationId
    ? conversations[sampleConversationId] ?? []
    : [];

  // Start the correct conversation when opening the screen
  useEffect(() => {
    if (account && !isSelf) {
      startAccountConversation(account.id);
    }

    if (sampleProfile) {
      startConversation(String(sampleProfile.id));
    }
  }, [
    account?.id,
    isSelf,
    sampleProfile?.id,
    startAccountConversation,
    startConversation,
  ]);

  // Send a message
  const handleSend = () => {
    if (!selectedProfile || !messageText.trim()) {
      return;
    }

    if (account && !isSelf) {
      sendAccountMessage(account.id, messageText);
    } else if (sampleProfile) {
      sendMessage(String(sampleProfile.id), messageText);
    } else {
      return;
    }

    setMessageText('');
  };

  // Check Mate relationship status
  const bothSentMessages =
    account && !isSelf
      ? hasBothSentMessages(account.id)
      : false;

  const alreadyMates =
    Boolean(account && currentMateId === account.id);

  const userHasOtherMate =
    Boolean(currentMateId && currentMateId !== account?.id);

  const otherHasMate =
    Boolean(
      account &&
      mates[account.id] &&
      mates[account.id] !== currentUserId
    );

  const userAlreadyAgreed =
    account && !isSelf
      ? hasAgreed(account.id)
      : false;

  const handleBecomeMates = () => {
    if (!account || !bothSentMessages) {
      return;
    }

    becomeMates(account.id);
  };

  // Show instructions for sample profiles and accounts
  // that have not both sent a message yet.
  const showMateInstructions =
    Boolean(sampleProfile) ||
    Boolean(account && !isSelf && !bothSentMessages);

  // Invalid profile or trying to chat with yourself
  if (!selectedProfile || isSelf) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>

        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>
            {isSelf ? 'This Is Your Profile' : 'Profile Not Found'}
          </Text>

          <Text style={styles.errorMessage}>
            {isSelf
              ? 'You cannot start a conversation with yourself.'
              : 'Sorry, this conversation does not exist.'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const messages = isAccountChat
    ? accountMessages
    : sampleMessages;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>

        <MiniProfileChat
          image={require('../../components/images/profile.png')}
          name={selectedProfile.name}
          note={isAccountChat ? 'Demo account' : 'Local conversation'}
          isOnline={selectedProfileIsOnline}
        />

        {/* Mate instructions for sample profiles and eligible accounts */}
        {showMateInstructions && (
          <View style={styles.mateSection}>
            <View style={styles.mateStatus}>
              <Text style={styles.mateInfoText}>
                Both users must send at least one message before they
                can become Mates.
              </Text>
            </View>
          </View>
        )}

        {/* Mate agreement section - real demo accounts only */}
        {isAccountChat && bothSentMessages && (
          <View style={styles.mateSection}>
            {alreadyMates ? (
              <View style={styles.mateStatus}>
                <Text style={styles.mateStatusText}>
                  💗 You are Mates!
                </Text>
              </View>
            ) : userHasOtherMate ? (
              <View style={styles.mateStatus}>
                <Text style={styles.mateInfoText}>
                  You already have a Mate.
                </Text>
              </View>
            ) : otherHasMate ? (
              <View style={styles.mateStatus}>
                <Text style={styles.mateInfoText}>
                  This person already has a Mate.
                </Text>
              </View>
            ) : userAlreadyAgreed ? (
              <View style={styles.mateStatus}>
                <Text style={styles.mateStatusText}>
                  Waiting for {selectedProfile.name} to agree...
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.becomeMatesButton}
                onPress={handleBecomeMates}
              >
                <Text style={styles.becomeMatesText}>
                  💗 Become Mates
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={styles.messagesContainer}>
          <ChatMessages
            messages={messages}
            currentUserId={currentUserId}
          />
        </View>

        <InputChat
          value={messageText}
          onChangeText={setMessageText}
          onSend={handleSend}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  keyboardContainer: {
    flex: 1,
  },

  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  backText: {
    fontSize: 16,
    color: '#E85D75',
    fontWeight: '600',
  },

  mateSection: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  becomeMatesButton: {
    backgroundColor: '#E85D75',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },

  becomeMatesText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },

  mateStatus: {
    backgroundColor: '#FFF8FA',
    borderColor: '#F5E7EB',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },

  mateStatusText: {
    color: '#E85D75',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },

  mateInfoText: {
    color: '#777777',
    fontSize: 12,
    textAlign: 'center',
  },

  messagesContainer: {
    flex: 1,
  },

  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#252525',
    marginBottom: 8,
  },

  errorMessage: {
    fontSize: 14,
    color: '#777777',
    textAlign: 'center',
  },
});
