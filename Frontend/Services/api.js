import axios from 'axios';
import config from '../Config';
import { getToken, removeToken, storeToken } from '../Utils/storage';

const api = axios.create({
  baseURL: config.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

api.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      await removeToken();
    }

    return Promise.reject(error);
  }
);

// Auth APIs
export const register = async (name, email, password, phone) => {
  const response = await api.post('/auth/register', { name, email, password, phone });
  if (response.data.token) {
    await storeToken(response.data.token);
  }
  return response.data;
};

export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  if (response.data.token) {
    await storeToken(response.data.token);
  }
  return response.data;
};

export const logout = async () => {
  await api.get('/auth/logout');
  await removeToken();
};

export const forgotPassword = async (email) => {
  return await api.post('/auth/forgot-password', { email });
};

export const resetPassword = async (token, password) => {
  return await api.put(`/auth/reset-password/${token}`, { password });
};

export const verifyEmail = async (token) => {
  return await api.get(`/auth/verify-email/${token}`);
};

export const updatePassword = async (currentPassword, newPassword) => {
  return await api.put('/auth/update-password', { currentPassword, newPassword });
};

export const updateUserDetails = async (data) => {
  return await api.put('/auth/updatedetails', data);
};

// Property APIs
export const getProperties = async (params = {}) => {
  const response = await api.get('/properties', { params });
  return response.data;
};

export const getProperty = async (id) => {
  const response = await api.get(`/properties/${id}`);
  return response.data;
};

export const createProperty = async (data) => {
  const response = await api.post('/properties', data);
  return response.data;
};

export const updateProperty = async (id, data) => {
  const response = await api.put(`/properties/${id}`, data);
  return response.data;
};

export const deleteProperty = async (id) => {
  return await api.delete(`/properties/${id}`);
};

export const getMyProperties = async () => {
  const response = await api.get('/properties/my-properties');
  return response.data;
};

export const getFeaturedProperties = async () => {
  const response = await api.get('/properties/featured');
  return response.data;
};

// Favourite APIs
export const getFavourites = async () => {
  const response = await api.get('/favourites');
  return response.data;
};

export const toggleFavourite = async (propertyId) => {
  return await api.post(`/favourites/${propertyId}`);
};

export const removeFromFavourites = async (propertyId) => {
  return await api.delete(`/favourites/${propertyId}`);
};

// Message APIs
export const getConversations = async () => {
  const response = await api.get('/messages/conversations');
  return response.data;
};

export const getMessages = async (conversationId) => {
  const response = await api.get(`/messages/${conversationId}`);
  return response.data;
};

export const sendMessage = async (data) => {
  const response = await api.post('/messages', data);
  return response.data;
};

export const markAsRead = async (conversationId) => {
  return await api.put(`/messages/${conversationId}/read`);
};

// Notification APIs
export const getNotifications = async () => {
  const response = await api.get('/notifications');
  return response.data;
};

export const markNotificationAsRead = async (id) => {
  return await api.put(`/notifications/${id}/read`);
};

export const markAllNotificationsAsRead = async () => {
  return await api.put('/notifications/read-all');
};

export default api;
