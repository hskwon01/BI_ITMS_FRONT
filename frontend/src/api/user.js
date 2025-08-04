import API from './api';

export const getCustomers = (token) => API.get('/users/customers', { headers: { Authorization: `Bearer ${token}` } });

export const getTeam = (token) => API.get('/users/team', { headers: { Authorization: `Bearer ${token}` } });

export const getAssignees = (token) => API.get('/users/assignees', { headers: { Authorization: `Bearer ${token}` } });

export const createTeamMember = (userData, token) => API.post('/users/team', userData, { headers: { Authorization: `Bearer ${token}` } });

export const approveUser = (id, approve, token) => API.patch(`/users/${id}/approve`, { approve }, { headers: { Authorization: `Bearer ${token}` } });

export const verifyPassword = (password, token) => API.post('/users/verify-password', { password }, { headers: { Authorization: `Bearer ${token}` } });

export const updateProfile = (userData, token) => API.put('/users/profile', userData, { headers: { Authorization: `Bearer ${token}` } });

export const deleteAccount = (token) => API.delete('/users/me', { headers: { Authorization: `Bearer ${token}` } });
