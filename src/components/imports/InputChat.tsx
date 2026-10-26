
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type InputChatProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
};

export function InputChat({
  value,
  onChangeText,
  onSend,
}: InputChatProps) {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Message..."
        placeholderTextColor="#999999"
        value={value}
        onChangeText={onChangeText}
        multiline
        maxLength={1000}
      />

      <TouchableOpacity
        style={[
          styles.sendButton,
          !value.trim() && styles.disabledButton,
        ]}
        onPress={onSend}
        disabled={!value.trim()}
        activeOpacity={0.8}
      >
        <Text style={styles.sendIcon}>➤</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 10,
  },

  input: {
    flex: 1,
    minHeight: 46,
    maxHeight: 110,
    backgroundColor: '#F5F5F7',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 15,
    color: '#222222',
  },

  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#E85D75',
    alignItems: 'center',
    justifyContent: 'center',
  },

  disabledButton: {
    backgroundColor: '#E8B9C2',
  },

  sendIcon: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
