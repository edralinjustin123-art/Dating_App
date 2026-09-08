import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

interface InputFieldProps {
  label: string; value: string; onChangeText: (text: string) => void; placeholder: string;
  secureTextEntry?: boolean; keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'; icon?: keyof typeof Ionicons.glyphMap;
}

export default function InputField({ label, value, onChangeText, placeholder, secureTextEntry = false, keyboardType = 'default', autoCapitalize = 'sentences', icon = 'mail-outline' }: InputFieldProps) {
  return <View style={styles.group}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.shell}>
      <Ionicons name={icon} size={20} color="#8A8493" />
      <TextInput style={styles.input} placeholder={placeholder} placeholderTextColor="#A9A4AF" value={value} onChangeText={onChangeText} secureTextEntry={secureTextEntry} keyboardType={keyboardType} autoCapitalize={autoCapitalize} autoCorrect={false} accessibilityLabel={label} returnKeyType="next" />
    </View>
  </View>;
}

const styles = StyleSheet.create({
  group: { gap: 8 }, label: { color: '#2D2933', fontSize: 14, fontWeight: '600' },
  shell: { height: 56, borderRadius: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#F8F7FA', borderWidth: 1, borderColor: '#ECE9F0' },
  input: { flex: 1, height: '100%', color: '#211D26', fontSize: 16 },
});
