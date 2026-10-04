import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
export default function PasswordInput({ label, value, onChangeText, placeholder, errorMessage = '', maxLength, helperText }) {
  const [visible, setVisible] = useState(false);
  const inputRef = useRef(null);
  const focusedRef = useRef(false);
  const focusedOnPressRef = useRef(false);
  const resolvedHelper = helperText === undefined
    ? (label === 'Password' ? '8–10 characters, with a letter and a number or symbol.' : '')
    : helperText;
  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.shell}>
        <Ionicons name="lock-closed-outline" size={20} color="#8A8493" />
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#A9A4AF"
          value={value}
          maxLength={maxLength}
          onChangeText={onChangeText}
          secureTextEntry={!visible}
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="password"
          accessibilityLabel={label}
          returnKeyType="done"
          onFocus={() => { focusedRef.current = true; }}
          onBlur={() => { focusedRef.current = false; }}
        />
        <Pressable
          style={styles.toggle}
          hitSlop={10}
          onPressIn={() => { focusedOnPressRef.current = focusedRef.current; }}
          onPress={() => {
            setVisible((current) => !current);
            if (focusedOnPressRef.current) requestAnimationFrame(() => inputRef.current?.focus());
          }}
          accessibilityRole="button"
          accessibilityLabel={visible ? 'Hide password' : 'Show password'}>
          <Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={20} color="#8A8493" />
        </Pressable>
      </View>
      {errorMessage ? (
        <Text accessibilityRole="alert" style={styles.error}>{errorMessage}</Text>
      ) : resolvedHelper ? (
        <Text style={styles.hint}>{resolvedHelper}</Text>
      ) : null}
    </View>
  );
}
const styles = StyleSheet.create({
  group: { gap: 8 },
  label: { color: '#2D2933', fontSize: 14, fontWeight: '600' },
  shell: {
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F8F7FA',
    borderWidth: 1,
    borderColor: '#ECE9F0',
  },
  input: { flex: 1, height: '100%', color: '#211D26', fontSize: 16 },
  hint: { color: '#8A8493', fontSize: 12, lineHeight: 17 },
  error: { color: '#B42318', fontSize: 12, lineHeight: 17 },
  toggle: { width: 24, height: 28, alignItems: 'center', justifyContent: 'center' },
});
