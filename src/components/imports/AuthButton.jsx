
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Colors, Radius } from '../../constants/theme';

export function AuthButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
}) {
  const isPrimary = variant === 'primary';

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isPrimary ? styles.primaryButton : styles.secondaryButton,
        disabled && styles.disabledButton,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text
        style={[
          styles.buttonText,
          isPrimary ? styles.primaryText : styles.secondaryText,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    minHeight: 56,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    marginVertical: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },

  primaryButton: {
    backgroundColor: Colors.primary,
  },

  secondaryButton: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },

  disabledButton: {
    opacity: 0.5,
    backgroundColor: Colors.gray,
    borderColor: Colors.gray,
  },

  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  primaryText: {
    color: Colors.white,
  },

  secondaryText: {
    color: Colors.primary,
  },
});

