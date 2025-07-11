import React, { useEffect, useState } from 'react';
import { getDashboardStats, autoCloseTickets } from '../api/dashboard';
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import '../css/AdminDashboardPage.css';

const COLORS = ['#ffd43b', '#67cd4e', '#7c83fd', '#868e96'];

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoClosing, setAutoClosing] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await getDashboardStats(token);
        setStats(res.data);
      } catch {
        alert('통계 조회 실패');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

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
      <div className="admin-dashboard-container">
        <div className="loading-spinner">로딩 중...</div>
      </div>
    );
  }

  if (!stats) return null;

  const pieData = [
    { name: '접수', value: Number(stats.접수) },
    { name: '진행중', value: Number(stats.진행중) },
    { name: '답변 완료', value: Number(stats.답변완료) },
    { name: '종결', value: Number(stats.종결) }
  ];

  const barData = [
    { name: '접수', value: Number(stats.접수) },
    { name: '진행중', value: Number(stats.진행중) },
    { name: '답변완료', value: Number(stats.답변완료) },
    { name: '종결', value: Number(stats.종결) }
  ];

  return (
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

      <div className="admin-dashboard-stats">
        <div className="admin-dashboard-stat-card total">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <div className="stat-label">전체 티켓</div>
            <div className="stat-value">{stats.전체티켓}</div>
          </div>
        </div>
        <div className="admin-dashboard-stat-card received">
          <div className="stat-icon">📥</div>
          <div className="stat-content">
            <div className="stat-label">접수</div>
            <div className="stat-value">{stats.접수}</div>
          </div>
        </div>
        <div className="admin-dashboard-stat-card in-progress">
          <div className="stat-icon">🔧</div>
          <div className="stat-content">
            <div className="stat-label">진행중</div>
            <div className="stat-value">{stats.진행중}</div>
          </div>
        </div>
        <div className="admin-dashboard-stat-card answered">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-label">답변 완료</div>
            <div className="stat-value">{stats.답변완료}</div>
          </div>
        </div>
        <div className="admin-dashboard-stat-card closed">
          <div className="stat-icon">📁</div>
          <div className="stat-content">
            <div className="stat-label">종결</div>
            <div className="stat-value">{stats.종결}</div>
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
          <PieChart width={400} height={300}>
            <Pie 
              data={pieData} 
              dataKey="value" 
              nameKey="name" 
              cx="50%" 
              cy="50%" 
              outerRadius={100} 
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>

        <div className="chart-container">
          <h3>티켓 상태별 개수</h3>
          <BarChart width={400} height={300} data={barData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#ffd43b">
              {barData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </div>
      </div>

      <div className="admin-dashboard-summary">
        <div className="summary-card">
          <h3>사용자 현황</h3>
          <div className="summary-stats">
            <div className="summary-item">
              <span className="summary-label">고객 수:</span>
              <span className="summary-value">{stats.고객수}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">관리자 수:</span>
              <span className="summary-value">{stats.관리자수}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
