
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Colors, Radius, Spacing } from '../../constants/theme';

export function ChatMessages({ messages }) {
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
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    flexGrow: 1,
  },

  messageRow: {
    width: '100%',
    flexDirection: 'row',
    marginBottom: 12,
  },

  myRow: {
    justifyContent: 'flex-end',
  },

  mateRow: {
    justifyContent: 'flex-start',
  },

  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radius.lg,
  },

  myBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },

  mateBubble: {
    backgroundColor: Colors.surface,
    borderBottomLeftRadius: 4,
  },

  messageText: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.text,
  },

  myMessageText: {
    color: Colors.white,
  },

  time: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'right',
    marginTop: 4,
  },

  myTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
});

