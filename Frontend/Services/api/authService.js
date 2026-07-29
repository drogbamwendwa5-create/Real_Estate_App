import api from '../../Config/api';

class AuthService {
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  async logout() {
    try {
      const response = await api.get('/auth/logout');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  async forgotPassword(email) {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  async resetPassword(token, password) {
    try {
      const response = await api.put(`/auth/reset-password/${token}`, { password });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  async verifyEmail(token) {
    try {
      const response = await api.get(`/auth/verify-email/${token}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  async getProfile() {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  async updateProfile(data) {
    try {
      const response = await api.put('/auth/updatedetails', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  async updatePassword(data) {
    try {
      const response = await api.put('/auth/update-password', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
}

export default new AuthService();
