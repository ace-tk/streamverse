import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Snackbar, useTheme } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ScreenContainer } from '@/components/ScreenContainer';
import { AppTextInput } from '@/components/AppTextInput';
import { PrimaryButton } from '@/components/PrimaryButton';
import { RootStackParamList } from '@/navigation/RootNavigator';
import { authService } from '@/services/authService';
import { useAuth } from '@/contexts/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen({ navigation }: Props) {
  const theme = useTheme();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(data);
      await login(response.access_token, response.user);
      // Navigation to Home happens automatically via RootNavigator auth state change
    } catch (err: any) {
      let errorMessage = 'Failed to login. Please try again.';
      
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (typeof detail === 'string') {
          errorMessage = detail;
        } else if (Array.isArray(detail)) {
          errorMessage = detail.map((d: any) => d.msg.replace('Value error, ', '')).join('\\n');
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text variant="headlineLarge" style={styles.title}>
            Welcome Back
          </Text>
          <Text variant="bodyLarge" style={{ color: theme.colors.outline }}>
            Login to continue
          </Text>
        </View>

        <View style={styles.form}>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <AppTextInput
                label="Email"
                value={value}
                onChangeText={onChange}
                error={errors.email?.message}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <AppTextInput
                label="Password"
                value={value}
                onChangeText={onChange}
                error={errors.password?.message}
                secureTextEntry
              />
            )}
          />

          <PrimaryButton
            label="Login"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            style={styles.submitButton}
          />

          <PrimaryButton
            label="Don't have an account? Sign Up"
            onPress={() => navigation.replace('Signup')}
            mode="text"
            disabled={loading}
          />
        </View>

        <Snackbar
          visible={!!error}
          onDismiss={() => setError(null)}
          duration={3000}
        >
          {error}
        </Snackbar>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  form: {
    gap: 8,
  },
  submitButton: {
    marginTop: 16,
    marginBottom: 8,
  },
});
