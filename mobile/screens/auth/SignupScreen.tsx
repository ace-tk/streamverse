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

type Props = NativeStackScreenProps<RootStackParamList, 'Signup'>;

const signupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupScreen({ navigation }: Props) {
  const theme = useTheme();
  const { signup } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const onSubmit = async (data: SignupFormData) => {
    setLoading(true);
    setError(null);
    try {
      await authService.signup(data);
      // Auto-login to obtain access_token
      const loginResponse = await authService.login({
        email: data.email,
        password: data.password,
      });
      await signup(loginResponse.access_token, loginResponse.user);
      // Navigation to Home happens automatically via RootNavigator auth state change
    } catch (err: any) {
      let errorMessage = 'Failed to sign up. Please try again.';
      
      console.log('--- SIGNUP ERROR DEBUG ---');
      console.log('Error message:', err.message);
      console.log('Error code:', err.code);
      console.log('Response status:', err.response?.status);
      console.log('Response data:', JSON.stringify(err.response?.data, null, 2));
      console.log('Request:', err.request ? 'Request was made' : 'No request object');
      console.log('Config URL:', err.config?.url);
      console.log('Config Method:', err.config?.method);
      console.log('Config BaseURL:', err.config?.baseURL);
      
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (typeof detail === 'string') {
          errorMessage = detail;
        } else if (Array.isArray(detail)) {
          // Extract FastAPI Pydantic validation errors
          errorMessage = detail.map((d: any) => d.msg.replace('Value error, ', '')).join('\\n');
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      console.log('Final displayed error:', errorMessage);
      console.log('--------------------------');
      
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
            Create Account
          </Text>
          <Text variant="bodyLarge" style={{ color: theme.colors.outline }}>
            Join StreamVerse today
          </Text>
        </View>

        <View style={styles.form}>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <AppTextInput
                label="Full Name"
                value={value}
                onChangeText={onChange}
                error={errors.name?.message}
                autoCapitalize="words"
              />
            )}
          />

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
            label="Create Account"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            style={styles.submitButton}
          />

          <PrimaryButton
            label="Already have an account? Login"
            onPress={() => navigation.replace('Login')}
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
