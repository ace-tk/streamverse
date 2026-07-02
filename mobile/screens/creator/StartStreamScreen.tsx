import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, useTheme, Snackbar, SegmentedButtons } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ScreenContainer } from '@/components/ScreenContainer';
import { AppTextInput } from '@/components/AppTextInput';
import { PrimaryButton } from '@/components/PrimaryButton';
import { streamService } from '@/services/streamService';
import type { RootStackParamList } from '@/navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'StartStream'>;

const CATEGORIES = ['Gaming', 'Music', 'Education', 'Tech', 'Lifestyle', 'Sports', 'Other'];

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(120, 'Title too long'),
  description: z.string().max(500, 'Description too long').optional(),
  category: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function StartStreamScreen({ navigation }: Props) {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Gaming');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', description: '', category: 'Gaming' },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    try {
      const stream = await streamService.create({
        title: data.title,
        description: data.description,
        category: selectedCategory,
      });
      // Navigate to live dashboard passing the newly created stream id
      navigation.replace('LiveStream', { streamId: stream.id });
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setError(detail);
      } else if (Array.isArray(detail)) {
        setError(detail.map((d: any) => d.msg.replace('Value error, ', '')).join('\n'));
      } else {
        setError(err.message ?? 'Failed to create stream. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text
            variant="headlineMedium"
            style={[styles.title, { color: theme.colors.onBackground }]}
          >
            🎙 New Stream
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            Fill in the details and go live instantly.
          </Text>
        </View>

        {/* Stream Title */}
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, value } }) => (
            <AppTextInput
              label="Stream Title *"
              value={value}
              onChangeText={onChange}
              error={errors.title?.message}
              autoCapitalize="words"
            />
          )}
        />

        {/* Description */}
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, value } }) => (
            <AppTextInput
              label="Description (optional)"
              value={value ?? ''}
              onChangeText={onChange}
              error={errors.description?.message}
            />
          )}
        />

        {/* Category chips */}
        <Text variant="labelLarge" style={{ color: theme.colors.onSurface, marginTop: 8 }}>
          Category
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.categoryRow}>
            {CATEGORIES.map((cat) => (
              <PrimaryButton
                key={cat}
                label={cat}
                onPress={() => setSelectedCategory(cat)}
                mode={selectedCategory === cat ? 'contained' : 'outlined'}
                fullWidth={false}
                style={styles.catChip}
              />
            ))}
          </View>
        </ScrollView>

        {/* Visibility */}
        <Text variant="labelLarge" style={{ color: theme.colors.onSurface, marginTop: 12 }}>
          Visibility
        </Text>
        <SegmentedButtons
          value={visibility}
          onValueChange={(v) => setVisibility(v as 'public' | 'private')}
          buttons={[
            { value: 'public', label: '🌐 Public' },
            { value: 'private', label: '🔒 Private' },
          ]}
          style={styles.segmented}
        />

        {/* Submit */}
        <PrimaryButton
          label="🚀  Start Streaming"
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          style={styles.submitBtn}
        />

        <PrimaryButton
          label="Cancel"
          onPress={() => navigation.goBack()}
          mode="text"
          disabled={loading}
        />
      </ScrollView>

      <Snackbar
        visible={!!error}
        onDismiss={() => setError(null)}
        duration={4000}
        action={{ label: 'OK', onPress: () => setError(null) }}
      >
        {error}
      </Snackbar>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: 24,
    gap: 12,
    paddingBottom: 60,
  },
  header: {
    gap: 4,
    marginBottom: 8,
  },
  title: {
    fontWeight: '700',
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  catChip: {
    borderRadius: 20,
    paddingHorizontal: 4,
    minWidth: 0,
  },
  segmented: {
    marginVertical: 4,
  },
  submitBtn: {
    marginTop: 16,
    borderRadius: 14,
  },
});
