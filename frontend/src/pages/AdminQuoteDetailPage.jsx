import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getQuote, deleteQuote, updateQuote } from '../api/quotes';
import { useUser } from '../contexts/UserContext';
import '../css/QuoteDetailPage.css';

const AdminQuoteDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusReason, setStatusReason] = useState('');

  useEffect(() => {
    loadQuote();
  }, [id]);

  const loadQuote = async () => {
    try {
      setLoading(true);
      const response = await getQuote(id);
      setQuote(response.data);
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

  const handleDelete = async () => {
    try {
      await deleteQuote(id);
      alert('견적이 삭제되었습니다.');
      navigate('/admin/quote-requests');
    } catch (error) {
      console.error('견적 삭제 실패:', error);
      alert('삭제에 실패했습니다.');
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleStatusChange = async () => {
    try {
      setUpdating(true);
      const updateData = { status: selectedStatus };
      if (statusReason.trim()) {
        updateData.status_reason = statusReason;
      }
      
      await updateQuote(id, updateData);
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
            <div className="header-actions">
              <Link to={`/quotes/${id}/edit`} className="btn btn-primary">
                수정
              </Link>
              <button onClick={() => setShowDeleteModal(true)} className="btn btn-danger">
                삭제
              </button>
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
            {/* 기본 정보 */}
            <div className="quote-info-section">
              <h2>기본 정보</h2>
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
          </div>

          {/* 사이드바 영역 */}
          <div className="quote-sidebar">
            {/* 상태 관리 */}
            <div className="status-management-section">
              <h3>상태 관리</h3>
              <div className="current-status">
                <label>현재 상태:</label>
                <span className={`status-badge ${getStatusClass(quote.status)}`}>
                  {getStatusLabel(quote.status)}
                </span>
              </div>
              
              <div className="status-actions">
                <button
                  onClick={() => {
                    setSelectedStatus('pending');
                    setShowStatusModal(true);
                  }}
                  disabled={updating || quote.status === 'pending'}
                  className="btn btn-warning"
                >
                  검토중으로 변경
                </button>
                <button
                  onClick={() => {
                    setSelectedStatus('approved');
                    setShowStatusModal(true);
                  }}
                  disabled={updating || quote.status === 'approved'}
                  className="btn btn-success"
                >
                  승인
                </button>
                <button
                  onClick={() => {
                    setSelectedStatus('rejected');
                    setShowStatusModal(true);
                  }}
                  disabled={updating || quote.status === 'rejected'}
                  className="btn btn-danger"
                >
                  거절
                </button>
              </div>
            </div>

            {/* 진행 상황 */}
            <div className="quote-progress-section">
              <h3>진행 상황</h3>
              <div className="progress-steps">
                <div className={`progress-step ${['draft', 'pending', 'approved', 'rejected'].includes(quote.status) ? 'completed' : ''}`}>
                  <div className="step-icon">📝</div>
                  <div className="step-content">
                    <div className="step-title">견적 요청</div>
                    <div className="step-description">견적이 등록되었습니다</div>
                    {quote.status === 'draft' && <div className="step-date">{formatDate(quote.created_at)}</div>}
                  </div>
                </div>
                
                <div className={`progress-step ${['pending', 'approved', 'rejected'].includes(quote.status) ? 'completed' : ''} ${quote.status === 'pending' ? 'current' : ''}`}>
                  <div className="step-icon">🔍</div>
                  <div className="step-content">
                    <div className="step-title">검토중</div>
                    <div className="step-description">관리자가 검토 중입니다</div>
                    {quote.status === 'pending' && <div className="step-date">{formatDate(quote.updated_at)}</div>}
                  </div>
                </div>
                
                <div className={`progress-step ${['approved', 'rejected'].includes(quote.status) ? 'completed' : ''} ${['approved', 'rejected'].includes(quote.status) ? 'current' : ''}`}>
                  <div className="step-icon">✅</div>
                  <div className="step-content">
                    <div className="step-title">처리 완료</div>
                    <div className="step-description">승인 또는 거절 처리됨</div>
                    {['approved', 'rejected'].includes(quote.status) && <div className="step-date">{formatDate(quote.updated_at)}</div>}
                  </div>
                </div>
              </div>
            </div>

            {/* 고객 정보 */}
            <div className="customer-info-section">
              <h3>고객 정보</h3>
              <div className="customer-details">
                <div className="customer-item">
                  <label>이름:</label>
                  <span>{quote.customer_name}</span>
                </div>
                <div className="customer-item">
                  <label>이메일:</label>
                  <span>{quote.customer_email}</span>
                </div>
                <div className="customer-item">
                  <label>회사:</label>
                  <span>{quote.customer_company || '미입력'}</span>
                </div>
                <div className="customer-item">
                  <label>요청일:</label>
                  <span>{formatDate(quote.created_at)}</span>
                </div>
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

      {/* 삭제 확인 모달 */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <div className="modal-header">
              <h3>⚠️ 견적 삭제 확인</h3>
            </div>
            <div className="modal-content">
              <p>이 견적을 삭제하시겠습니까?</p>
              <div className="modal-warning">
                <span>삭제된 견적은 복구할 수 없습니다.</span>
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className="modal-btn cancel"
                onClick={() => setShowDeleteModal(false)}
              >
                취소
              </button>
              <button 
                className="modal-btn confirm"
                onClick={handleDelete}
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

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

export default AdminQuoteDetailPage;
