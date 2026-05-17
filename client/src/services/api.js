import axios from 'axios';

const API_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
});

// Add token to every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const authService = {
  register: (data) => apiClient.post('/auth/register', data),

  login: (data) => apiClient.post('/auth/login', data),

  getProfile: () => apiClient.get('/auth/profile'),

  updateProfile: async (data) => {
    const response = await apiClient.put(
      '/auth/profile',
      data,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response;
  },
};

export const userService = {
  listUsers: () => apiClient.get('/users/list'),
};

export const adminService = {
  listUsers: () => apiClient.get('/admin/users'),
  blockUser: (id) => apiClient.post(`/admin/users/${id}/block`),
  unblockUser: (id) => apiClient.post(`/admin/users/${id}/unblock`),
  removeUser: (id) => apiClient.delete(`/admin/users/${id}`),
};

export default apiClient;
