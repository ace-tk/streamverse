import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { ScreenContainer } from '@/components/ScreenContainer';

export default function StreamDetailsScreen() {
  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text variant="headlineMedium">Stream Details</Text>
        <Text variant="bodyMedium">Coming soon…</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
});
