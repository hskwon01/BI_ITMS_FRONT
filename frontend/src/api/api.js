import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
});

// 요청 인터셉터 추가
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  // 로그인 및 회원가입 요청이 아닐 때만 토큰을 추가합니다.
  const isAuthRoute = req.url.endsWith('/auth/login') || req.url.endsWith('/auth/register');

  if (token && !isAuthRoute) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;
