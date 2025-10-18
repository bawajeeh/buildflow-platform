// Admin Dashboard API Services

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// User Management
export const userService = {
  async getUsers(page = 1, limit = 10): Promise<PaginatedResponse<any>> {
    const response = await api.get(`/admin/users?page=${page}&limit=${limit}`);
    return response.data;
  },

  async getUserById(id: string): Promise<any> {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  async updateUser(id: string, data: any): Promise<any> {
    const response = await api.put(`/admin/users/${id}`, data);
    return response.data;
  },

  async deleteUser(id: string): Promise<void> {
    await api.delete(`/admin/users/${id}`);
  },

  async banUser(id: string): Promise<void> {
    await api.post(`/admin/users/${id}/ban`);
  },

  async unbanUser(id: string): Promise<void> {
    await api.post(`/admin/users/${id}/unban`);
  },
};

// Website Management
export const websiteService = {
  async getWebsites(page = 1, limit = 10): Promise<PaginatedResponse<any>> {
    const response = await api.get(`/admin/websites?page=${page}&limit=${limit}`);
    return response.data;
  },

  async getWebsiteById(id: string): Promise<any> {
    const response = await api.get(`/admin/websites/${id}`);
    return response.data;
  },

  async updateWebsite(id: string, data: any): Promise<any> {
    const response = await api.put(`/admin/websites/${id}`, data);
    return response.data;
  },

  async deleteWebsite(id: string): Promise<void> {
    await api.delete(`/admin/websites/${id}`);
  },

  async moderateWebsite(id: string, action: 'approve' | 'reject', reason?: string): Promise<void> {
    await api.post(`/admin/websites/${id}/moderate`, { action, reason });
  },
};

// Platform Analytics
export const analyticsService = {
  async getPlatformStats(): Promise<any> {
    const response = await api.get('/admin/analytics/stats');
    return response.data;
  },

  async getAnalytics(period: string = '30d'): Promise<any> {
    const response = await api.get(`/admin/analytics?period=${period}`);
    return response.data;
  },

  async getRevenueAnalytics(period: string = '30d'): Promise<any> {
    const response = await api.get(`/admin/analytics/revenue?period=${period}`);
    return response.data;
  },

  async getUserGrowth(period: string = '30d'): Promise<any> {
    const response = await api.get(`/admin/analytics/users?period=${period}`);
    return response.data;
  },
};

// System Management
export const systemService = {
  async getSystemHealth(): Promise<any> {
    const response = await api.get('/admin/system/health');
    return response.data;
  },

  async getSystemMetrics(): Promise<any> {
    const response = await api.get('/admin/system/metrics');
    return response.data;
  },

  async getLogs(page = 1, limit = 50): Promise<PaginatedResponse<any>> {
    const response = await api.get(`/admin/system/logs?page=${page}&limit=${limit}`);
    return response.data;
  },

  async clearCache(): Promise<void> {
    await api.post('/admin/system/cache/clear');
  },

  async restartServices(): Promise<void> {
    await api.post('/admin/system/restart');
  },
};

// Template Management
export const templateService = {
  async getTemplates(): Promise<any[]> {
    const response = await api.get('/admin/templates');
    return response.data;
  },

  async createTemplate(data: any): Promise<any> {
    const response = await api.post('/admin/templates', data);
    return response.data;
  },

  async updateTemplate(id: string, data: any): Promise<any> {
    const response = await api.put(`/admin/templates/${id}`, data);
    return response.data;
  },

  async deleteTemplate(id: string): Promise<void> {
    await api.delete(`/admin/templates/${id}`);
  },

  async approveTemplate(id: string): Promise<void> {
    await api.post(`/admin/templates/${id}/approve`);
  },

  async rejectTemplate(id: string, reason: string): Promise<void> {
    await api.post(`/admin/templates/${id}/reject`, { reason });
  },
};

// Authentication
export const authService = {
  async login(email: string, password: string): Promise<any> {
    const response = await api.post('/admin/auth/login', { email, password });
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post('/admin/auth/logout');
  },

  async refreshToken(): Promise<any> {
    const response = await api.post('/admin/auth/refresh');
    return response.data;
  },

  async getProfile(): Promise<any> {
    const response = await api.get('/admin/auth/profile');
    return response.data;
  },

  async updateProfile(data: any): Promise<any> {
    const response = await api.put('/admin/auth/profile', data);
    return response.data;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.post('/admin/auth/change-password', {
      currentPassword,
      newPassword,
    });
  },
};

export default api;
