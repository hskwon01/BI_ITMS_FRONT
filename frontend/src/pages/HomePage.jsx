import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMe } from '../api/auth';
import '../css/HomePage.css';

// Metanet 로고 이미지 경로
const metanetLogo = process.env.PUBLIC_URL + '/metanet-logo.jpg';

const HomePage = () => {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await getMe();
        setMe(res);
      } catch (error) {
        // 토큰이 만료되었거나 없는 경우
        setMe(null);
      }
    };
    fetchMe();
  }, []);

  const handleLogoClick = () => {
    const token = localStorage.getItem('token');
    if (token && me) {
      // 토큰이 있고 사용자 정보가 있으면 /home으로 이동
      navigate('/home');
    } else {
      // 토큰이 없거나 만료되었으면 /로 이동
      navigate('/');
    }
  };

  // ITSM 관련 샘플 데이터
  const announcements = [
    { id: 1, title: '[시스템] ITSM 시스템 점검 안내 (2025.08.15)', date: '2025.08.04' },
    { id: 2, title: '[보안] 보안 정책 업데이트 및 패스워드 변경 안내', date: '2025.07.15' },
    { id: 3, title: '[서비스] 새로운 IT 서비스 요청 프로세스 안내', date: '2025.07.10' },
    { id: 4, title: '[유지보수] 서버 유지보수 작업 일정 안내', date: '2025.07.05' }
  ];

  const news = [
    { id: 1, title: '[ITSM] 2025년 상반기 IT 서비스 현황 보고', date: '2025.06.30' },
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
        <nav className="main-nav">
          <div className="nav-center">
            <ul>
              {me ? (
                me?.data?.role === 'admin' || me?.data?.role === 'itsm_team' ? (
                <li><Link to="/admin/tickets">고객 티켓</Link></li>
              ) : (
              <li><Link to="/my-tickets">내 티켓</Link></li>
            )
          ) : (
          <li>로딩 중...</li> // 또는 null
          )}              
              <li><Link to="/notices">공지사항</Link></li>
              <li><a href="https://www.ibm.com/docs/en/webmethods-integration" target="_blank" rel="noopener noreferrer">공식문서</a></li>
              <li><Link to="/tickets/sr">SR 답변</Link></li>              
              <li><Link to="/quotes">견적</Link></li>
            </ul>
          </div>
          <div className="nav-right">
            {me && (
              <button 
                onClick={() => {
                  localStorage.removeItem('token');
                  window.location.href = '/';
                }} 
                className="logout-btn"
              >
                로그아웃
              </button>
            )}
          </div>
        </nav>
      </header>

      {/* 메인 컨텐츠 영역 */}
      <main className="main-content">
        <div className="content-wrapper">
          {/* 메인 배너와 사용자 정보 영역 */}
          <div className="banner-user-section">
            {/* 메인 배너 */}
            <div className="main-banner">
              <div className="banner-content">
                <h2>통합 IT 관리 시스템</h2>
                <h1>ITSM</h1>
                <p>IT Service Management</p>
                <p className="banner-subtitle">
                  효율적인 IT 서비스 관리와 모니터링을 위한 통합 플랫폼입니다.
                </p>
                <div className="banner-action">
                  <Link to="/my-tickets/create" className="banner-btn">
                    티켓 생성하기
                  </Link>
                </div>
              </div>
            </div>

            {/* 사용자 정보 카드 */}
            <div className="user-info-card">
              {me ? (
                <div className="user-info-content">
                  <div className="user-avatar">
                    <div className="avatar-circle">
                      {me?.data?.name ? me.data.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  </div>
                  <div className="user-details">
                    <h3 className="user-name">{me?.data?.name || '사용자'} 님</h3>
                    <p className="user-email">{me?.data?.email || '이메일 없음'}</p>
                    <p className="user-role">
                      {me?.data?.role === 'admin' ? '관리자' : 
                       me?.data?.role === 'itsm_team' ? '기술지원팀' : '일반 사용자'}
                    </p>
                    <p className="user-company">{me?.data?.company_name || '회사 정보 없음'}</p>
                  </div>
                     <div className="user-actions">
                     <Link to="/profile" className="profile-link">마이 페이지</Link>
                   </div>
                </div>
              ) : (
                <div className="user-info-content">
                  <div className="user-avatar">
                    <div className="avatar-circle">
                      ?
                    </div>
                  </div>
                  <div className="user-details">
                    <h3 className="user-name">로그인이 필요합니다</h3>
                    <p className="user-email">서비스를 이용하려면 로그인해주세요</p>
                  </div>
                  <div className="user-actions">
                    <Link to="/" className="login-link">로그인하기</Link>
                  </div>
                </div>
              )}
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

            {/* ITSM 뉴스 */}
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