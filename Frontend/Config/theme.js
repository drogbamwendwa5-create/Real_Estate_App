import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const customLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#2563EB',
    secondary: '#059669',
    accent: '#F59E0B',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    text: '#1E293B',
    error: '#DC2626',
    success: '#16A34A',
    warning: '#F59E0B',
    info: '#3B82F6',
  },
  roundness: 8,
};

export const customDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#60A5FA',
    secondary: '#34D399',
    accent: '#FBBF24',
    background: '#0F172A',
    surface: '#1E293B',
    text: '#F1F5F9',
    error: '#EF4444',
    success: '#22C55E',
    warning: '#F59E0B',
    info: '#60A5FA',
  },
  roundness: 8,
};
