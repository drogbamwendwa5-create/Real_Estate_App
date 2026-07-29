import api from '../../Config/api';

class UserService {
  async getUsers(params = {}) {
    try {
      const response = await api.get('/users', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  async getUser(id) {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  async updateUser(id, data) {
    try {
      const response = await api.put(`/users/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  async deleteUser(id) {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  async updateProfile(data) {
    try {
      const response = await api.put('/users/profile', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  async deleteAccount() {
    try {
      const response = await api.delete('/users/account');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  async uploadAvatar(formData) {
    try {
      const response = await api.post('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
}

export default new UserService();
