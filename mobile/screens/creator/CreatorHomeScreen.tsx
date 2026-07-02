import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, Card, useTheme, Divider, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ScreenContainer } from '@/components/ScreenContainer';
import { PrimaryButton } from '@/components/PrimaryButton';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { LiveBadge } from '@/components/LiveBadge';
import { useAuth } from '@/contexts/AuthContext';
import { streamService } from '@/services/streamService';
import type { RootStackParamList } from '@/navigation/RootNavigator';
import type { Stream } from '@/types';

type Props = NativeStackScreenProps<RootStackParamList, 'CreatorHome'>;

export default function CreatorHomeScreen({ navigation }: Props) {
  const theme = useTheme();
  const { currentUser } = useAuth();

  // Fetch only LIVE streams owned by the current user
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['my-streams', currentUser?.id],
    queryFn: () => streamService.list({ status: 'LIVE' }),
    enabled: !!currentUser,
    refetchOnWindowFocus: true,
  });

  const myActiveStream: Stream | undefined = data?.items?.find(
    (s) => s.creator_id === currentUser?.id,
  );

  const totalViewers = myActiveStream?.viewer_count ?? 0;

  if (isLoading && !isRefetching) {
    return (
      <ScreenContainer>
        <LoadingIndicator fullScreen />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text
            variant="headlineMedium"
            style={[styles.greeting, { color: theme.colors.onBackground }]}
          >
            👋 Hello, {currentUser?.name?.split(' ')[0] ?? 'Creator'}
          </Text>
          <Text
            variant="bodyMedium"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            Ready to go live?
          </Text>
        </View>

        {/* Active stream card */}
        <Card
          style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]}
          elevation={0}
        >
          <Card.Content style={styles.cardContent}>
            <View style={styles.cardRow}>
              <Text variant="titleSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Active Stream
              </Text>
              {isLoading || isRefetching ? (
                <LoadingIndicator />
              ) : myActiveStream ? (
                <LiveBadge />
              ) : (
                <Chip icon="circle-outline" style={{ backgroundColor: theme.colors.surface }}>
                  Offline
                </Chip>
              )}
            </View>

            {myActiveStream ? (
              <>
                <Text
                  variant="titleMedium"
                  style={[styles.streamTitle, { color: theme.colors.onSurface }]}
                  numberOfLines={1}
                >
                  {myActiveStream.title}
                </Text>
                <Divider style={styles.divider} />
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text variant="headlineSmall" style={{ color: theme.colors.primary }}>
                      {totalViewers}
                    </Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      Viewers
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text variant="headlineSmall" style={{ color: theme.colors.primary }}>
                      {myActiveStream.category ?? '—'}
                    </Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      Category
                    </Text>
                  </View>
                </View>
                <PrimaryButton
                  label="Go to Live Dashboard"
                  onPress={() =>
                    navigation.navigate('LiveStream', { streamId: myActiveStream.id })
                  }
                  style={styles.liveBtn}
                />
              </>
            ) : (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="broadcast-off" size={48} color={theme.colors.onSurfaceVariant} style={{ opacity: 0.5, marginBottom: 8 }} />
                <Text
                  variant="bodyMedium"
                  style={[styles.noStream, { color: theme.colors.onSurfaceVariant }]}
                >
                  You don't have an active stream. Start one below!
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Quick actions */}
        <Text
          variant="titleMedium"
          style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
        >
          Quick Actions
        </Text>

        <PrimaryButton
          label="🎙  Create New Stream"
          onPress={() => navigation.navigate('StartStream')}
          style={styles.createBtn}
        />

        <PrimaryButton
          label="🔄  Refresh"
          onPress={() => refetch()}
          mode="outlined"
          style={styles.refreshBtn}
          loading={isRefetching}
        />

        <PrimaryButton
          label="← Back to Home"
          onPress={() => navigation.goBack()}
          mode="text"
        />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: 24,
    gap: 16,
    paddingBottom: 40,
  },
  header: {
    gap: 4,
    marginBottom: 8,
  },
  greeting: {
    fontWeight: '700',
  },
  card: {
    borderRadius: 16,
  },
  cardContent: {
    gap: 12,
    padding: 16,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  streamTitle: {
    fontWeight: '600',
  },
  divider: {
    marginVertical: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 32,
  },
  statItem: {
    alignItems: 'center',
    gap: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  noStream: {
    textAlign: 'center',
  },
  liveBtn: {
    marginTop: 4,
  },
  sectionTitle: {
    fontWeight: '600',
    marginTop: 8,
  },
  createBtn: {
    borderRadius: 14,
  },
  refreshBtn: {
    borderRadius: 14,
  },
});
