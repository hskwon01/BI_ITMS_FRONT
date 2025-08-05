import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login, getMe } from '../api/auth';
import '../css/HomePage.css';

// Metanet 로고 이미지 경로
const metanetLogo = process.env.PUBLIC_URL + '/metanet-logo.jpg';

const HomePage = () => {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({
    id: '',
    password: '',
    saveId: false
  });
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);

    try {
      
      // JSON 객체로 로그인 요청
      const response = await login({
        email: loginData.id,
        password: loginData.password
      });
      
      // 토큰 저장
      const token = response.data.token;
      localStorage.setItem('token', token);

      // 사용자 정보 가져오기
      const me = await getMe();

      // 사용자 역할에 따라 페이지 이동
      if (me.data.role === 'admin' || me.data.role === 'itsm_team') {
        navigate('/admin/tickets');
      } else {
        navigate('/my-tickets');
      }
    } catch (error) {
      setLoginError(error.response?.data?.message || '로그인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // ITMS 관련 샘플 데이터
  const announcements = [
    { id: 1, title: '[시스템] ITMS 시스템 점검 안내 (2025.08.15)', date: '2025.08.04' },
    { id: 2, title: '[보안] 보안 정책 업데이트 및 패스워드 변경 안내', date: '2025.07.15' },
    { id: 3, title: '[서비스] 새로운 IT 서비스 요청 프로세스 안내', date: '2025.07.10' },
    { id: 4, title: '[유지보수] 서버 유지보수 작업 일정 안내', date: '2025.07.05' }
  ];

  const news = [
    { id: 1, title: '[ITMS] 2025년 상반기 IT 서비스 현황 보고', date: '2025.06.30' },
    { id: 2, title: '[보안] 사이버 보안 교육 실시 안내', date: '2025.06.15' },
    { id: 3, title: '[시스템] 클라우드 서비스 도입 완료', date: '2025.06.01' },
    { id: 4, title: '[인프라] 데이터센터 확장 공사 완료', date: '2025.05.20' }
  ];

  const serviceNews = [
    { id: 1, title: '[지원] IT 지원팀 운영시간 변경 안내', date: '2025.08.01' },
    { id: 2, title: '[교육] IT 시스템 사용법 교육 실시', date: '2025.07.25' },
    { id: 3, title: '[업데이트] 소프트웨어 업데이트 완료', date: '2025.07.20' },
    { id: 4, title: '[백업] 시스템 백업 정책 변경', date: '2025.07.10' }
  ];

  return (
    <div className="homepage">
      {/* 상단 헤더 */}
      <header className="header">
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
        <nav className="main-nav">
          <div className="nav-center">
            <ul>
              <li><Link to="/notices">공지사항</Link></li>
              <li><Link to="/inquiries">문의사항</Link></li>
              <li><Link to="/news">신규소식</Link></li>
              <li><Link to="/quotes">견적</Link></li>
            </ul>
          </div>
          <div className="nav-right">
            {/* 우측 영역 - 필요시 버튼이나 다른 요소 추가 가능 */}
          </div>
        </nav>
      </header>

      {/* 메인 컨텐츠 영역 */}
      <main className="main-content">
        <div className="content-wrapper">
          {/* 왼쪽 메인 영역 */}
          <div className="main-section">
                         {/* 메인 배너 */}
             <div className="main-banner">
               <div className="banner-content">
                 <h2>통합 IT 관리 시스템</h2>
                 <h1>ITMS</h1>
                 <p>IT Infrastructure Management System</p>
                 <p className="banner-subtitle">
                   효율적인 IT 서비스 관리와 모니터링을 위한 통합 플랫폼입니다.
                 </p>
                 <div className="banner-action">
                   <Link to="/create-ticket" className="banner-btn">
                     티켓 생성하기
                   </Link>
                 </div>
               </div>
             </div>
          </div>

                     {/* 우측 사이드바 */}
           <div className="sidebar">
             {/* 로그인 박스 */}
             <div className="login-box">
               <h3>LOGIN</h3>
               <form onSubmit={handleLogin}>
                 <div className="input-group">
                   <input
                     type="text"
                     name="id"
                     placeholder="ID"
                     value={loginData.id}
                     onChange={handleLoginChange}
                     required
                     disabled={isLoading}
                   />
                 </div>
                 <div className="input-group">
                   <input
                     type="password"
                     name="password"
                     placeholder="Password"
                     value={loginData.password}
                     onChange={handleLoginChange}
                     required
                     disabled={isLoading}
                   />
                 </div>
                 {loginError && (
                   <div className="login-error">
                     {loginError}
                   </div>
                 )}
                 <div className="login-options">
                   <label>
                     <input
                       type="checkbox"
                       name="saveId"
                       checked={loginData.saveId}
                       onChange={handleLoginChange}
                       disabled={isLoading}
                     />
                     ID 저장
                   </label>
                   <Link to="/find-account" className="find-account">ID/PW 찾기</Link>
                 </div>
                 <div className="login-buttons">
                   <button 
                     type="submit" 
                     className="btn-login"
                     disabled={isLoading}
                   >
                     {isLoading ? '로그인 중...' : '로그인'}
                   </button>
                   <Link to="/register" className="btn-register">회원가입</Link>
                 </div>
               </form>
             </div>
           </div>
        </div>

        {/* 하단 뉴스/공지사항 섹션 */}
        <div className="news-section">
          <div className="news-container">
            {/* 공지사항 */}
            <div className="news-box">
              <div className="news-header">
                <h3>공지사항</h3>
                <div className="news-actions">
                  <span className="more-icon">...</span>
                  <span className="plus-icon">+</span>
                </div>
              </div>
              <div className="news-list">
                {announcements.map(item => (
                  <div key={item.id} className="news-item">
                    <span className="news-title">{item.title}</span>
                    <span className="news-date">{item.date}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ITMS 뉴스 */}
            <div className="news-box">
              <div className="news-header">
                <h3>문의사항</h3>
                <div className="news-actions">
                  <span className="more-icon">...</span>
                  <span className="plus-icon">+</span>
                </div>
              </div>
              <div className="news-list">
                {news.map(item => (
                  <div key={item.id} className="news-item">
                    <span className="news-title">{item.title}</span>
                    <span className="news-date">{item.date}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 서비스 소식 */}
            <div className="news-box">
              <div className="news-header">
                <h3>서비스 소식</h3>
                <div className="news-actions">
                  <span className="more-icon">...</span>
                  <span className="plus-icon">+</span>
                </div>
              </div>
              <div className="news-list">
                {serviceNews.map(item => (
                  <div key={item.id} className="news-item">
                    <span className="news-title">{item.title}</span>
                    <span className="news-date">{item.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage; 