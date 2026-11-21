
import { StyleSheet, Text, View } from 'react-native';

type ProfileInfoRowProps = {
  label: string;
  value: string;
};

export default function ProfileInfoRow({
  label,
  value,
}: ProfileInfoRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || 'Not added yet'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#F2E7EA',
    gap: 12,
  },
  label: {
    color: '#888888',
    fontSize: 14,
    flex: 1,
  },
  value: {
    color: '#333333',
    fontSize: 14,
    fontWeight: '600',
    flex: 1.5,
    textAlign: 'right',
  },
});
