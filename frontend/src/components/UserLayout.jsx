import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../css/UserLayout.css';

// Metanet 로고 이미지 경로
const metanetLogo = process.env.PUBLIC_URL + '/metanet-logo.jpg';

const UserLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  const handleLogoClick = () => {
    const token = localStorage.getItem('token');
    if (token) {
      // 토큰이 있으면 /my-tickets로 이동 (고객용 레이아웃이므로)
      navigate('/my-tickets');
    } else {
      // 토큰이 없으면 /로 이동
      navigate('/');
    }
  };

  return (
    <div className="user-layout">
      {/* 상단 헤더 */}
      <header className="user-header">        
        <div className="main-header">
          <div className="logo-section">
            <div className="logo-container" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
              <img src={metanetLogo} alt="Rockplace Logo" className="metanet-logo" />
              <div className="logo-text">
                <h1 className="logo">ITSM <span className="company-tag">by RockPLACE</span></h1>
              </div>
            </div>
          </div>
        </div>

        <nav className="user-nav">
          <div className="nav-center">
            <ul>
              <li className={location.pathname === '/my-tickets' ? 'active' : ''}>
                <Link to="/my-tickets">내 티켓</Link>
              </li>
              <li className={location.pathname === '/my-tickets/create' ? 'active' : ''}>
                <Link to="/my-tickets/create">티켓 작성</Link>
              </li>
              <li className={location.pathname === '/profile' ? 'active' : ''}>
                <Link to="/profile">내 정보</Link>
              </li>
            </ul>
          </div>
          <div className="nav-right">
            <button onClick={handleLogout} className="logout-btn">로그아웃</button>
          </div>
        </nav>
      </header>

      {/* 메인 컨텐츠 영역 */}
      <main className="user-main-content">
        <div className="user-content-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
};

export default UserLayout; 