import axios from 'axios';

export const getDashboardStats = (token, params = {}) =>
  axios.get(`${process.env.REACT_APP_API_URL}/dashboard/stats`, {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });

export const autoCloseTickets = (token) =>
  axios.post(`${process.env.REACT_APP_API_URL}/dashboard/auto-close`, null, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const getTrends = (token, params = {}) =>
  axios.get(`${process.env.REACT_APP_API_URL}/dashboard/stats/trends`, {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });
