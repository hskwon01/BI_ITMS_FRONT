import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import '../css/Layout.css';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        console.log("decodedToken!!!!", decodedToken);
        setUserRole(decodedToken.role);
        const name = decodedToken.name || '사용자';
        setUserName(name + '님');
      } catch (error) {
        console.error("Invalid token, logging out:", error);
        localStorage.clear();
        navigate('/login');
      }
    } else {
      setUserRole(null);
      setUserName('');
    }
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 900;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setIsMenuOpen(false);
    }
  }, [location, isMobile]);

  useEffect(() => {
    if (isMobile && isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMenuOpen, isMobile]);

  const navLinks = userRole === 'admin' || userRole === 'itsm_team' ? (
    <>
      <Link to="/admin/tickets" className="nav-link">티켓 관리</Link>
      <Link to="/admin/customers" className="nav-link">고객</Link>
      <Link to="/admin/team" className="nav-link">팀</Link>
      <Link to="/admin/dashboard" className="nav-link">대시보드</Link>
    </>
  ) : (
    <>
      <Link to="/my-tickets" className="nav-link">내 티켓</Link>
      <Link to="/my-tickets/create" className="nav-link">티켓 작성</Link>
      <Link to="/profile" className="nav-link">내 정보</Link>
    </>
  );

  return (
    <div className="layout-root">
      <nav className="navbar">
        <div className="navbar-left">
          <Link to="/" className="navbar-brand-area">
            <img src={process.env.PUBLIC_URL + '/metanet-logo.jpg'} alt="logo" className="navbar-logo" />
            <span className="navbar-brand">ITMS</span>
          </Link>
        </div>

        <div className="navbar-center">
          {!isMobile && <div className="navbar-links">{navLinks}</div>}
        </div>

        <div className="navbar-right">
          <span className="user-name">{userName}</span>
          <button className="logout-btn" onClick={handleLogout}>로그아웃</button>
          {isMobile && (
            <button className="hamburger-btn" onClick={toggleMenu}>
              &#9776;
            </button>
          )}
        </div>
      </nav>

      {isMobile && (
        <>
          <div
            className={`menu-backdrop ${isMenuOpen ? 'open' : ''}`}
            onClick={toggleMenu}
          />
          <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
            {navLinks}
          </div>
        </>
      )}

      <main className="layout-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
