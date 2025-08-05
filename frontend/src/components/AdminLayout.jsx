import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../css/AdminLayout.css';

// Metanet 로고 이미지 경로
const metanetLogo = process.env.PUBLIC_URL + '/metanet-logo.jpg';

const AdminLayout = ({ children }) => {
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  return (
    <div className="admin-layout">
      {/* 상단 헤더 */}
      <header className="admin-header">
        <div className="top-header">
          <div className="top-links">
            <Link to="/">HOME</Link> | <Link to="/sitemap">SITEMAP</Link> | <Link to="/">ENGLISH</Link>
          </div>
        </div>
        
        <div className="main-header">
          <div className="logo-section">
            <div className="logo-container">
              <img src={metanetLogo} alt="Rockplace Logo" className="metanet-logo" />
              <div className="logo-text">
                <h1 className="logo">ITMS <span className="company-tag">by rockPLACE</span></h1>
              </div>
            </div>
          </div>
        </div>

        <nav className="admin-nav">
          <div className="nav-center">
            <ul>
              <li className={location.pathname === '/admin/tickets' ? 'active' : ''}>
                <Link to="/admin/tickets">티켓관리</Link>
              </li>
              <li className={location.pathname === '/admin/customer' ? 'active' : ''}>
                <Link to="/admin/customer">고객관리</Link>
              </li>
              <li className={location.pathname === '/admin/team' ? 'active' : ''}>
                <Link to="/admin/team">팀관리</Link>
              </li>
              <li className={location.pathname === '/admin/dashboard' ? 'active' : ''}>
                <Link to="/admin/dashboard">대시보드</Link>
              </li>
            </ul>
          </div>
          <div className="nav-right">
            <button onClick={handleLogout} className="logout-btn">로그아웃</button>
          </div>
        </nav>
      </header>

      {/* 메인 컨텐츠 영역 */}
      <main className="admin-main-content">
        <div className="admin-content-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout; 