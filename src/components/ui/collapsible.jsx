import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export function Collapsible({ children, title }) {
  const [isOpen, setIsOpen] = useState(false);
  return <View style={styles.container}><Pressable style={styles.heading} onPress={() => setIsOpen((value) => !value)}><Ionicons name={isOpen ? 'chevron-down' : 'chevron-forward'} size={16} color="#6B666D"/><Text style={styles.title}>{title}</Text></Pressable>{isOpen && <View style={styles.content}>{children}</View>}</View>;
}

const styles = StyleSheet.create({ container: { width: '100%' }, heading: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 }, title: { fontSize: 15, fontWeight: '600', color: '#38343B' }, content: { padding: 12, marginLeft: 22, borderRadius: 12, backgroundColor: '#FFF7F7' } });
