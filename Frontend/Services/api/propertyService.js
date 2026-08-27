import api from '../../Config/api';
import { Image } from 'expo-image';

const propertyCache = new Map();
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes

class PropertyService {
  getCachedAggregatedProperties(params = {}) {
    const key = JSON.stringify(params);
    const cached = propertyCache.get(key);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
      return cached.data;
    }
    return null;
  }

  async getProperties(params) {
    try {
      const response = await api.get('/properties', { params });
      return response.data;
    } catch (error) {
      const errorMessage = error?.response?.data?.error || error?.message || error?.toString() || 'Unknown error';
      throw new Error(errorMessage);
    }
  }

  async getAggregatedProperties(params = {}, options = {}) {
    const key = JSON.stringify(params);
    if (!options.skipCache) {
      const cached = propertyCache.get(key);
      if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
        return cached.data;
      }
    }

    try {
      const response = await api.get('/property-aggregation/properties', { params });
      const data = response.data;

      // Save to memory cache
      propertyCache.set(key, {
        timestamp: Date.now(),
        data,
      });

      // Prefetch first few property images in background for top-down instant rendering
      const list = data?.data || data?.properties || (Array.isArray(data) ? data : []);
      if (Array.isArray(list)) {
        list.slice(0, 8).forEach((item) => {
          const img = item?.image || (item?.images && item.images[0]);
          const url = typeof img === 'string' ? img : img?.url || img?.src;
          if (url && typeof url === 'string') {
            Image.prefetch(url).catch(() => {});
          }
        });
      }

      return data;
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