import API from './api';

export const fetchNotices = (params = {}) => API.get('/notices', { params });
export const fetchNotice = (id) => API.get(`/notices/${id}`);
export const createNotice = (data) => API.post('/notices', data);
export const updateNotice = (id, data) => API.put(`/notices/${id}`, data);
export const deleteNotice = (id) => API.delete(`/notices/${id}`);

