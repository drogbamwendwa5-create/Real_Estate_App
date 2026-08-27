import { Platform } from 'react-native';

// Dev machine LAN IP — used by physical devices / Expo Go.
// Update this if your Wi‑Fi IP changes (run: ipconfig → IPv4 Address).
const DEV_LAN_HOST = '192.168.0.29';
const DEV_API_URL = `http://${DEV_LAN_HOST}:5000/api`;

// Priority:
// 1. EXPO_APP_API_URL or EXPO_PUBLIC_API_URL environment variable
// 2. app.json extra via expo-constants
// 3. Platform-based defaults
const getApiUrl = () => {
  const envUrl = process.env.EXPO_APP_API_URL || process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) {
    return envUrl;
  }

  try {
    const Constants = require('expo-constants').default;
    const extra = Constants?.expoConfig?.extra;
    if (extra?.apiUrl || extra?.EXPO_APP_API_URL) {
      return extra.apiUrl || extra.EXPO_APP_API_URL;
    }
  } catch (e) {
    // expo-constants may not be available in all contexts
  }

  // In local development, connect to local backend (web: localhost, mobile: LAN IP)
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    if (Platform.OS === 'web') {
      return 'http://localhost:5000/api';
    }
    return DEV_API_URL;
  }

  // Expo Go on a physical phone cannot reach localhost or 10.0.2.2
  if (Platform.OS === 'android' || Platform.OS === 'ios') {
    return DEV_API_URL;
  }

  return 'https://real-estate-app-jvgi.onrender.com/api';
};

export const config = {
  apiUrl: getApiUrl(),
  mapsApiKey: process.env.EXPO_PUBLIC_MAPS_API_KEY || '',
  cloudinaryCloudName: process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
};

export default config;
