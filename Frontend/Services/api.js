import axios from 'axios';
import config from '../Config';
import { getToken, removeToken, removeUser, storeToken } from '../Utils/storage';

const api = axios.create({
  baseURL: config.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 3000000000,
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
    const isAuthRoute =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/register') ||
      originalRequest?.url?.includes('/feature-flags');

    if (error.response?.status === 401 && !originalRequest?._retry && !isAuthRoute) {
      originalRequest._retry = true;
      await removeToken();
    }

    return Promise.reject(error);
  }
);

// Auth APIs
export const register = async (name, email, password, phone) => {
  const response = await api.post('/auth/register', {
    name: name?.trim(),
    email: email?.trim()?.toLowerCase(),
    password,
    phone,
  });
  if (response.data.token) {
    await storeToken(response.data.token);
  }
  return response.data;
};

export const login = async (email, password, breakGlassPin) => {
  const payload = {
    email: email?.trim()?.toLowerCase(),
    password,
  };
  if (breakGlassPin) {
    payload.breakGlassPin = breakGlassPin;
  }
  const response = await api.post('/auth/login', payload);
  if (response.data.token) {
    await storeToken(response.data.token);
  }
  return response.data;
};

export const getFeatureFlags = async () => {
  try {
    const response = await api.get('/feature-flags');
    return response.data;
  } catch (err) {
    return { success: true, data: {} };
  }
};

