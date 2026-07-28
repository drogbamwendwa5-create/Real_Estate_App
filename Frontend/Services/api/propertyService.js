import api from '../../Config/api';

class PropertyService {
  async getProperties(params) {
    try {
      const response = await api.get('/properties', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  async getProperty(id) {
    try {
      const response = await api.get(`/properties/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  async createProperty(data) {
    try {
      const response = await api.post('/properties', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  async updateProperty(id, data) {
    try {
      const response = await api.put(`/properties/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  async deleteProperty(id) {
    try {
      const response = await api.delete(`/properties/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  async getMyProperties() {
    try {
      const response = await api.get('/properties/my-properties');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  async getFeaturedProperties() {
    try {
      const response = await api.get('/properties/featured');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  async uploadImages(id, formData) {
    try {
      const response = await api.post(`/properties/${id}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  async searchProperties(params) {
    try {
      const response = await api.get('/properties', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
}

export default new PropertyService();