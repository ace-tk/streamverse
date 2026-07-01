import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { ScreenContainer } from '@/components/ScreenContainer';

export default function BrowseStreamsScreen() {
  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text variant="headlineMedium">Browse Streams</Text>
        <Text variant="bodyMedium">Coming soon…</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
});
