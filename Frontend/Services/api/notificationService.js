import api from '../../Config/api';

class NotificationService {
  async getNotifications() {
    try {
      const response = await api.get('/notifications');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  async getUnreadCount() {
    try {
      const response = await api.get('/notifications/unread-count');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  async markAsRead(id) {
    try {
      const response = await api.put(`/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  async markAllAsRead() {
    try {
      const response = await api.put('/notifications/read-all');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  async deleteNotification(id) {
    try {
      const response = await api.delete(`/notifications/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
}

export default new NotificationService();