import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { config } from './index';

const API_URL = process.env.EXPO_PUBLIC_API_URL || config.apiUrl || 'https://real-estate-app-jvgi.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let routerInstance = null;

export const setNavigation = (router) => {
  routerInstance = router;
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      if (routerInstance) {
        routerInstance.replace('/auth/login');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
