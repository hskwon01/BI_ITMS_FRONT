import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10초 타임아웃 설정
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

// 응답 인터셉터 추가
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('API 요청 타임아웃:', error);
      return Promise.reject(new Error('요청 시간이 초과되었습니다. 다시 시도해주세요.'));
    }
    return Promise.reject(error);
  }
);

export default API;
