import { useState, useEffect } from 'react';
import { login as loginApi, register as registerApi, logout as logoutApi, forgotPassword as forgotPasswordApi, resetPassword as resetPasswordApi, verifyEmail as verifyEmailApi, updatePassword as updatePasswordApi, updateUserDetails as updateUserDetailsApi } from '../Services/api';
import authService from '../Services/api/authService';
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
        const res = await authService.getProfile();
        setUser(res.user);
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
      return await forgotPasswordApi(email);
    },
    resetPassword: async (token, password) => {
      return await resetPasswordApi(token, password);
    },
    verifyEmail: async (token) => {
      return await verifyEmailApi(token);
    },
    updatePassword: async (currentPassword, newPassword) => {
      return await updatePasswordApi(currentPassword, newPassword);
    },
    updateUserDetails: async (data) => {
      const response = await updateUserDetailsApi(data);
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
