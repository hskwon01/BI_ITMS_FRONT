import api from './api';

export const getAllUsers = () => api.get('/users');

export const approveUser = (id, approve) => api.patch(`/users/${id}/approve`, { approve });

export const verifyPassword = (password) => api.post('/users/verify-password', { password });

export const updateProfile = (userData) => api.put('/users/profile', userData);
