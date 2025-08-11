import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats, autoCloseTickets, getTrends } from '../api/dashboard';
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line } from 'recharts';
import CommonLayout from '../components/CommonLayout';
import '../css/AdminDashboardPage.css';

const COLORS = ['#ffd43b', '#67cd4e', '#7c83fd', '#868e96'];

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
      showToast('자동 종결 처리에 실패했습니다.', 'error');
    } finally {
      setAutoClosing(false);
    }
  };

  if (loading) {
    return (
      <CommonLayout>
        <div className="admin-dashboard-container">
          <div className="loading-spinner">로딩 중...</div>
        </div>
      </CommonLayout>
    );
  }

  if (!stats) return null;

  const pieData = [
    { name: '접수', value: Number(stats.접수) },
    { name: '진행중', value: Number(stats.진행중) },
    { name: '답변 완료', value: Number(stats.답변완료) },
    { name: '종결', value: Number(stats.종결) }
  ];
  const hasNonZeroPie = pieData.some(d => d.value > 0);
  const pieRenderData = hasNonZeroPie ? pieData.filter(d => d.value > 0) : pieData;

  const barData = [
    { name: '접수', value: Number(stats.접수) },
    { name: '진행중', value: Number(stats.진행중) },
    { name: '답변완료', value: Number(stats.답변완료) },
    { name: '종결', value: Number(stats.종결) }
  ];

  const nf = new Intl.NumberFormat('ko-KR');

  const navigateToList = (statusLabel) => {
    const path = type === 'SM' ? '/admin/tickets/sm' : '/admin/tickets';
    navigate(`${path}?status=${encodeURIComponent(statusLabel)}`);
  };

  return (
    <CommonLayout>
      <div className="admin-dashboard-container">
        {toast.show && (
          <div className={`toast-notification ${toast.type}`}>
            {toast.message}
          </div>
        )}

      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <div className="modal-header">
              <h3>⚠️ SLA 자동 종결 확인</h3>
            </div>
            <div className="modal-content">
              <p>답변 완료된 티켓 중 7일간 고객 응답이 없는 티켓을 자동으로 종결 처리하시겠습니까?</p>
              <div className="modal-warning">
                <span>⚠️ 이 작업은 되돌릴 수 없습니다.</span>
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
      
      <div className="admin-dashboard-header">
        <h1>관리자 대시보드</h1>
        <p className="admin-dashboard-desc">시스템 현황을 한눈에 확인하세요</p>
      </div>

      <div className="admin-dashboard-filters">
        <div className="filter-group">
          <label>기간</label>
          <select value={days} onChange={(e) => setDays(Number(e.target.value))}>
            <option value={7}>최근 7일</option>
            <option value={30}>최근 30일</option>
            <option value={90}>최근 90일</option>
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

      <div className="admin-dashboard-stats">
        <div className="admin-dashboard-stat-card total">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <div className="stat-label">전체 티켓</div>
            <div className="stat-value">{nf.format(Number(stats.전체티켓 || 0))}</div>
          </div>
        </div>
        <div className="admin-dashboard-stat-card received">
          <div className="stat-icon">📥</div>
          <div className="stat-content">
            <div className="stat-label">접수</div>
            <div className="stat-value">{nf.format(Number(stats.접수 || 0))}</div>
          </div>
        </div>
        <div className="admin-dashboard-stat-card in-progress">
          <div className="stat-icon">🔧</div>
          <div className="stat-content">
            <div className="stat-label">진행중</div>
            <div className="stat-value">{nf.format(Number(stats.진행중 || 0))}</div>
          </div>
        </div>
        <div className="admin-dashboard-stat-card answered">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-label">답변 완료</div>
            <div className="stat-value">{nf.format(Number(stats.답변완료 || 0))}</div>
          </div>
        </div>
        <div className="admin-dashboard-stat-card closed">
          <div className="stat-icon">📁</div>
          <div className="stat-content">
            <div className="stat-label">종결</div>
            <div className="stat-value">{nf.format(Number(stats.종결 || 0))}</div>
          </div>
        </div>
      </div>

      <div className="admin-dashboard-actions">
        <button 
          className="auto-close-btn"
          onClick={() => setShowConfirmModal(true)}
          disabled={autoClosing}
        >
          {autoClosing ? '처리 중...' : 'SLA 자동 종결 실행'}
        </button>
      </div>

      <div className="admin-dashboard-charts">
        <div className="chart-container">
          <h3>티켓 상태 분포</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie 
                data={pieRenderData} 
                dataKey="value" 
                nameKey="name" 
                cx="50%" 
                cy="50%" 
                outerRadius={100}
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

        <div className="chart-container">
          <h3>티켓 상태별 개수</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#ffd43b">
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} style={{ cursor: 'pointer' }} onClick={() => navigateToList(entry.name)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="admin-dashboard-charts">
        <div className="chart-container" style={{ gridColumn: '1 / -1' }}>
          <h3>일자별 티켓 생성 추이</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#7c83fd" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="admin-dashboard-summary">
        <div className="summary-card">
          <h3>사용자 현황</h3>
          <div className="summary-stats">
            <div className="summary-item">
              <span className="summary-label">고객 수:</span>
              <span className="summary-value">{nf.format(Number(stats.고객수 || 0))}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">관리자 수:</span>
              <span className="summary-value">{nf.format(Number(stats.관리자수 || 0))}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    </CommonLayout>
  );
};

export default AdminDashboardPage;
