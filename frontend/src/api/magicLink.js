import API from './api';

export const requestAccess = (requestData) => API.post('/magic-link/request-access', requestData);
export const requestLoginLink = (email) => API.post('/magic-link/request-login-link', { email });
export const loginWithMagicLink = (token) => API.post('/magic-link/login-with-link', { token });

// 관리자용 API
export const getRequests = (status = 'pending') => {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  return API.get(`/magic-link/admin/requests${query}`);
};
export const approveRequest = (id) => API.post(`/magic-link/admin/requests/${id}/approve`);
export const rejectRequest = (id) => API.post(`/magic-link/admin/requests/${id}/reject`); // 거부 API 추가
