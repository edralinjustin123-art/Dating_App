import { StyleSheet, Text, View } from 'react-native';

export default function RequestsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Message Requests</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
});