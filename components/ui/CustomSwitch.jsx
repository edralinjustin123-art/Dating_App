import React from 'react';
import { StyleSheet, Switch } from 'react-native';
export default function CustomSwitch({ value, onValueChange }) {
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: '#DED9E2', true: '#FF5C7A' }}
      thumbColor="#FFFFFF"
      ios_backgroundColor="#DED9E2"
      style={styles.switch}
    />
  );
}
const styles = StyleSheet.create({ switch: { transform: [{ scale: 0.78 }] } });
