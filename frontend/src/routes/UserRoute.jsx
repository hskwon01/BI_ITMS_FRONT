import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const UserRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/" />;
  }

  try {
    const decodedToken = jwtDecode(token);
    // 'admin' 역할이 아닌 모든 사용자(user, null 등)에게 접근을 허용합니다.
    if (decodedToken.role !== 'admin') {
      return children;
    }
  } catch (error) {
    console.error("Invalid token:", error);
    return <Navigate to="/" />;
  }
  
  // 'admin' 역할인 경우에만 관리자 대시보드로 리디렉션합니다.
  return <Navigate to="/admin/dashboard" />;
};

export default UserRoute;
