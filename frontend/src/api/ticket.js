import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

export const createTicket = (formData, token) =>
  API.post('/tickets', formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  });


export const getMyTickets = (token, filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  return API.get(`/tickets/my?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getAllTickets = (token, filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  return API.get(`/tickets?${params}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const getTicketDetail = (id, token) =>
  API.get(`/tickets/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const postReply = (id, formData, token) =>
  API.post(`/tickets/${id}/replies`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  });

export const updateTicketStatus = (id, status, token) =>
  API.patch(`/tickets/${id}/status`, { status }, {
    headers: { Authorization: `Bearer ${token}` }
  });  

export const deleteTicketFile = (filename, token) =>
  API.delete(`/tickets/files/ticket/${filename}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const deleteReplyFile = (filename, token) =>
  API.delete(`/tickets/files/reply/${filename}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const getUnreadCounts = (token) =>
  API.get(`/tickets/my/unread-counts`, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const getAdminUnreadCounts = async (token) => {
  return await API.get(`/tickets/admin/unread-counts`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};
