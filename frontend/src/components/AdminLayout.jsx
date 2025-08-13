import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FiBarChart2, 
  FiTrello, 
  FiUsers, 
  FiUserCheck, 
  FiPackage, 
  FiShield,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiMenu
} from 'react-icons/fi';
import '../css/AdminLayout.css';

// Metanet 로고 이미지 경로
const metanetLogo = process.env.PUBLIC_URL + '/metanet-logo.jpg';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  const handleLogoClick = () => {
    const token = localStorage.getItem('token');
    if (token) {
      // 토큰이 있으면 대시보드로 이동
      navigate('/admin/dashboard');
    } else {
      // 토큰이 없으면 /로 이동
      navigate('/');
    }
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const menuItems = [
    { path: '/admin/dashboard', label: '대시보드', icon: FiBarChart2 },
    { path: '/admin/tickets', label: '티켓 관리', icon: FiTrello },
    { path: '/admin/customer', label: '고객관리', icon: FiUsers },
    { path: '/admin/team', label: '팀관리', icon: FiUserCheck },
    { path: '/admin/products', label: '제품관리', icon: FiPackage },
    { path: '/admin/access-requests', label: '접근요청', icon: FiShield },
  ];

  return (
    <div className={`admin-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${sidebarOpen ? 'sidebar-open' : ''}`}>
      {/* 사이드바 */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <div className="logo-container" onClick={handleLogoClick}>
            <img src={metanetLogo} alt="Rockplace Logo" className="metanet-logo" />
            {!sidebarCollapsed && (
              <div className="logo-text">
                <h1 className="logo">ITSM</h1>
                <span className="company-tag">by RockPLACE</span>
              </div>
            )}
          </div>
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            {sidebarCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul className="sidebar-menu">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <li key={item.path} className={location.pathname === item.path ? 'active' : ''}>
                  <Link to={item.path} className="sidebar-link">
                    <span className="menu-icon">
                      <IconComponent />
                    </span>
                    {!sidebarCollapsed && <span className="menu-label">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <span className="logout-icon">
              <FiLogOut />
            </span>
            {!sidebarCollapsed && <span>로그아웃</span>}
          </button>
        </div>
      </aside>

      {/* 메인 컨텐츠 영역 */}
      <main className="admin-main-content">
        <div className="content-header">
          <div className="header-left">
            <button className="mobile-menu-toggle" onClick={toggleMobileSidebar}>
              <FiMenu />
            </button>
            <div className="breadcrumb">
              {menuItems.find(item => item.path === location.pathname)?.label || '관리자'}
            </div>
          </div>
          <div className="user-info">
            <span className="user-role">관리자</span>
            <span className="current-time">{new Date().toLocaleString('ko-KR')}</span>
          </div>
        </div>
        
        <div className="content-body">
          {children}
        </div>
      </main>

      {/* 모바일 오버레이 */}
      <div className="mobile-overlay" onClick={toggleMobileSidebar}></div>
    </div>
  );
};

export default AdminLayout; 