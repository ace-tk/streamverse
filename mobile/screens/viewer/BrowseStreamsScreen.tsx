import React, { useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Card, useTheme, Searchbar, Chip, Divider } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ScreenContainer } from '@/components/ScreenContainer';
import { PrimaryButton } from '@/components/PrimaryButton';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { streamService } from '@/services/streamService';
import type { RootStackParamList } from '@/navigation/RootNavigator';
import type { Stream } from '@/types';

type Props = NativeStackScreenProps<RootStackParamList, 'BrowseStreams'>;

export default function BrowseStreamsScreen({ navigation }: Props) {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  // ─── Fetch Streams ──────────────────────────────────────────────────────────
  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['live-streams'],
    queryFn: () => streamService.list({ status: 'LIVE' }),
    refetchOnWindowFocus: true,
  });

  // ─── Filter Streams Locally ─────────────────────────────────────────────────
  const filteredStreams = useMemo(() => {
    if (!data?.items) return [];
    if (!searchQuery.trim()) return data.items;
    
    const lowerQuery = searchQuery.toLowerCase();
    return data.items.filter(
      (stream) =>
        stream.title.toLowerCase().includes(lowerQuery) ||
        (stream.category && stream.category.toLowerCase().includes(lowerQuery)) ||
        (stream.creator?.name && stream.creator.name.toLowerCase().includes(lowerQuery))
    );
  }, [data?.items, searchQuery]);

  // ─── Render Items ───────────────────────────────────────────────────────────
  const renderItem = ({ item }: { item: Stream }) => (
    <Card
      style={styles.card}
      onPress={() => navigation.navigate('StreamDetails', { streamId: item.id })}
      mode="elevated"
      elevation={1}
    >
      <Card.Content style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text variant="titleMedium" style={styles.streamTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Chip
            icon="broadcast"
            style={styles.liveBadge}
            textStyle={{ color: '#fff', fontWeight: '700', fontSize: 10 }}
          >
            LIVE
          </Chip>
        </View>

        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }} numberOfLines={1}>
          {item.creator?.name ?? 'Unknown Creator'}
        </Text>

        <Divider style={styles.divider} />

        <View style={styles.cardFooter}>
          {item.category ? (
            <Chip compact style={{ backgroundColor: theme.colors.surfaceVariant }}>
              {item.category}
            </Chip>
          ) : (
            <View />
          )}
          <View style={styles.viewerBadge}>
            <Text style={{ fontSize: 12 }}>👁</Text>
            <Text variant="labelMedium" style={{ fontWeight: '600' }}>
              {item.viewer_count}
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  // ─── Error State ────────────────────────────────────────────────────────────
  if (isError && !data) {
    return (
      <ScreenContainer>
        <View style={styles.centerContainer}>
          <Text variant="titleMedium" style={{ color: theme.colors.error, marginBottom: 12 }}>
            Failed to load streams
          </Text>
          <PrimaryButton label="Retry" onPress={() => refetch()} loading={isRefetching} />
          <PrimaryButton label="Back to Home" mode="text" onPress={() => navigation.goBack()} />
        </View>
      </ScreenContainer>
    );
  }

  // ─── Loading State ──────────────────────────────────────────────────────────
  if (isLoading && !isRefetching) {
    return (
      <ScreenContainer>
        <LoadingIndicator fullScreen />
      </ScreenContainer>
    );
  }

  // ─── Main Render ────────────────────────────────────────────────────────────
  return (
    <ScreenContainer>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={{ fontWeight: '700', color: theme.colors.onBackground }}>
            Browse Streams
          </Text>
        </View>

        <Searchbar
          placeholder="Search by title, category, or creator"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          inputStyle={styles.searchInput}
          elevation={0}
        />

        <FlatList
          data={filteredStreams}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching && !isLoading}
              onRefresh={refetch}
              tintColor={theme.colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
                {searchQuery
                  ? "No streams match your search."
                  : "No live streams right now.\nCheck back later!"}
              </Text>
              {!searchQuery && (
                <PrimaryButton
                  label="Refresh"
                  mode="text"
                  onPress={() => refetch()}
                  style={{ marginTop: 12 }}
                />
              )}
            </View>
          }
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  searchbar: {
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
  },
  searchInput: {
    minHeight: 44,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12,
  },
  card: {
    borderRadius: 16,
  },
  cardContent: {
    padding: 16,
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  streamTitle: {
    fontWeight: '700',
    flex: 1,
  },
  liveBadge: {
    backgroundColor: '#E53935',
    height: 24,
  },
  divider: {
    marginVertical: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  emptyContainer: {
    paddingTop: 80,
    alignItems: 'center',
  },
});
