import React from 'react';
import { LogBox } from 'react-native';
import { Stack } from 'expo-router';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { store, persistor } from '../store';
import { ThemeProvider, useTheme } from '../Context/ThemeContext';
import { FeatureFlagProvider } from '../Context/FeatureFlagContext';

// Suppress known third-party deprecation warnings from dependencies
LogBox.ignoreLogs([
  'props.pointerEvents is deprecated',
  '"shadow*" style props are deprecated',
  'useNativeDriver` is not supported',
]);
const originalWarn = console.warn;
const originalError = console.error;
const warnFilter = (...args) => {
  const message = args.map(arg => (typeof arg === 'string' ? arg : '')).join(' ');
  if (
    message.includes('props.pointerEvents is deprecated') ||
    message.includes('"shadow*" style props are deprecated') ||
    (message.includes('useNativeDriver') && message.includes('not supported')) ||
    message.includes('Text strings must be rendered within a <Text> component')
  ) {
    return;
  }
  originalWarn.apply(console, args);
};
const errorFilter = (...args) => {
  const message = args.map(arg => (typeof arg === 'string' ? arg : '')).join(' ');
  if (
    message.includes('props.pointerEvents is deprecated') ||
    message.includes('"shadow*" style props are deprecated') ||
    (message.includes('useNativeDriver') && message.includes('not supported')) ||
    message.includes('Text strings must be rendered within a <Text> component')
  ) {
    return;
  }
  originalError.apply(console, args);
};
console.warn = warnFilter;
console.error = errorFilter;

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <FeatureFlagProvider>
          <ThemedRoot />
        </FeatureFlagProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function ThemedRoot() {
  const { paperTheme, theme } = useTheme();

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <PaperProvider theme={paperTheme}>
          <StatusBar style="auto" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { paddingTop: 30, backgroundColor: theme.colors.background },
              animation: 'slide_from_right',
              animationDuration: 300,
            }}
          />
        </PaperProvider>
      </PersistGate>
    </Provider>
  );
}
