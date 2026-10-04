import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen({ email, onLogout, isSigningOut = false, error = '', successMessage = '' }) {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Home</Text>
      <Text style={styles.welcome}>Welcome to DateMate</Text>
      {successMessage ? <Text style={styles.success}>{successMessage}</Text> : null}
      {email ? <Text style={styles.email}>{email}</Text> : null}
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      <Pressable
        onPress={onLogout}
        disabled={isSigningOut}
        accessibilityRole="button"
        accessibilityState={{ disabled: isSigningOut, busy: isSigningOut }}
        style={styles.logout}>
        {isSigningOut ? <ActivityIndicator size="small" color="#555555" /> : <Text style={styles.logoutText}>Log Out</Text>}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#FFFFFF' },
  title: { color: '#222222', fontSize: 28, fontWeight: '700' },
  welcome: { marginTop: 8, color: '#444444', fontSize: 18 },
  email: { marginTop: 10, color: '#777777', fontSize: 14 },
  success: { marginTop: 14, color: '#166534', fontSize: 14 },
  error: { marginTop: 18, color: '#B42318', fontSize: 14, textAlign: 'center' },
  logout: { marginTop: 28, minHeight: 44, minWidth: 72, alignItems: 'center', justifyContent: 'center' },
  logoutText: { color: '#555555', fontSize: 15, textDecorationLine: 'underline' },
});
