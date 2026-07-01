import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Button, useTheme } from 'react-native-paper';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  mode?: 'contained' | 'outlined' | 'text';
  style?: ViewStyle;
  fullWidth?: boolean;
}

export function PrimaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  mode = 'contained',
  style,
  fullWidth = true,
}: PrimaryButtonProps) {
  const theme = useTheme();

  return (
    <Button
      mode={mode}
      onPress={onPress}
      loading={loading}
      disabled={disabled || loading}
      style={[styles.button, fullWidth && styles.fullWidth, style]}
      contentStyle={styles.content}
      labelStyle={styles.label}
      buttonColor={mode === 'contained' ? theme.colors.primary : undefined}
    >
      {label}
    </Button>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    height: 52,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
