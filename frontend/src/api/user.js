import API from './api';

export const getAllUsers = () => API.get('/users');

export const approveUser = (id, approve) => API.patch(`/users/${id}/approve`, { approve });

export const verifyPassword = (password) => API.post('/users/verify-password', { password });

export const updateProfile = (userData) => API.put('/users/profile', userData);

export const deleteAccount = () => API.delete('/users/me');
