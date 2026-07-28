module.exports = {
  preset: '@react-native/jest-preset',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|expo|@expo|react-native-reanimated|react-native-gesture-handler|react-native-safe-area-context|react-native-screens|react-native-maps|@react-native-async-storage|@react-native-community|react-native-paper|react-native-vector-icons|react-native-toast-message|react-native-skeleton-content|react-native-swiper|react-redux|@reduxjs|redux-persist|yup|react-hook-form|@hookform|axios)/)',
  ],
  moduleFileExtensions: ['js', 'jsx', 'json', 'ts', 'tsx'],
  testMatch: ['**/__tests__/**/*.test.js', '**/*.test.js'],
  collectCoverageFrom: ['**/*.{js,jsx}', '!**/node_modules/**', '!**/coverage/**'],
  coverageDirectory: 'coverage',
  verbose: true,
};