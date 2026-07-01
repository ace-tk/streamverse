import { MD3DarkTheme, MD3LightTheme, adaptNavigationTheme } from 'react-native-paper';
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationLightTheme,
} from '@react-navigation/native';

const { LightTheme, DarkTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationLightTheme,
  reactNavigationDark: NavigationDarkTheme,
});

export const CombinedLightTheme = {
  ...MD3LightTheme,
  ...LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...LightTheme.colors,
    primary: '#6C63FF',
    secondary: '#FF6584',
    background: '#F8F9FA',
    surface: '#FFFFFF',
    onPrimary: '#FFFFFF',
  },
};

export const CombinedDarkTheme = {
  ...MD3DarkTheme,
  ...DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...DarkTheme.colors,
    primary: '#7C73FF',
    secondary: '#FF6584',
    background: '#0F0F14',
    surface: '#1A1A24',
    onPrimary: '#FFFFFF',
  },
};

export type AppTheme = typeof CombinedLightTheme;
