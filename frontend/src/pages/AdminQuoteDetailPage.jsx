import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getQuote, updateQuote } from '../api/quotes';
import { useUser } from '../contexts/UserContext';
import '../css/QuoteDetailPage.css';

const AdminQuoteDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusReason, setStatusReason] = useState('');
  const [statusHistory, setStatusHistory] = useState([]);

  useEffect(() => {
    loadQuote();
  }, [id]);

  const loadQuote = async () => {
    try {
      setLoading(true);
      const response = await getQuote(id);
      setQuote(response.data);
      
      // 상태 변경 히스토리 생성 (실제 API에서 제공하는 경우 해당 데이터 사용)
      generateStatusHistory(response.data);
    } catch (error) {
      console.error('견적 조회 실패:', error);
      if (error.response?.status === 404) {
        alert('견적을 찾을 수 없습니다.');
        navigate('/admin/quote-requests');
      } else if (error.response?.status === 403) {
        alert('접근 권한이 없습니다.');
        navigate('/admin/quote-requests');
      }
    } finally {
      setLoading(false);
    }
  };

  // 상태 변경 히스토리 생성 (실제로는 백엔드에서 제공해야 함)
  const generateStatusHistory = (quoteData) => {
    const history = [
      {
        id: 1,
        status: 'draft',
        status_label: '임시저장',
        reason: null,
        changed_by: quoteData.customer_name,
        changed_at: quoteData.created_at,
        description: '견적 요청이 등록되었습니다.'
      }
    ];

    if (quoteData.status !== 'draft') {
      history.push({
        id: 2,
        status: quoteData.status,
        status_label: getStatusLabel(quoteData.status),
        reason: quoteData.status_reason,
        changed_by: '관리자',
        changed_at: quoteData.updated_at || quoteData.created_at,
        description: getStatusDescription(quoteData.status)
      });
    }

    setStatusHistory(history);
  };

  const getStatusDescription = (status) => {
    const descriptions = {
      'pending': '견적 요청이 검토 대기 상태로 변경되었습니다.',
      'approved': '견적 요청이 승인되었습니다.',
      'rejected': '견적 요청이 거부되었습니다.'
    };
    return descriptions[status] || '상태가 변경되었습니다.';
  };

  const handleStatusChange = async () => {
    try {
      setUpdating(true);
      const updateData = { status: selectedStatus };
      if (statusReason.trim()) {
        updateData.status_reason = statusReason;
      }
      
      await updateQuote(id, updateData);
      
      // 상태 히스토리에 새 항목 추가
      const newHistoryItem = {
        id: statusHistory.length + 1,
        status: selectedStatus,
        status_label: getStatusLabel(selectedStatus),
        reason: statusReason.trim() || null,
        changed_by: user?.data?.name || '관리자',
        changed_at: new Date().toISOString(),
        description: getStatusDescription(selectedStatus)
      };
      
      setStatusHistory(prev => [...prev, newHistoryItem]);
      setQuote(prev => ({ ...prev, status: selectedStatus, status_reason: statusReason }));
      alert('상태가 변경되었습니다.');
      setShowStatusModal(false);
      setSelectedStatus('');
      setStatusReason('');
    } catch (error) {
      console.error('상태 변경 실패:', error);
      alert('상태 변경에 실패했습니다.');
    } finally {
      setUpdating(false);
    }
  };

  const formatPrice = (price) => {
    if (!price) return '₩0';
    return `₩${new Intl.NumberFormat('ko-KR').format(price)}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      'draft': '임시저장',
      'pending': '검토중',
      'approved': '승인됨',
      'rejected': '거절됨'
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status) => {
    const classMap = {
      'draft': 'status-draft',
      'pending': 'status-pending',
      'approved': 'status-approved',
      'rejected': 'status-rejected'
    };
    return classMap[status] || 'status-draft';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return '#6c757d';
      case 'pending': return '#ffc107';
      case 'approved': return '#28a745';
      case 'rejected': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getAvailableActions = (currentStatus) => {
    const actions = {
      'draft': [
        { status: 'pending', label: '검토 시작', icon: '🔍', color: 'warning' }
      ],
      'pending': [
        { status: 'approved', label: '승인', icon: '✅', color: 'success' },
        { status: 'rejected', label: '거절', icon: '❌', color: 'danger' }
      ],
      'approved': [
        { status: 'pending', label: '재검토', icon: '🔄', color: 'warning' }
      ],
      'rejected': [
        { status: 'pending', label: '재검토', icon: '🔄', color: 'warning' }
      ]
    };
    return actions[currentStatus] || [];
  };

  if (loading) {
    return (
      <div className="admin-quote-wrapper">
        <div className="quote-detail-container">
          <div className="loading">견적을 불러오는 중...</div>
        </div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="admin-quote-wrapper">
        <div className="quote-detail-container">
          <div className="error">견적을 찾을 수 없습니다.</div>
        </div>
      </div>
    );
  }

  const availableActions = getAvailableActions(quote.status);

  return (
    <div className="admin-quote-wrapper">
      <div className="quote-detail-container">
        {/* 헤더 */}
        <div className="quote-header">
          <div className="header-top">
            <div className="breadcrumb">
              <Link to="/admin/quote-requests">견적 요청 관리</Link>
              <span className="separator">›</span>
              <span>견적 상세</span>
            </div>
          </div>
          
          <div className="quote-title-section">
            <h1>{quote.title}</h1>
            <span className={`quote-status ${getStatusClass(quote.status)}`}>
              {getStatusLabel(quote.status)}
            </span>
          </div>
        </div>

        {/* 2단 레이아웃: 메인 콘텐츠와 사이드바 */}
        <div className="quote-layout">
          {/* 메인 콘텐츠 영역 */}
          <div className="quote-main-content">
            {/* 견적 항목 */}
            <div className="quote-items-section">
              <h2>견적 항목</h2>
              {quote.items && quote.items.length > 0 ? (
                <div className="items-table-container">
                  <table className="items-table">
                    <thead>
                      <tr>
                        <th>제품명</th>
                        <th>수량</th>
                        <th>단가</th>
                        <th>합계</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quote.items.map((item, index) => (
                        <tr key={index}>
                          <td>
                            <div className="item-info">
                              <div className="item-name">{item.product_name}</div>
                              {item.product_description && (
                                <div className="item-description">{item.product_description}</div>
                              )}
                            </div>
                          </td>
                          <td>{item.quantity.toLocaleString()}개</td>
                          <td>{formatPrice(item.unit_price)}</td>
                          <td className="total-price">{formatPrice(item.total_price)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  <div className="total-section">
                    <div className="total-amount">
                      <span>총 견적금액: </span>
                      <strong>{formatPrice(quote.total_amount)}</strong>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="no-items">
                  <p>견적 항목이 없습니다.</p>
                </div>
              )}
            </div>

            {/* 상태 변경 히스토리 */}
            <div className="status-history-section">
              <h2>상태 변경 히스토리</h2>
              <div className="status-history-timeline">
                {statusHistory.map((item, index) => (
                  <div key={item.id} className={`timeline-item ${index === statusHistory.length - 1 ? 'latest' : ''}`}>
                    <div className="timeline-marker">
                      <div className="marker-icon">{getStatusIcon(item.status)}</div>
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <span className={`status-badge ${getStatusClass(item.status)}`}>
                          {item.status_label}
                        </span>
                        <span className="timeline-date">{formatDate(item.changed_at)}</span>
                      </div>
                      <div className="timeline-description">{item.description}</div>
                      {item.reason && (
                        <div className="timeline-reason">
                          <strong>변경 사유:</strong> {item.reason}
                        </div>
                      )}
                      <div className="timeline-user">
                        <span className="user-label">처리자:</span>
                        <span className="user-name">{item.changed_by}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 사이드바 영역 */}
          <div className="quote-sidebar">
            {/* 기본 정보 */}
            <div className="quote-info-section">
              <h3>기본 정보</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>견적번호</label>
                  <span>Q{String(quote.id).padStart(6, '0')}</span>
                </div>
                <div className="info-item">
                  <label>요청자</label>
                  <span>{quote.customer_name}</span>
                </div>
                <div className="info-item">
                  <label>이메일</label>
                  <span>{quote.customer_email}</span>
                </div>
                <div className="info-item">
                  <label>회사명</label>
                  <span>{quote.customer_company || '-'}</span>
                </div>
                <div className="info-item">
                  <label>생성일</label>
                  <span>{formatDate(quote.created_at)}</span>
                </div>
                <div className="info-item">
                  <label>유효기간</label>
                  <span className={new Date(quote.valid_until) < new Date() ? 'expired' : ''}>
                    {formatDate(quote.valid_until)}
                    {new Date(quote.valid_until) < new Date() && ' (만료됨)'}
                  </span>
                </div>
              </div>

              {quote.notes && (
                <div className="notes-section">
                  <label>메모</label>
                  <div className="notes-content">{quote.notes}</div>
                </div>
              )}

              {quote.status_reason && (
                <div className="status-reason-section">
                  <label>상태 변경 사유</label>
                  <div className="status-reason-content">{quote.status_reason}</div>
                </div>
              )}
            </div>

            {/* 상태 관리 */}
            <div className="status-management-section">
              <h3>상태 관리</h3>
              <div className="current-status">
                <label>현재 상태:</label>
                <span className={`status-badge ${getStatusClass(quote.status)}`}>
                  {getStatusLabel(quote.status)}
                </span>
              </div>
              
              {availableActions.length > 0 && (
                <div className="status-actions">
                  {availableActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedStatus(action.status);
                        setShowStatusModal(true);
                      }}
                      disabled={updating}
                      className={`btn btn-${action.color} action-btn`}
                    >
                      <span className="action-icon">{action.icon}</span>
                      <span className="action-label">{action.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {availableActions.length === 0 && (
                <div className="no-actions">
                  <p>현재 상태에서는 추가 액션이 없습니다.</p>
                </div>
              )}
            </div>

            {/* 빠른 액션 */}
            <div className="quick-actions-section">
              <h3>빠른 액션</h3>
              <div className="quick-actions">
                <button className="quick-action-btn">
                  <span className="action-icon">📧</span>
                  <span>고객에게 연락</span>
                </button>
                <button className="quick-action-btn">
                  <span className="action-icon">📄</span>
                  <span>견적서 다운로드</span>
                </button>
                <button className="quick-action-btn">
                  <span className="action-icon">📋</span>
                  <span>내역 복사</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 네비게이션 */}
        <div className="bottom-nav">
          <Link to="/admin/quote-requests" className="btn btn-secondary">
            목록으로 돌아가기
          </Link>
        </div>
      </div>

      {/* 상태 변경 모달 */}
      {showStatusModal && (
        <div className="modal-overlay">
          <div className="status-modal">
            <div className="modal-header">
              <h3>상태 변경</h3>
            </div>
            <div className="modal-content">
              <p>견적 상태를 '{getStatusLabel(selectedStatus)}'로 변경하시겠습니까?</p>
              
              <div className="form-group">
                <label htmlFor="status-reason">변경 사유 (선택 사항):</label>
                <textarea
                  id="status-reason"
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  placeholder="상태 변경 사유를 입력하세요..."
                  className="status-reason-textarea"
                  rows="3"
                />
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className="modal-btn cancel"
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedStatus('');
                  setStatusReason('');
                }}
                disabled={updating}
              >
                취소
              </button>
              <button 
                className="modal-btn confirm"
                onClick={handleStatusChange}
                disabled={updating}
              >
                {updating ? '변경 중...' : '변경'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 상태별 아이콘 반환 함수
const getStatusIcon = (status) => {
  const icons = {
    'draft': '📝',
    'pending': '🔍',
    'approved': '✅',
    'rejected': '❌'
  };
  return icons[status] || '📋';
};

export default AdminQuoteDetailPage;
