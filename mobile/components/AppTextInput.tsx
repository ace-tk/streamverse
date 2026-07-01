import React from 'react';
import { StyleSheet } from 'react-native';
import { HelperText, TextInput, useTheme } from 'react-native-paper';

interface AppTextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  placeholder?: string;
}

export function AppTextInput({
  label,
  value,
  onChangeText,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  placeholder,
}: AppTextInputProps) {
  const theme = useTheme();

  return (
    <>
      <TextInput
        label={label}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        placeholder={placeholder}
        error={!!error}
        mode="outlined"
        style={styles.input}
        outlineStyle={styles.outline}
      />
      {error ? (
        <HelperText type="error" visible={!!error} style={styles.helper}>
          {error}
        </HelperText>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  input: {
    width: '100%',
    marginBottom: 4,
  },
  outline: {
    borderRadius: 12,
  },
  helper: {
    marginBottom: 4,
  },
});
