import React from 'react';
import { Stack } from 'expo-router';
import { LogBox } from 'react-native';

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
    (message.includes('useNativeDriver') && message.includes('not supported'))
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
    (message.includes('useNativeDriver') && message.includes('not supported'))
  ) {
    return;
  }
  originalError.apply(console, args);
};
console.warn = warnFilter;
console.error = errorFilter;
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { store, persistor } from '../store';
import { ThemeProvider } from '../Context/ThemeContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <PaperProvider>
              <StatusBar style="auto" />
              <Stack 
                screenOptions={{ 
                  headerShown: false,
                  animation: 'slide_from_right',
                  animationDuration: 300,
                }} 
              />
            </PaperProvider>
          </PersistGate>
        </Provider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};
