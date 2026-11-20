
import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react';

import {
  type ChatMessage,
} from '../components/imports/ChatMessages';

import { useProfile } from './ProfileContext';

type Conversation = {
  id: string;
  participants: string[];
  messages: ChatMessage[];
};

type ChatContextType = {
  conversations: Record<string, ChatMessage[]>;
  accountConversations: Record<string, Conversation>;

  getSampleConversationId: (profileId: string) => string;
  startConversation: (profileId: string) => void;
  sendMessage: (profileId: string, text: string) => void;

  getConversationId: (otherUserId: string) => string;
  startAccountConversation: (otherUserId: string) => void;
  sendAccountMessage: (otherUserId: string, text: string) => void;
  hasBothSentMessages: (otherUserId: string) => boolean;
};

const ChatContext = createContext<ChatContextType | undefined>(
  undefined
);

type ChatProviderProps = {
  children: ReactNode;
};

export function ChatProvider({ children }: ChatProviderProps) {
  const { currentUserId } = useProfile();

  // Sample conversations are now separated by logged-in account
  const [conversations, setConversations] = useState<
    Record<string, ChatMessage[]>
  >({});

  // Shared conversations between real demo accounts
  const [accountConversations, setAccountConversations] = useState<
    Record<string, Conversation>
  >({});

  // Generate a unique conversation ID for each account and sample profile
  function getSampleConversationId(profileId: string) {
    if (!currentUserId || !profileId) {
      return '';
    }

    return `${currentUserId}_${profileId}`;
  }

  // Generate the same conversation ID for both real account participants
  function getConversationId(otherUserId: string) {
    if (!currentUserId) {
      return '';
    }

    return [currentUserId, otherUserId]
      .sort()
      .join('_');
  }

  // Start a sample-profile conversation for the current account
  function startConversation(profileId: string) {
    const conversationId = getSampleConversationId(profileId);

    if (!conversationId) {
      return;
    }

    setConversations((previous) => {
      if (previous[conversationId]) {
        return previous;
      }

      return {
        ...previous,
        [conversationId]: [],
      };
    });
  }

  // Send a message to a sample profile for the current account
  function sendMessage(profileId: string, text: string) {
    const trimmedMessage = text.trim();
    const conversationId = getSampleConversationId(profileId);

    if (!conversationId || !trimmedMessage) {
      return;
    }

    const newMessage: ChatMessage = {
      id: `${Date.now()}-${Math.random()}`,
      text: trimmedMessage,
      sender: 'me',
      time: new Date().toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
      }),
    };

    setConversations((previous) => ({
      ...previous,
      [conversationId]: [
        ...(previous[conversationId] || []),
        newMessage,
      ],
    }));
  }

  // Start or retrieve a shared account conversation
  function startAccountConversation(otherUserId: string) {
    if (
      !currentUserId ||
      !otherUserId ||
      currentUserId === otherUserId
    ) {
      return;
    }

    const conversationId = getConversationId(otherUserId);

    setAccountConversations((previous) => {
      if (previous[conversationId]) {
        return previous;
      }

      return {
        ...previous,
        [conversationId]: {
          id: conversationId,
          participants: [currentUserId, otherUserId],
          messages: [],
        },
      };
    });
  }

  // Send a message to another real demo account
  function sendAccountMessage(
    otherUserId: string,
    text: string
  ) {
    const trimmedMessage = text.trim();

    if (
      !currentUserId ||
      !otherUserId ||
      currentUserId === otherUserId ||
      !trimmedMessage
    ) {
      return;
    }

    const conversationId = getConversationId(otherUserId);

    const newMessage: ChatMessage = {
      id: `${Date.now()}-${Math.random()}`,
      text: trimmedMessage,
      senderId: currentUserId,
      time: new Date().toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
      }),
    };

    setAccountConversations((previous) => {
      const existingConversation = previous[conversationId];

      const conversation: Conversation = existingConversation ?? {
        id: conversationId,
        participants: [currentUserId, otherUserId],
        messages: [],
      };

      return {
        ...previous,
        [conversationId]: {
          ...conversation,
          messages: [
            ...conversation.messages,
            newMessage,
          ],
        },
      };
    });
  }

  // Check whether both participants have sent at least one message
  function hasBothSentMessages(otherUserId: string) {
    if (!currentUserId || !otherUserId) {
      return false;
    }

    const conversationId = getConversationId(otherUserId);
    const conversation = accountConversations[conversationId];

    if (!conversation) {
      return false;
    }

    return conversation.participants.every((participantId) =>
      conversation.messages.some(
        (message) => message.senderId === participantId
      )
    );
  }

  return (
    <ChatContext.Provider
      value={{
        conversations,
        accountConversations,
        getSampleConversationId,
        startConversation,
        sendMessage,
        getConversationId,
        startAccountConversation,
        sendAccountMessage,
        hasBothSentMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);

  if (!context) {
    throw new Error(
      'useChat must be used inside a ChatProvider'
    );
  }

  return context;
}
