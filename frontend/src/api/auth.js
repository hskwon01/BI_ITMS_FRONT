import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getMe = (token) => {
  return API.get('/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};