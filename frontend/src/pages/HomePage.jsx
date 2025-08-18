import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMe } from '../api/auth';
import { getDashboardStats } from '../api/dashboard';
import { fetchNotices } from '../api/notices';
import CommonLayout from '../components/CommonLayout';
import { BarChart3, Ticket, Package, FileText, Settings, Users, Lock, Bell, ClipboardList, DollarSign, Clock, Phone, Mail, MapPin } from 'lucide-react';
import '../css/HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [stats, setStats] = useState(null);
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await getMe();
        setMe(res);
        const role = res?.data?.role;
        const token = localStorage.getItem('token');
        if (token && (role === 'admin' || role === 'itsm_team')) {
          try {
            const s = await getDashboardStats(token, { days: 30 });
            setStats(s.data);
          } catch (e) {
            setStats(null);
          }
        } else {
          setStats(null);
        }
      } catch (error) {
        // 토큰이 만료되었거나 없는 경우
        setMe(null);
        setStats(null);
      }
    };

    const fetchNoticesData = async () => {
      try {
        const response = await fetchNotices({ limit: 5, offset: 0 });
        setNotices(response.data.items || []);
      } catch (error) {
        console.error('공지사항 로드 실패:', error);
        setNotices([]);
      }
    };

    fetchMe();
    fetchNoticesData();
  }, []);

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit'
    }).replace(/\./g, '.').slice(0, -1);
  };

  return (
    <CommonLayout>
      <div className="home-container">
        {/* 메인 히어로 섹션 */}
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-text">
              <h1>
                {me?.data?.role === 'admin' || me?.data?.role === 'itsm_team' 
                  ? 'RockPLACE의 통합 IT 서비스 관리 플랫폼'
                  : '안녕하세요! IT 서비스 센터에 오신 것을 환영합니다'
                }
              </h1>
              <p className="hero-subtitle">
                {me?.data?.role === 'admin' || me?.data?.role === 'itsm_team'
                  ? '빠르고 안정적인 IT 서비스 요청과 지원을 위한 통합 ITSM 시스템입니다.'
                  : 'IT 문제 해결부터 견적 요청까지, 언제든 편리하게 이용하세요.'
                }
              </p>
              <div className="hero-actions">
                {me?.data?.role === 'admin' || me?.data?.role === 'itsm_team' ? (
                  // 관리자용 액션 버튼
                  <>
                    <Link to="/admin/dashboard" className="primary-btn">
                      <BarChart3 size={20} /> 관리자 대시보드
                    </Link>
                    <Link to="/admin/tickets" className="secondary-btn">
                      <Ticket size={20} /> 티켓 관리
                    </Link>
                    <Link to="/admin/products" className="tertiary-btn">
                      <Package size={20} /> 제품 관리
                    </Link>
                  </>
                ) : (
                  // 일반 사용자용 액션 버튼
                  <>
                    <Link to="/my-tickets/create" className="primary-btn">
                      티켓 생성하기
                    </Link>
                    <Link to="/my-tickets" className="secondary-btn">
                      내 티켓 보기
                    </Link>
                    <Link to="/quotes" className="tertiary-btn">
                      견적 관리
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="hero-illustration">
              {me?.data?.role === 'admin' || me?.data?.role === 'itsm_team' ? (
                // 관리자용 일러스트레이션 (기존 유지)
                <div className="illustration-container">
                  <div className="tech-icons">
                    <div className="icon server">🖥️</div>
                    <div className="icon cloud">☁️</div>
                    <div className="icon support">🛠️</div>
                    <div className="icon monitor"><BarChart3 size={24} /></div>
                  </div>
                  <div className="main-screen">
                    <div className="screen-content">
                      <div className="screen-header">ITSM Dashboard</div>
                      <div className="screen-body">
                        <div className="metric-card">
                          <span className="metric-number">
                            {stats ? (Number(stats.전체티켓 || 0) - Number(stats.종료 || 0)) : '--'}
                          </span>
                          <span className="metric-label">Active Tickets</span>
                        </div>
                        <div className="metric-card">
                          <span className="metric-number">
                            {stats ? `${Math.round(((Number(stats.답변완료 || 0) + Number(stats.종료 || 0)) / (Number(stats.전체티켓 || 0) || 1)) * 100)}%` : '--'}
                          </span>
                          <span className="metric-label">SLA</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // 고객용 일러스트레이션 (새로 추가)
                <div className="customer-illustration">
                  <div className="welcome-card">
                    <div className="welcome-header">
                      <h3>안녕하세요, {me?.data?.name || '고객'}님!</h3>
                    </div>
                    <div className="welcome-stats">
                      <div className="stat-item">
                        <span className="stat-number">{me?.data?.ticket_count || 0}</span>
                        <span className="stat-label">내 티켓</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-number">{me?.data?.quote_count || 0}</span>
                        <span className="stat-label">내 견적</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-number">{notices.filter(n => n.is_pinned).length}</span>
                        <span className="stat-label">중요 공지</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 서비스와 뉴스 섹션을 나란히 배치 */}
        <div className="services-news-container">
          {/* 서비스 카드 섹션 */}
          <section className="services-section">
            <div className="services-grid">
              {me?.data?.role === 'admin' || me?.data?.role === 'itsm_team' ? (
                // 관리자용 서비스 카드
                <>
                  <Link to="/admin/dashboard" className="service-card">
                    <div className="service-icon"><BarChart3 size={24} /></div>
                    <h3>통계 대시보드</h3>
                    <p>실시간 티켓 현황, SLA 지표, 트렌드 분석을 확인합니다.</p>
                    {stats && (
                      <div className="service-stats">
                        <span>활성 티켓: {Number(stats.전체티켓 || 0) - Number(stats.종료 || 0)}개</span>
                      </div>
                    )}
                  </Link>
                  <Link to="/admin/tickets" className="service-card">
                    <div className="service-icon"><Ticket size={24} /></div>
                    <h3>티켓 관리</h3>
                    <p>모든 고객 티켓을 관리하고 응답하며 상태를 추적합니다.</p>
                    {stats && (
                      <div className="service-stats">
                        <span>대기중: {Number(stats.접수 || 0) + Number(stats.진행중 || 0)}개</span>
                      </div>
                    )}
                  </Link>
                  <Link to="/admin/products" className="service-card">
                    <div className="service-icon"><Package size={24} /></div>
                    <h3>제품 관리</h3>
                    <p>견적 시스템에서 사용할 제품과 가격을 관리합니다.</p>
                  </Link>
                  <Link to="/admin/customer" className="service-card">
                    <div className="service-icon"><Users size={24} /></div>
                    <h3>고객 관리</h3>
                    <p>등록된 고객 정보와 서비스 이용 현황을 관리합니다.</p>
                  </Link>
                  <Link to="/admin/access-requests" className="service-card">
                    <div className="service-icon"><Lock size={24} /></div>
                    <h3>접근 요청</h3>
                    <p>신규 사용자의 시스템 접근 요청을 승인/거부합니다.</p>
                  </Link>
                  <Link to="/notices" className="service-card">
                    <div className="service-icon"><Bell size={24} /></div>
                    <h3>공지사항 관리</h3>
                    <p>시스템 공지사항을 작성하고 관리합니다.</p>
                  </Link>
                </>
              ) : (
                // 일반 사용자용 서비스 카드 (간소화)
                <>
                  <Link to="/my-tickets/create" className="service-card primary-service">
                    <div className="service-icon"><ClipboardList size={24} /></div>
                    <h3>티켓 생성</h3>
                    <p>IT 서비스 요청과 이슈를 간편하게 접수합니다.</p>
                    <div className="service-badge">빠른 접수</div>
                  </Link>
                  <Link to="/my-tickets" className="service-card">
                    <div className="service-icon"><BarChart3 size={24} /></div>
                    <h3>내 티켓</h3>
                    <p>제출한 티켓의 진행 상황을 실시간으로 확인합니다.</p>
                    {me?.data && (
                      <div className="service-stats">
                        <span>내 티켓: {me.data.ticket_count || 0}개</span>
                      </div>
                    )}
                  </Link>
                  <Link to="/quotes" className="service-card">
                    <div className="service-icon"><DollarSign size={24} /></div>
                    <h3>견적 관리</h3>
                    <p>제품 견적을 요청하고 승인 상태를 확인합니다.</p>
                    {me?.data && (
                      <div className="service-stats">
                        <span>내 견적: {me.data.quote_count || 0}개</span>
                      </div>
                    )}
                  </Link>
                  <Link to="/notices" className="service-card">
                    <div className="service-icon"><Bell size={24} /></div>
                    <h3>공지사항</h3>
                    <p>중요한 시스템 공지사항과 업데이트를 확인합니다.</p>
                    {notices.length > 0 && (
                      <div className="service-stats">
                        <span>새 공지: {notices.filter(n => n.is_pinned).length}개</span>
                      </div>
                    )}
                  </Link>
                </>
              )}
            </div>
          </section>

          {/* 공지사항 및 서비스 안내 섹션 */}
          <section className="news-section">
            <div className="news-card">
              <h3>공지사항</h3>
              <div className="news-list">
                {notices.length > 0 ? notices.map(notice => (
                  <Link key={notice.id} to={`/notices/${notice.id}`} className="news-item">
                    <span className="news-title">
                      {notice.is_pinned && <span className="pinned-badge"><MapPin size={16} /></span>}
                      {notice.title}
                    </span>
                    <span className="news-date">{formatDate(notice.created_at)}</span>
                  </Link>
                )) : (
                  <div className="news-item no-data">
                    <span className="news-title">등록된 공지사항이 없습니다.</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="news-card">
              <h3>서비스 안내</h3>
              <div className="service-info">
                <div className="info-item">
                  <span className="info-icon"><Clock size={20} /></span>
                  <div className="info-content">
                    <strong>응답 시간</strong>
                    <span>평일 09:00-18:00</span>
                  </div>
                </div>
                <div className="info-item">
                  <span className="info-icon"><Phone size={20} /></span>
                  <div className="info-content">
                    <strong>긴급 연락처</strong>
                    <span>02-1234-5678</span>
                  </div>
                </div>
                <div className="info-item">
                  <span className="info-icon"><Mail size={20} /></span>
                  <div className="info-content">
                    <strong>이메일</strong>
                    <span>support@rockplace.com</span>
                  </div>
                </div>
                {me?.data?.role === 'admin' || me?.data?.role === 'itsm_team' ? (
                  // 관리자용 추가 정보 - 현재는 없음
                  <div className="info-item">
                    <span className="info-icon"><ClipboardList size={20} /></span>
                    <div className="info-content">
                      <strong>관리자 도구</strong>
                      <span>시스템 관리 및 모니터링</span>
                    </div>
                  </div>
                ) : (
                  // 일반 사용자용 정보
                  <div className="info-item">
                    <span className="info-icon"><Settings size={20} /></span>
                    <div className="info-content">
                      <strong>내 정보 관리</strong>
                      <Link to="/profile" className="info-link">프로필 설정</Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </CommonLayout>
  );
};

export default HomePage; 