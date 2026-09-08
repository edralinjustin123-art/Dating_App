import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

interface PasswordInputProps { label: string; value: string; onChangeText: (text: string) => void; placeholder: string; }

export default function PasswordInput({ label, value, onChangeText, placeholder }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  return <View style={styles.group}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.shell}>
      <Ionicons name="lock-closed-outline" size={20} color="#8A8493" />
      <TextInput style={styles.input} placeholder={placeholder} placeholderTextColor="#A9A4AF" value={value} onChangeText={onChangeText} secureTextEntry={!visible} autoCapitalize="none" autoCorrect={false} textContentType="password" accessibilityLabel={label} returnKeyType="done" />
      <Pressable hitSlop={10} onPress={() => setVisible((current) => !current)} accessibilityRole="button" accessibilityLabel={visible ? 'Hide password' : 'Show password'}>
        <Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={21} color="#77717F" />
      </Pressable>
    </View>
  </View>;
}

const styles = StyleSheet.create({
  group: { gap: 8 }, label: { color: '#2D2933', fontSize: 14, fontWeight: '600' },
  shell: { height: 56, borderRadius: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#F8F7FA', borderWidth: 1, borderColor: '#ECE9F0' },
  input: { flex: 1, height: '100%', color: '#211D26', fontSize: 16 },
});
