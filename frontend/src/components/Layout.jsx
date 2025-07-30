import React from 'react';
import { Link, useNavigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import '../css/Layout.css';

const Layout = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  let userRole = null;

  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      userRole = decodedToken.role;
    } catch (error) {
      console.error("Invalid token, logging out:", error);
      localStorage.clear();
      navigate('/login');
    }
  }

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="layout-root">
      <nav className="navbar">
        <div className="navbar-brand-area">
          <img src={process.env.PUBLIC_URL + '/metanet-logo.jpg'} alt="logo" className="navbar-logo" />
          <span className="navbar-brand">ITMS</span>
        </div>
        <div className="navbar-links">
          {userRole === 'admin' ? (
            <>
              <Link to="/admin/tickets" className="nav-link">티켓 관리</Link>
              <Link to="/admin/users" className="nav-link">사용자</Link>
              <Link to="/admin/dashboard" className="nav-link">대시보드</Link>
            </>
          ) : (
            <>
              <Link to="/my-tickets" className="nav-link">내 티켓</Link>
              <Link to="/my-tickets/create" className="nav-link">티켓 작성</Link>
              <Link to="/profile" className="nav-link">내 정보</Link>
            </>
          )}
        </div>
        <div className="navbar-actions">
          <button className="logout-btn" onClick={handleLogout}>로그아웃</button>
        </div>
      </nav>
      <main className="layout-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
