
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

type AuthButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
};

export function AuthButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
}: AuthButtonProps) {
  const isPrimary = variant === 'primary';

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isPrimary ? styles.primaryButton : styles.secondaryButton,
        disabled && styles.disabledButton,
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
    minHeight: 52,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },

  primaryButton: {
    backgroundColor: '#E85D75',
  },

  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E85D75',
  },

  disabledButton: {
    opacity: 0.5,
  },

  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  primaryText: {
    color: '#FFFFFF',
  },

  secondaryText: {
    color: '#E85D75',
  },
});
