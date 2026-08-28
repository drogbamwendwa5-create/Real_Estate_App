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
    onSurface: '#F8FAFC',
    onSurfaceVariant: '#CBD5E1',
    text: '#F8FAFC',
    error: '#F87171',
    success: '#34D399',
    warning: '#FBBF24',
    info: '#60A5FA',
    outline: '#475569',
  },
  roundness: 8,
};
