import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  ChatMessages,
  type ChatMessage,
} from '@/components/imports/ChatMessages';
import { InputChat } from '@/components/imports/InputChat';
import { MiniProfileChat } from '@/components/imports/MiniProfileChat';

export default function MatchScreen() {
  const [messageText, setMessageText] = useState('');

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: 'Hey! How are you?',
      sender: 'mate',
      time: '10:30 AM',
    },
    {
      id: '2',
      text: 'Hello! I am doing good. How about you?',
      sender: 'me',
      time: '10:31 AM',
    },
    {
      id: '3',
      text: 'I am good too! Nice to meet you.',
      sender: 'mate',
      time: '10:32 AM',
    },
  ]);

  function sendMessage() {
    const trimmedMessage = messageText.trim();

    if (trimmedMessage === '') {
      return;
    }

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text: trimmedMessage,
      sender: 'me',
      time: new Date().toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
      }),
    };

    setMessages((previousMessages) => [
      ...previousMessages,
      newMessage,
    ]);

    setMessageText('');
  }

  return (
    <SafeAreaView style={styles.background} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          {/* Chat Header */}
          <MiniProfileChat
            image={require('../../components/images/profile.png')}
            name="Juan"
            note="namimiss ka"
            isOnline={true}
          />

          {/* Conversation */}
          <View style={styles.mainChat}>
            {messages.length === 0 ? (
              <View style={styles.emptyChat}>
                <Text style={styles.emptyTitle}>
                  Start a conversation
                </Text>

                <Text style={styles.emptyText}>
                  Send a message to get to know your mate.
                </Text>
              </View>
            ) : (
              <ChatMessages messages={messages} />
            )}
          </View>

          {/* Message Input */}
          <InputChat
            value={messageText}
            onChangeText={setMessageText}
            onSend={sendMessage}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  keyboardContainer: {
    flex: 1,
  },

  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  mainChat: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  emptyChat: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
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
    lineHeight: 21,
  },
});
