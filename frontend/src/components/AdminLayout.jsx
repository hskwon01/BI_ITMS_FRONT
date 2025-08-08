import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../css/AdminLayout.css';

// Metanet 로고 이미지 경로
const metanetLogo = process.env.PUBLIC_URL + '/metanet-logo.jpg';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  const handleLogoClick = () => {
    const token = localStorage.getItem('token');
    if (token) {
      // 토큰이 있으면 /home으로 이동
      navigate('/home');
    } else {
      // 토큰이 없으면 /로 이동
      navigate('/');
    }
  };

  return (
    <div className="admin-layout">
      {/* 상단 헤더 */}
      <header className="admin-header">        
        <div className="main-header">
          <div className="logo-section">
            <div className="logo-container" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
              <img src={metanetLogo} alt="Rockplace Logo" className="metanet-logo" />
              <div className="logo-text">
                <h1 className="logo">ITSM <span className="company-tag">by rockPLACE</span></h1>
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
              <li className={location.pathname === '/admin/access-requests' ? 'active' : ''}>
                <Link to="/admin/access-requests">접근요청</Link>
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