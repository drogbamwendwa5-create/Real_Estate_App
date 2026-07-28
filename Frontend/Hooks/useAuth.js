import { useState, useEffect } from 'react';
import { login as loginApi, register as registerApi, logout as logoutApi, forgotPassword, resetPassword, verifyEmail, updatePassword, updateUserDetails } from '../Services/api';
import { getToken, removeToken, storeToken } from '../Utils/storage';

// Standalone auth functions for direct use in screens
export const login = async (email, password) => {
  const data = await loginApi(email, password);
  return data;
};

export const register = async (name, email, password, phone) => {
  const data = await registerApi(name, email, password, phone);
  return data;
};

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = await getToken();
      if (token) {
        // Fetch user data
        // TODO: Implement getMe API call
      }
    } catch (error) {
      await removeToken();
    } finally {
      setLoading(false);
    }
  };

  const authActions = {
    login: async (email, password) => {
      const data = await loginApi(email, password);
      setUser(data.user);
      return data;
    },
    register: async (name, email, password, phone) => {
      const data = await registerApi(name, email, password, phone);
      setUser(data.user);
      return data;
    },
    logout: async () => {
      await logoutApi();
      setUser(null);
    },
    forgotPassword: async (email) => {
      return await forgotPassword(email);
    },
    resetPassword: async (token, password) => {
      return await resetPassword(token, password);
    },
    verifyEmail: async (token) => {
      return await verifyEmail(token);
    },
    updatePassword: async (currentPassword, newPassword) => {
      return await updatePassword(currentPassword, newPassword);
    },
    updateUserDetails: async (data) => {
      const response = await updateUserDetails(data);
      setUser(response.data);
      return response;
    },
  };

  return {
    user,
    loading,
    setUser,
    ...authActions,
  };
};
