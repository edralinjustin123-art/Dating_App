import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

export default function SocialButtons() {
  const unavailable = () => Alert.alert('Coming soon', 'Social sign-in will be connected with the backend.');
  return <View style={styles.container}>
    <Pressable style={({ pressed }) => [styles.button, pressed && styles.pressed]} onPress={unavailable}><Ionicons name="logo-google" size={20} color="#EA4335" /><Text style={styles.text}>Google</Text></Pressable>
    <Pressable style={({ pressed }) => [styles.button, pressed && styles.pressed]} onPress={unavailable}><Ionicons name="logo-apple" size={22} color="#151218" /><Text style={styles.text}>Apple</Text></Pressable>
  </View>;
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: 12 },
  button: { flex: 1, height: 50, borderRadius: 15, borderWidth: 1, borderColor: '#E7E3E9', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, backgroundColor: '#FFFFFF' },
  pressed: { opacity: 0.72 }, text: { color: '#2D2933', fontSize: 15, fontWeight: '600' },
});
