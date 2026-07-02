import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, useTheme, Chip, Divider, Avatar } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ScreenContainer } from '@/components/ScreenContainer';
import { PrimaryButton } from '@/components/PrimaryButton';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { streamService } from '@/services/streamService';
import type { RootStackParamList } from '@/navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'StreamDetails'>;

export default function StreamDetailsScreen({ navigation, route }: Props) {
  const { streamId } = route.params;
  const theme = useTheme();

  const { data: stream, isLoading, isError, refetch } = useQuery({
    queryKey: ['stream', streamId],
    queryFn: () => streamService.getById(streamId),
    enabled: !!streamId,
  });

  if (isLoading) {
    return (
      <ScreenContainer>
        <LoadingIndicator fullScreen />
      </ScreenContainer>
    );
  }

  if (isError || !stream) {
    return (
      <ScreenContainer>
        <View style={styles.centerContainer}>
          <Text variant="titleMedium" style={{ color: theme.colors.error, marginBottom: 12 }}>
            Failed to load stream details
          </Text>
          <PrimaryButton label="Retry" onPress={() => refetch()} />
          <PrimaryButton label="Back" mode="text" onPress={() => navigation.goBack()} />
        </View>
      </ScreenContainer>
    );
  }

  const isLive = stream.status === 'LIVE';

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <PrimaryButton
            label="← Back"
            mode="text"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            fullWidth={false}
          />
          {isLive && (
            <Chip
              icon="broadcast"
              style={styles.liveBadge}
              textStyle={{ color: '#fff', fontWeight: '700' }}
            >
              LIVE
            </Chip>
          )}
        </View>

        <View style={styles.titleSection}>
          <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onBackground }]}>
            {stream.title}
          </Text>
          {stream.category && (
            <Chip compact style={[styles.categoryChip, { backgroundColor: theme.colors.surfaceVariant }]}>
              {stream.category}
            </Chip>
          )}
        </View>

        <Divider style={styles.divider} />

        <View style={styles.creatorSection}>
          <Avatar.Text 
            size={40} 
            label={stream.creator?.name ? stream.creator.name.substring(0, 2).toUpperCase() : '??'} 
            style={{ backgroundColor: theme.colors.primaryContainer }}
            labelStyle={{ color: theme.colors.onPrimaryContainer }}
          />
          <View style={styles.creatorInfo}>
            <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
              {stream.creator?.name ?? 'Unknown Creator'}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Started at {new Date(stream.started_at).toLocaleTimeString()}
            </Text>
          </View>
        </View>

        <View style={styles.statsSection}>
          <View style={[styles.statBox, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Text style={{ fontSize: 24, marginBottom: 4 }}>👁</Text>
            <Text variant="titleLarge" style={{ color: theme.colors.onSurface, fontWeight: '700' }}>
              {stream.viewer_count}
            </Text>
            <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Viewers
            </Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Text style={{ fontSize: 24, marginBottom: 4 }}>📅</Text>
            <Text variant="titleLarge" style={{ color: theme.colors.onSurface, fontWeight: '700' }}>
              {new Date(stream.started_at).toLocaleDateString()}
            </Text>
            <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Date
            </Text>
          </View>
        </View>

        {stream.description && (
          <View style={styles.descriptionSection}>
            <Text variant="titleMedium" style={{ color: theme.colors.onSurface, marginBottom: 8, fontWeight: '600' }}>
              About this stream
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, lineHeight: 22 }}>
              {stream.description}
            </Text>
          </View>
        )}

      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.colors.background }]}>
        <PrimaryButton
          label={isLive ? "🚀  Join Live Stream" : "Stream Ended"}
          onPress={() => navigation.navigate('LiveStream', { streamId: stream.id })}
          disabled={!isLive}
          style={styles.joinButton}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 100, // Space for footer
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    marginLeft: -12,
  },
  liveBadge: {
    backgroundColor: '#E53935',
  },
  titleSection: {
    gap: 12,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  title: {
    fontWeight: '800',
    lineHeight: 36,
  },
  categoryChip: {
    borderRadius: 8,
  },
  divider: {
    marginVertical: 16,
  },
  creatorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  creatorInfo: {
    flex: 1,
  },
  statsSection: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  descriptionSection: {
    marginTop: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(150, 150, 150, 0.2)',
  },
  joinButton: {
    borderRadius: 14,
    height: 56,
  },
});
