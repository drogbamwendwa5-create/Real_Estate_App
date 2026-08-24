// Global Jest setup for React Native testing.
// Provides mocks for native modules that are unavailable in the Jest environment.

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);