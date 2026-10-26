
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export type ChatMessage = {
  id: string;
  text: string;
  sender: 'me' | 'mate';
  time: string;
};

type ChatMessagesProps = {
  messages: ChatMessage[];
};

export function ChatMessages({ messages }: ChatMessagesProps) {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.messageList}
      showsVerticalScrollIndicator={false}
    >
      {messages.map((message) => {
        const isMine = message.sender === 'me';

        return (
          <View
            key={message.id}
            style={[
              styles.messageRow,
              isMine ? styles.myRow : styles.mateRow,
            ]}
          >
            <View
              style={[
                styles.bubble,
                isMine ? styles.myBubble : styles.mateBubble,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  isMine && styles.myMessageText,
                ]}
              >
                {message.text}
              </Text>

              <Text
                style={[
                  styles.time,
                  isMine && styles.myTime,
                ]}
              >
                {message.time}
              </Text>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },

  messageList: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },

  messageRow: {
    width: '100%',
    flexDirection: 'row',
    marginBottom: 14,
  },

  myRow: {
    justifyContent: 'flex-end',
  },

  mateRow: {
    justifyContent: 'flex-start',
  },

  bubble: {
    maxWidth: '82%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },

  myBubble: {
    backgroundColor: '#E85D75',
    borderBottomRightRadius: 5,
  },

  mateBubble: {
    backgroundColor: '#F2F2F5',
    borderBottomLeftRadius: 5,
  },

  messageText: {
    fontSize: 15,
    lineHeight: 21,
    color: '#292929',
  },

  myMessageText: {
    color: '#FFFFFF',
  },

  time: {
    fontSize: 10,
    color: '#888888',
    textAlign: 'right',
    marginTop: 5,
  },

  myTime: {
    color: '#FFE5EA',
  },
});
