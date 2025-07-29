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

export const deleteTicketFile = (ticket_files_id, token) =>
  API.delete(`/tickets/files/ticket/${ticket_files_id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const deleteReplyFile = (ticket_reply_files_id, token) =>
  API.delete(`/tickets/files/reply/${ticket_reply_files_id}`, {
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

export const updateReply = (ticketId, replyId, message, token) =>
  API.put(`/tickets/${ticketId}/replies/${replyId}`, { message }, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const deleteReply = (ticketId, replyId, token) =>
  API.delete(`/tickets/${ticketId}/replies/${replyId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const uploadTicketFiles = (file, token) => {
  const formData = new FormData();
  formData.append('file', file);
  return API.post('/users/upload/ticket', formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const uploadReplyFiles = (file, token) => {
  const formData = new FormData();
  formData.append('file', file);
  return API.post('/users/upload/reply', formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
};