export const logout = async () => {
  try {
    await api.get('/auth/logout');
  } catch (error) {
    // A local logout must still succeed if the device is offline or the session has expired.
    console.warn('Server logout request failed; clearing the local session instead.', error);
  } finally {
    await Promise.all([removeToken(), removeUser()]);
  }
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

export const deleteAccount = async (password) => {
  return await api.delete('/auth/delete-account', { data: { password } });
};

export const updateUserDetails = async (data) => {
  return await api.put('/auth/updatedetails', data);
};

export const getAdminDashboard = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

export const getAdminUsers = async (params = {}) => {
  const response = await api.get('/admin/users', { params });
  return response.data;
};

export const getAdminProperties = async (params = {}) => {
  const response = await api.get('/admin/properties', { params });
  return response.data;
};

export const getVerificationQueue = async (params = {}) => {
  const response = await api.get('/verification', { params });
  return response.data;
};

export const reviewVerification = async (id, data) => {
  const response = await api.put('/verification/' + id + '/review', data);
  return response.data;
};

export const getReports = async (params = {}) => {
  const response = await api.get('/reports', { params });
  return response.data;
};

export const getAuditActivity = async (params = {}) => {
  const response = await api.get('/activity', { params });
  return response.data;
};

export const updateAdminUser = async (id, data) => {
  const response = await api.put('/admin/users/' + id, data);
  return response.data;
};

export const updateAdminUserRole = updateAdminUser;
export const submitProfessionalApplication = async (data) => {
  const response = await api.post('/verification/professional', data);
  return response.data;
};

export const getMyVerification = async () => {
  const response = await api.get('/verification/mine');
  return response.data;
};

export const getSuperAdminOverview = async () => (await api.get('/super-admin/overview')).data;
export const getSuperAdminRoles = async () => (await api.get('/super-admin/roles')).data;
export const getSuperAdminFeatureFlags = async () => (await api.get('/super-admin/feature-flags')).data;
export const getSuperAdminSettings = async () => (await api.get('/super-admin/settings')).data;
export const getSuperAdminAnalytics = async (period = '30d') => (await api.get('/super-admin/analytics', { params: { period } })).data;
export const updateSuperAdminFeatureFlag = async (flag, value) => (await api.put('/super-admin/feature-flags', { flag, value })).data;
export const updateSuperAdminSettings = async settings => (await api.put('/super-admin/settings', settings)).data;
export const createSuperAdminBackup = async () => (await api.post('/super-admin/database/backup')).data;
export const manageAdminProperty = async (id, data) => (await api.put('/admin/properties/' + id, data)).data;

// Property APIs
export const getProperties = async (params = {}) => {
  try {
    const response = await api.get('/properties', { params });
    return response.data;
  } catch (error) {
    const errorMessage = error?.response?.data?.error || error?.message || 'Failed to fetch properties';
    throw new Error(errorMessage);
  }
};

export const getProperty = async (id) => {
  try {
    const response = await api.get(`/properties/${id}`);
    return response.data;
  } catch (error) {
    const errorMessage = error?.response?.data?.error || error?.message || 'Failed to fetch property';
    throw new Error(errorMessage);
  }
};

export const createProperty = async (data) => {
  try {
    const response = await api.post('/properties', data);
    return response.data;
  } catch (error) {
    const errorMessage = error?.response?.data?.error || error?.message || 'Failed to create property';
    throw new Error(errorMessage);
  }
};

export const updateProperty = async (id, data) => {
  try {
    const response = await api.put(`/properties/${id}`, data);
    return response.data;
  } catch (error) {
    const errorMessage = error?.response?.data?.error || error?.message || 'Failed to update property';
    throw new Error(errorMessage);
  }
};

export const deleteProperty = async (id) => {
  try {
    return await api.delete(`/properties/${id}`);
  } catch (error) {
    const errorMessage = error?.response?.data?.error || error?.message || 'Failed to delete property';
    throw new Error(errorMessage);
  }
};

export const getMyProperties = async () => {
  try {
    const response = await api.get('/properties/my-properties');
    return response.data;
  } catch (error) {
    const errorMessage = error?.response?.data?.error || error?.message || 'Failed to fetch my properties';
    throw new Error(errorMessage);
  }
};

export const getFeaturedProperties = async () => {
  try {
    const response = await api.get('/properties/featured');
    return response.data;
  } catch (error) {
    const errorMessage = error?.response?.data?.error || error?.message || 'Failed to fetch featured properties';
    throw new Error(errorMessage);
  }
};

// Property Aggregation APIs
export const getAggregatedProperties = async (params = {}) => {
  try {
    const response = await api.get('/property-aggregation/properties', { params });
    return response.data;
  } catch (error) {
    const errorMessage = error?.response?.data?.error || error?.message || 'Failed to fetch aggregated properties';
    throw new Error(errorMessage);
  }
};

export const getAggregatedProperty = async (id) => {
  try {
    const response = await api.get(`/property-aggregation/properties/${id}`);
    return response.data;
  } catch (error) {
    const errorMessage = error?.response?.data?.error || error?.message || 'Failed to fetch property details';
    throw new Error(errorMessage);
  }
};

export const getAggregatedFeatured = async (limit = 10) => {
  try {
    const response = await api.get('/property-aggregation/properties/featured', { params: { limit } });
    return response.data;
  } catch (error) {
    const errorMessage = error?.response?.data?.error || error?.message || 'Failed to fetch featured properties';
    throw new Error(errorMessage);
  }
};

export const getAggregatedRecommended = async (limit = 10) => {
  try {
    const response = await api.get('/property-aggregation/properties/recommended', { params: { limit } });
    return response.data;
  } catch (error) {
    const errorMessage = error?.response?.data?.error || error?.message || 'Failed to fetch recommendations';
    throw new Error(errorMessage);
  }
};

export const getAggregatedNearby = async (lat, lng, radius = 5000) => {
  try {
    const response = await api.get('/property-aggregation/properties/nearby', { params: { lat, lng, radius } });
    return response.data;
  } catch (error) {
    const errorMessage = error?.response?.data?.error || error?.message || 'Failed to fetch nearby properties';
    throw new Error(errorMessage);
  }
};

export const getAggregatedVerified = async (limit = 10) => {
  try {
    const response = await api.get('/property-aggregation/properties/verified', { params: { limit } });
    return response.data;
  } catch (error) {
    const errorMessage = error?.response?.data?.error || error?.message || 'Failed to fetch verified properties';
    throw new Error(errorMessage);
  }
};

export const getAggregatedSaved = async () => {
  try {
    const response = await api.get('/property-aggregation/properties/saved');
    return response.data;
  } catch (error) {
    const errorMessage = error?.response?.data?.error || error?.message || 'Failed to fetch saved properties';
    throw new Error(errorMessage);
  }
};

export const toggleAggregatedSaved = async (propertyId) => {
  try {
    return await api.post(`/property-aggregation/properties/saved/${propertyId}`);
  } catch (error) {
    const errorMessage = error?.response?.data?.error || error?.message || 'Failed to toggle saved property';
    throw new Error(errorMessage);
  }
};

export const getAggregatedSearchHistory = async () => {
  try {
    const response = await api.get('/property-aggregation/properties/history');
    return response.data;
  } catch (error) {
    const errorMessage = error?.response?.data?.error || error?.message || 'Failed to fetch search history';
    throw new Error(errorMessage);
  }
};

// Favourite APIs
export const getFavourites = async () => {
  try {
    const response = await api.get('/favourites');
    return response.data;
  } catch (error) {
    const errorMessage = error?.response?.data?.error || error?.message || 'Failed to fetch favourites';
    throw new Error(errorMessage);
  }
};

export const toggleFavourite = async (propertyId) => {
  try {
    return await api.post(`/favourites/${propertyId}`);
  } catch (error) {
    const errorMessage = error?.response?.data?.error || error?.message || 'Failed to toggle favourite';
    throw new Error(errorMessage);
  }
};

export const removeFromFavourites = async (propertyId) => {
  try {
    return await api.delete(`/favourites/${propertyId}`);
  } catch (error) {
    const errorMessage = error?.response?.data?.error || error?.message || 'Failed to remove from favourites';
    throw new Error(errorMessage);
  }
};

// Message APIs
export const getConversations = async () => {
  try {
    const response = await api.get('/messages/conversations');
    return response.data;
  } catch (error) {
    return { success: true, data: [] };
  }
};

export const getMessages = async (conversationId) => {
  if (!conversationId || conversationId === 'undefined' || conversationId === 'null') {
    return { success: true, data: [] };
  }
  try {
    const response = await api.get(`/messages/${conversationId}`);
    return response.data;
  } catch (error) {
    if (error?.response?.status === 400 || error?.response?.status === 404) {
      return { success: true, data: [] };
    }
    return { success: true, data: [] };
  }
};

export const sendMessage = async (data) => {
  try {
    const payload = {
      ...data,
      content: data?.content || data?.text,
      text: data?.text || data?.content,
    };
    const response = await api.post('/messages', payload);
    return response.data;
  } catch (error) {
    const errorMessage = error?.response?.data?.error || error?.message || 'Failed to send message';
    throw new Error(errorMessage);
  }
};

export const markAsRead = async (conversationId) => {
  if (!conversationId || conversationId === 'undefined' || conversationId === 'null') {
    return { success: true };
  }
  try {
    return await api.put(`/messages/${conversationId}/read`);
  } catch (error) {
    return { success: true };
  }
};

// Notification APIs
export const getNotifications = async () => {
  try {
    const response = await api.get('/notifications');
    return response.data;
  } catch (error) {
    const errorMessage = error?.response?.data?.error || error?.message || 'Failed to fetch notifications';
    throw new Error(errorMessage);
  }
};

export const markNotificationAsRead = async (id) => {
  try {
    return await api.put(`/notifications/${id}/read`);
  } catch (error) {
    const errorMessage = error?.response?.data?.error || error?.message || 'Failed to mark notification as read';
    throw new Error(errorMessage);
  }
};

export const markAllNotificationsAsRead = async () => {
  try {
    return await api.put('/notifications/read-all');
  } catch (error) {
    const errorMessage = error?.response?.data?.error || error?.message || 'Failed to mark all as read';
    throw new Error(errorMessage);
  }
};

export default api;
