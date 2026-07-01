import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { Surface, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

export function ScreenContainer({
  children,
  style,
  edges = ['top', 'bottom'],
}: ScreenContainerProps) {
  const theme = useTheme();

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.colors.background }, style]}
      edges={edges}
    >
      <Surface style={[styles.surface, { backgroundColor: theme.colors.background }]}>
        {children}
      </Surface>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  surface: {
    flex: 1,
  },
});
