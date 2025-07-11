import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
});

export const getAllUsers = (token) =>
  API.get('/users', {
    headers: { Authorization: `Bearer ${token}` }
  });

export const approveUser = (id, approve, token) =>
  API.patch(`/users/${id}/approve`, { approve }, {
    headers: { Authorization: `Bearer ${token}` }
  });
