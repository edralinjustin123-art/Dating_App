import { StyleSheet, Text, View } from 'react-native';

export default function MatchScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Match, hi po</Text>
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