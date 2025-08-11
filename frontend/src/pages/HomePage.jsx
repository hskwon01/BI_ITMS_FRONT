import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMe } from '../api/auth';
import CommonLayout from '../components/CommonLayout';
import '../css/HomePage.css';

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
    <CommonLayout>
      {/* 메인 히어로 섹션 */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1>RockPLACE의 통합 IT 서비스 관리 플랫폼</h1>
            <p className="hero-subtitle">
              빠르고 안정적인 IT 서비스 요청과 지원을 위한 통합 ITSM 시스템입니다.
            </p>
            <div className="hero-actions">
              <Link to="/my-tickets/create" className="primary-btn">
                티켓 생성하기
              </Link>
              <Link to="/my-tickets" className="secondary-btn">
                내 티켓 보기
              </Link>
            </div>
          </div>
          <div className="hero-illustration">
            <div className="illustration-container">
              <div className="tech-icons">
                <div className="icon server">🖥️</div>
                <div className="icon cloud">☁️</div>
                <div className="icon support">🛠️</div>
                <div className="icon monitor">📊</div>
              </div>
              <div className="main-screen">
                <div className="screen-content">
                  <div className="screen-header">ITSM Dashboard</div>
                  <div className="screen-body">
                    <div className="metric-card">
                      <span className="metric-number">24</span>
                      <span className="metric-label">Active Tickets</span>
                    </div>
                    <div className="metric-card">
                      <span className="metric-number">98%</span>
                      <span className="metric-label">SLA</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 서비스 카드 섹션 */}
      <section className="services-section">
        <div className="services-grid">
          <div className="service-card">
            <div className="service-icon">📋</div>
            <h3>티켓 관리</h3>
            <p>IT 서비스 요청과 이슈를 체계적으로 관리하고 추적합니다.</p>
          </div>
          <div className="service-card">
            <div className="service-icon">📊</div>
            <h3>대시보드</h3>
            <p>실시간 서비스 현황과 성과 지표를 한눈에 확인합니다.</p>
          </div>
          <div className="service-card">
            <div className="service-icon">🛠️</div>
            <h3>기술 지원</h3>
            <p>전문 기술팀의 빠른 응답과 해결을 제공합니다.</p>
          </div>
        </div>
      </section>

      {/* 뉴스/공지사항 섹션 */}
      <section className="news-section">
        <div className="news-grid">
          <div className="news-card">
            <h3>공지사항</h3>
            <div className="news-list">
              {announcements.map(item => (
                <div key={item.id} className="news-item">
                  <span className="news-title">{item.title}</span>
                  <span className="news-date">{item.date}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="news-card">
            <h3>문의사항</h3>
            <div className="news-list">
              {news.map(item => (
                <div key={item.id} className="news-item">
                  <span className="news-title">{item.title}</span>
                  <span className="news-date">{item.date}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="news-card">
            <h3>서비스 소식</h3>
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
      </section>
    </CommonLayout>
  );
};

export default HomePage; 