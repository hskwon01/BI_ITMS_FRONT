import React, { memo, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import '../css/CommonLayout.css';

// Metanet 로고 이미지 경로
const metanetLogo = process.env.PUBLIC_URL + '/metanet-logo.jpg';

const CommonLayout = memo(({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading, logout } = useUser();
  const [showSupportMenu, setShowSupportMenu] = useState(false);

  const handleLogoClick = () => {
    const token = localStorage.getItem('token');
    if (token && user) {
      // 토큰이 있고 사용자 정보가 있으면 /home으로 이동
      navigate('/home');
    } else {
      // 토큰이 없거나 만료되었으면 /로 이동
      navigate('/');
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  // 현재 경로에 따른 네비게이션 메뉴 결정
  const getNavigationMenu = () => {
    if (!user) return [];

    if (user?.data?.role === 'admin' || user?.data?.role === 'itsm_team') {
      return [
        { path: '/admin/tickets', label: '티켓 관리', active: location.pathname === '/admin/tickets' },
        { path: '/admin/customer', label: '고객관리', active: location.pathname === '/admin/customer' },
        { path: '/admin/team', label: '팀관리', active: location.pathname === '/admin/team' },
        { path: '/admin/products', label: '제품관리', active: location.pathname === '/admin/products' },
        { path: '/admin/notices', label: '공지사항', active: location.pathname === '/admin/notices' },
        { path: '/admin/access-requests', label: '접근요청', active: location.pathname === '/admin/access-requests' },
        { path: '/admin/dashboard', label: '대시보드', active: location.pathname === '/admin/dashboard' }
      ];
    } else {
      return [
        { path: '/my-tickets', label: '내 티켓', active: location.pathname === '/my-tickets' },
        { path: '/my-tickets/create', label: '티켓 작성', active: location.pathname === '/my-tickets/create' },
        { path: '/quotes', label: '견적 관리', active: location.pathname.startsWith('/quotes') },
        { path: '/profile', label: '내 정보', active: location.pathname === '/profile' }
      ];
    }
  };

  const navigationMenu = getNavigationMenu();

  return (
    <div className="common-layout">
      {/* 상단 헤더 */}
      <header className="header">
        <div className="header-container">
          <div className="logo-section">
            <div className="logo-container" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
              <img src={metanetLogo} alt="Rockplace Logo" className="metanet-logo" />
              <div className="logo-text">
                <h1 className="logo">ITSM <span className="company-tag">by RockPLACE</span></h1>
              </div>
            </div>
          </div>
          
          <nav className="main-nav">
            <ul>
              {user ? (
                navigationMenu.map((item, index) => (
                  <li key={index} className={item.active ? 'active' : ''}>
                    <Link to={item.path}>{item.label}</Link>
                  </li>
                ))
              ) : null}
              
              {/* 지원센터 드롭다운 메뉴 */}
              <li 
                className={`support-dropdown ${showSupportMenu ? 'active' : ''}`}
                onMouseEnter={() => setShowSupportMenu(true)}
                onMouseLeave={() => setShowSupportMenu(false)}
              >
                <button className="dropdown-toggle">
                  지원센터
                </button>
                <ul className="dropdown-menu">
                  <li><Link to="/notices">공지사항</Link></li>
                  <li><Link to="/tickets/sr">SR 답변</Link></li>
                  <li><a href="https://www.ibm.com/docs/en/webmethods-integration" target="_blank" rel="noopener noreferrer">공식문서</a></li>
                  <li><Link to="/quotes">견적</Link></li>
                </ul>
              </li>
            </ul>
          </nav>
          
          <div className="header-actions">
            {user ? (
              <div className="user-menu">
                <span className="user-name">{user?.data?.name || '사용자'}</span>
                <button 
                  onClick={handleLogout} 
                  className="logout-btn"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <Link to="/" className="login-btn">로그인</Link>
            )}
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 영역 */}
      <main className="main-content">
        <div className="content-wrapper">
          {children}
        </div>
      </main>

      {/* 푸터 */}
      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2025 RockPLACE. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
});

CommonLayout.displayName = 'CommonLayout';

export default CommonLayout;
