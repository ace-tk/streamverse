import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { ScreenContainer } from '@/components/ScreenContainer';
import { PrimaryButton } from '@/components/PrimaryButton';

export default function HomeScreen() {
  const theme = useTheme();

  return (
    <ScreenContainer>
      <View style={styles.container}>
        {/* Branding */}
        <View style={styles.hero}>
          <View style={[styles.logoMark, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.logoText}>SV</Text>
          </View>
          <Text
            variant="displaySmall"
            style={[styles.appTitle, { color: theme.colors.primary }]}
          >
            StreamVerse
          </Text>
          <Text
            variant="bodyLarge"
            style={[styles.tagline, { color: theme.colors.onSurfaceVariant }]}
          >
            Real-Time Live Event Broadcasting
          </Text>
        </View>

        {/* Role selector */}
        <View style={styles.actions}>
          <Text
            variant="titleMedium"
            style={[styles.selectRole, { color: theme.colors.onSurface }]}
          >
            Who are you today?
          </Text>

          <PrimaryButton
            label="🎙  I'm a Creator"
            onPress={() => {}}
            style={styles.btn}
          />

          <PrimaryButton
            label="👁  I'm a Viewer"
            onPress={() => {}}
            mode="outlined"
            style={styles.btn}
          />
        </View>

        <Text
          variant="bodySmall"
          style={[styles.footer, { color: theme.colors.outline }]}
        >
          StreamVerse © {new Date().getFullYear()}
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  logoMark: {
    width: 80,
    height: 80,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#6C63FF',
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
  },
  appTitle: {
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  tagline: {
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  actions: {
    gap: 14,
    marginBottom: 8,
  },
  selectRole: {
    textAlign: 'center',
    marginBottom: 4,
    fontWeight: '600',
  },
  btn: {
    borderRadius: 14,
  },
  footer: {
    textAlign: 'center',
    marginTop: 8,
  },
});
