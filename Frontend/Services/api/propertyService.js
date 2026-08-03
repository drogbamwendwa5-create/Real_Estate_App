import api from '../../Config/api';

class PropertyService {
  async getProperties(params) {
    try {
      const response = await api.get('/properties', { params });
      return response.data;
    } catch (error) {
      const errorMessage = error?.response?.data?.error || error?.message || error?.toString() || 'Unknown error';
      throw new Error(errorMessage);
    }
  }

  async getAggregatedProperties(params) {
    try {
      console.log(api.defaults.baseURL);
      const response = await api.get('/property-aggregation/properties', { params });
      return response.data;
    } catch (error) {
      const errorMessage = error?.response?.data?.error || error?.message || error?.toString() || 'Unknown error';
      throw new Error(errorMessage);
    }
  }

  async getFeaturedAggregatedProperties(limit = 10) {
    try {
      const response = await api.get('/property-aggregation/properties/featured', { params: { limit } });
      return response.data;
    } catch (error) {
      const errorMessage = error?.response?.data?.error || error?.message || error?.toString() || 'Unknown error';
      throw new Error(errorMessage);
    }
  }

  async getAggregatedProperty(id) {
    try {
      const response = await api.get(`/property-aggregation/properties/${id}`);
      return response.data;
    } catch (error) {
      const errorMessage = error?.response?.data?.error || error?.message || error?.toString() || 'Unknown error';
      throw new Error(errorMessage);
    }
  }

  async createProperty(data) {
    try {
      const response = await api.post('/properties', data);
      return response.data;
    } catch (error) {
      const errorMessage = error?.response?.data?.error || error?.message || error?.toString() || 'Unknown error';
      throw new Error(errorMessage);
    }
  }

  async updateProperty(id, data) {
    try {
      const response = await api.put(`/properties/${id}`, data);
      return response.data;
    } catch (error) {
      const errorMessage = error?.response?.data?.error || error?.message || error?.toString() || 'Unknown error';
      throw new Error(errorMessage);
    }
  }

  async deleteProperty(id) {
    try {
      const response = await api.delete(`/properties/${id}`);
      return response.data;
    } catch (error) {
      const errorMessage = error?.response?.data?.error || error?.message || error?.toString() || 'Unknown error';
      throw new Error(errorMessage);
    }
  }

  async getMyProperties() {
    try {
      const response = await api.get('/properties/my-properties');
      return response.data;
    } catch (error) {
      const errorMessage = error?.response?.data?.error || error?.message || error?.toString() || 'Unknown error';
      throw new Error(errorMessage);
    }
  }

  async getFeaturedProperties() {
    try {
      const response = await api.get('/properties/featured');
      return response.data;
    } catch (error) {
      const errorMessage = error?.response?.data?.error || error?.message || error?.toString() || 'Unknown error';
      throw new Error(errorMessage);
    }
  }

  async uploadImages(id, formData) {
    try {
      const response = await api.post(`/properties/${id}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      const errorMessage = error?.response?.data?.error || error?.message || error?.toString() || 'Unknown error';
      throw new Error(errorMessage);
    }
  }

  async searchProperties(params) {
    try {
      const response = await api.get('/properties', { params });
      return response.data;
    } catch (error) {
      const errorMessage = error?.response?.data?.error || error?.message || error?.toString() || 'Unknown error';
      throw new Error(errorMessage);
    }
  }
}

export default new PropertyService();