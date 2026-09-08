import React from 'react';
import { StyleSheet, Switch } from 'react-native';

interface CustomSwitchProps { value: boolean; onValueChange: (value: boolean) => void; }

export default function CustomSwitch({ value, onValueChange }: CustomSwitchProps) {
  return <Switch value={value} onValueChange={onValueChange} trackColor={{ false: '#DED9E2', true: '#FF5C7A' }} thumbColor="#FFFFFF" ios_backgroundColor="#DED9E2" style={styles.switch} />;
}

const styles = StyleSheet.create({ switch: { transform: [{ scale: 0.78 }] } });
