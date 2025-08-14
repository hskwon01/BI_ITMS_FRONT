import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats, autoCloseTickets, getTrends } from '../api/dashboard';
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line } from 'recharts';
import { 
  FiTarget, 
  FiBarChart2, 
  FiTrello, 
  FiTrendingUp, 
  FiRefreshCw, 
  FiUsers, 
  FiUserCheck,
  FiFileText,
  FiSettings
} from 'react-icons/fi';
import { 
  Wrench, 
  CheckCircle, 
  Folder, 
  FileText, 
  Inbox, 
  Zap,
  Target,
  FileCheck,
  List
} from 'lucide-react';

import '../css/AdminDashboardPage.css';

const COLORS = ['#0052CC', '#36B37E', '#FF8B00', '#FF5630', '#6554C0'];

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState([]);
  const [days, setDays] = useState(30);
  const [type, setType] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [autoClosing, setAutoClosing] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [selectedView, setSelectedView] = useState('overview'); // overview, kanban, analytics
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const params = { days, type: type === 'ALL' ? undefined : type };
        const [s, t] = await Promise.all([
          getDashboardStats(token, params),
          getTrends(token, params),
        ]);
        setStats(s.data);
        setTrends(t.data);
        setLastUpdated(new Date());
      } catch {
        setStats(null);
        setTrends([]);
        setTimeout(() => setToast({ show: true, message: '통계 조회 실패', type: 'error' }), 0);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [days, type]);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => {
      const params = { days, type: type === 'ALL' ? undefined : type };
      Promise.all([
        getDashboardStats(token, params),
        getTrends(token, params),
      ])
        .then(([s, t]) => {
          setStats(s.data);
          setTrends(t.data);
          setLastUpdated(new Date());
        })
        .catch(() => setToast({ show: true, message: '자동 새로고침 실패', type: 'error' }));
    }, 60000);
    return () => clearInterval(id);
  }, [autoRefresh, days, type]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleAutoClose = async () => {
    setShowConfirmModal(false);
    try {
      setAutoClosing(true);
      const res = await autoCloseTickets(token);
      showToast(res.data.message, 'success');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch {
      showToast('자동 종료 처리에 실패했습니다.', 'error');
    } finally {
      setAutoClosing(false);
    }
  };

  if (loading) {
    return (
      <div className="jira-dashboard-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!stats) return null;

  const pieData = [
    { name: '접수', value: Number(stats.접수) },
    { name: '진행중', value: Number(stats.진행중) },
    { name: '답변 완료', value: Number(stats.답변완료) },
    { name: '종료', value: Number(stats.종료) }
  ];
  const hasNonZeroPie = pieData.some(d => d.value > 0);
  const pieRenderData = hasNonZeroPie ? pieData.filter(d => d.value > 0) : pieData;

  const barData = [
    { name: '접수', value: Number(stats.접수) },
    { name: '진행중', value: Number(stats.진행중) },
    { name: '답변완료', value: Number(stats.답변완료) },
    { name: '종료', value: Number(stats.종료) }
  ];

  const nf = new Intl.NumberFormat('ko-KR');

  const navigateToList = (statusLabel) => {
    const path = type === 'SM' ? '/admin/tickets/sm' : '/admin/tickets';
    navigate(`${path}?status=${encodeURIComponent(statusLabel)}`);
  };

  const renderOverview = () => (
    <div className="jira-overview">
      <div className="jira-stats-grid">
        <div className="jira-stat-card total">
          <div className="stat-header">
            <div className="stat-icon">
              <List size={24} />
            </div>
            <div className="stat-badge">전체</div>
          </div>
          <div className="stat-number">{nf.format(Number(stats.전체티켓 || 0))}</div>
          <div className="stat-label">티켓</div>
        </div>
        <div className="jira-stat-card received">
          <div className="stat-header">
            <div className="stat-icon"><FileText size={24} /></div>
            <div className="stat-badge">접수</div>
          </div>
          <div className="stat-number">{nf.format(Number(stats.접수 || 0))}</div>
          <div className="stat-label">대기 중</div>
        </div>
        <div className="jira-stat-card in-progress">
          <div className="stat-header">
            <div className="stat-icon"><Wrench size={24} /></div>
            <div className="stat-badge">진행</div>
          </div>
          <div className="stat-number">{nf.format(Number(stats.진행중 || 0))}</div>
          <div className="stat-label">처리 중</div>
        </div>
        <div className="jira-stat-card answered">
          <div className="stat-header">
            <div className="stat-icon"><CheckCircle size={24} /></div>
            <div className="stat-badge">완료</div>
          </div>
          <div className="stat-number">{nf.format(Number(stats.답변완료 || 0))}</div>
          <div className="stat-label">답변 완료</div>
        </div>
        <div className="jira-stat-card closed">
          <div className="stat-header">
            <div className="stat-icon"><FileCheck size={24} /></div>
            <div className="stat-badge">종료</div>
          </div>
          <div className="stat-number">{nf.format(Number(stats.종료 || 0))}</div>
          <div className="stat-label">해결됨</div>
        </div>
      </div>

      <div className="jira-charts-section">
        <div className="jira-chart-card">
          <h3>티켓 상태 분포</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie 
                data={pieRenderData} 
                dataKey="value" 
                nameKey="name" 
                cx="50%" 
                cy="50%" 
                outerRadius={80}
                labelLine={false}
                label={({ name, percent, value }) => {
                  if (!value || percent < 0.03) return '';
                  return `${name} ${(percent * 100).toFixed(0)}%`;
                }}
              >
                {pieRenderData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} style={{ cursor: 'pointer' }} onClick={() => navigateToList(entry.name)} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="jira-chart-card">
          <h3>일자별 생성 추이</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#0052CC" strokeWidth={3} dot={{ fill: '#0052CC', strokeWidth: 2, r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderKanban = () => (
    <div className="jira-kanban">
      <div className="kanban-columns">
        <div className="kanban-column received">
          <div className="column-header">
            <div className="column-title"><FileText size={20} /> 접수</div>
            <div className="column-count">{Number(stats.접수 || 0)}</div>
          </div>
          <div className="column-content" onClick={() => navigateToList('접수')}>
            <div className="kanban-placeholder">
              <div className="placeholder-icon">
              <FiTrello />
            </div>
              <div className="placeholder-text">접수된 티켓 보기</div>
            </div>
          </div>
        </div>

        <div className="kanban-column in-progress">
          <div className="column-header">
            <div className="column-title"><Wrench size={20} /> 진행중</div>
            <div className="column-count">{Number(stats.진행중 || 0)}</div>
          </div>
          <div className="column-content" onClick={() => navigateToList('진행중')}>
            <div className="kanban-placeholder">
              <div className="placeholder-icon"><Zap size={24} /></div>
              <div className="placeholder-text">진행중인 티켓 보기</div>
            </div>
          </div>
        </div>

        <div className="kanban-column answered">
          <div className="column-header">
            <div className="column-title"><CheckCircle size={20} /> 답변 완료</div>
            <div className="column-count">{Number(stats.답변완료 || 0)}</div>
          </div>
          <div className="column-content" onClick={() => navigateToList('답변 완료')}>
            <div className="kanban-placeholder">
              <div className="placeholder-icon"><FileText size={24} /></div>
              <div className="placeholder-text">답변 완료된 티켓 보기</div>
            </div>
          </div>
        </div>

        <div className="kanban-column closed">
          <div className="column-header">
            <div className="column-title"><FileCheck size={20} /> 종료</div>
            <div className="column-count">{Number(stats.종료 || 0)}</div>
          </div>
          <div className="column-content" onClick={() => navigateToList('종료')}>
            <div className="kanban-placeholder">
              <div className="placeholder-icon">
              <FiTarget />
            </div>
              <div className="placeholder-text">종료된 티켓 보기</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="jira-analytics">
      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>티켓 상태별 개수</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#0052CC">
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} style={{ cursor: 'pointer' }} onClick={() => navigateToList(entry.name)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="analytics-card">
          <h3>사용자 현황</h3>
          <div className="user-stats">
            <div className="user-stat-item">
              <div className="user-stat-icon">
              <FiUsers />
            </div>
              <div className="user-stat-content">
                <div className="user-stat-number">{nf.format(Number(stats.고객수 || 0))}</div>
                <div className="user-stat-label">고객</div>
              </div>
            </div>
            <div className="user-stat-item">
              <div className="user-stat-icon">
              <FiUserCheck />
            </div>
              <div className="user-stat-content">
                <div className="user-stat-number">{nf.format(Number(stats.관리자수 || 0))}</div>
                <div className="user-stat-label">관리자</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="jira-dashboard-container">
        {toast.show && (
          <div className={`jira-toast ${toast.type}`}>
            {toast.message}
          </div>
        )}

        {showConfirmModal && (
          <div className="jira-modal-overlay">
            <div className="jira-modal">
              <div className="modal-header">
                <h3>⚠️ SLA 자동 종료 확인</h3>
              </div>
              <div className="modal-content">
                <div className="sla-explanation">
                  <h4><FiFileText /> SLA 자동 종료 정책</h4>
                  <ul>
                    <li><strong>대상 티켓:</strong> 상태가 "답변 완료"인 티켓</li>
                    <li><strong>기준 기간:</strong> 답변 완료 후 7일간 고객 응답 없음</li>
                    <li><strong>처리 결과:</strong> 해당 티켓들이 "종료" 상태로 변경</li>
                    <li><strong>목적:</strong> 서비스 수준 협약(SLA) 준수 및 효율적인 티켓 관리</li>
                  </ul>
                </div>
                <div className="confirmation-question">
                  <p><strong>위 조건에 해당하는 티켓들을 자동으로 종료 처리하시겠습니까?</strong></p>
                </div>
                <div className="modal-warning">
                  <span>⚠️ 이 작업은 되돌릴 수 없습니다. 신중히 결정해 주세요.</span>
                </div>
              </div>
              <div className="modal-actions">
                <button 
                  className="modal-btn cancel"
                  onClick={() => setShowConfirmModal(false)}
                >
                  취소
                </button>
                <button 
                  className="modal-btn confirm"
                  onClick={handleAutoClose}
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="jira-header">
          <div className="jira-title-section">
            <h1>ITMS 관리자 대시보드</h1>
            <div className="jira-status">
              <span>마지막 업데이트: {lastUpdated.toLocaleString('ko-KR')}</span>
              {autoRefresh && <span className="auto-refresh-badge"><FiRefreshCw /> 자동 새로고침</span>}
            </div>
          </div>
        </div>

        <div className="jira-toolbar">
          <div className="jira-view-tabs">
            <button 
              className={`view-tab ${selectedView === 'overview' ? 'active' : ''}`}
              onClick={() => setSelectedView('overview')}
            >
              <FiBarChart2 /> 개요
            </button>
            <button 
              className={`view-tab ${selectedView === 'kanban' ? 'active' : ''}`}
              onClick={() => setSelectedView('kanban')}
            >
              <FiTrello /> 칸반 보드
            </button>
            <button 
              className={`view-tab ${selectedView === 'analytics' ? 'active' : ''}`}
              onClick={() => setSelectedView('analytics')}
            >
              <FiTrendingUp /> 분석
            </button>
          </div>

          <div className="jira-controls">
            <div className="jira-filters">
              <div className="filter-group">
                <label>기간</label>
                <select value={days} onChange={(e) => setDays(Number(e.target.value))}>
                  <option value={7}>7일</option>
                  <option value={30}>30일</option>
                  <option value={90}>90일</option>
                </select>
              </div>
              <div className="filter-group">
                <label>유형</label>
                <select value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="ALL">전체</option>
                  <option value="SR">SR</option>
                  <option value="SM">SM</option>
                </select>
              </div>
              <div className="filter-group">
                <label>자동 새로고침</label>
                <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />
              </div>
            </div>
            
            <div className="jira-actions">
              <button 
                className="jira-action-btn sla-btn"
                onClick={() => setShowConfirmModal(true)}
                disabled={autoClosing}
              >
                {autoClosing ? '처리 중...' : 'SLA 자동 종료'}
              </button>
            </div>
          </div>
        </div>

        <div className="jira-content">
          {selectedView === 'overview' && renderOverview()}
          {selectedView === 'kanban' && renderKanban()}
          {selectedView === 'analytics' && renderAnalytics()}
        </div>
      </div>
  );
};

export default AdminDashboardPage;
