import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export function LiveBadge() {
  return (
    <View style={styles.badge}>
      <MaterialCommunityIcons name="broadcast" size={14} color="#fff" />
      <Text style={styles.text}>LIVE</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E53935',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
    alignSelf: 'flex-start',
  },
  text: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 12,
    lineHeight: 14,
    letterSpacing: 0.5,
  },
});
