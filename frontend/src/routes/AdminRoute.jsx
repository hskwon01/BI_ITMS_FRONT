import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" />;
  }

  try {
    const decodedToken = jwtDecode(token);
    // 토큰이 유효하고, 역할이 'admin'인 경우에만 접근 허용
    if (decodedToken.role === 'admin') {
      return children;
    }
  } catch (error) {
    console.error("Invalid token:", error);
    // 디코딩 실패 시 로그인 페이지로
    return <Navigate to="/login" />;
  }
  
  // 역할이 'admin'이 아니면 접근 거부 (예: 일반 사용자 티켓 페이지로 리디렉션)
  return <Navigate to="/my-tickets" />;
};

export default AdminRoute;
