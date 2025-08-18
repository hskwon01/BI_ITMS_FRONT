import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getQuoteRequests, approveQuoteRequest, rejectQuoteRequest } from '../api/quotes';
import { useToast } from '../contexts/ToastContext';
import { formatDateTime } from '../utils/timeUtils';
import '../css/AdminQuoteRequestsPage.css';

const AdminQuoteRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('pending');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchRequests();
  }, [status]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await getQuoteRequests({ status });
      setRequests(res.data.items || []);
    } catch (err) {
      console.error('견적 요청 목록 조회 실패:', err);
      showError('견적 요청 목록을 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const showConfirmDialog = (action, id, message) => {
    setPendingAction({ action, id });
    setShowConfirmModal(true);
  };

  const handleConfirm = async () => {
    if (!pendingAction) return;

    const { action, id } = pendingAction;
    setShowConfirmModal(false);
    setPendingAction(null);

    try {
      if (action === 'approve') {
        await approveQuoteRequest(id);
        setRequests(requests.filter(req => req.id !== id));
        showSuccess('견적 요청이 승인되었습니다.');
      } else if (action === 'reject') {
        await rejectQuoteRequest(id, rejectReason);
        setRequests(requests.filter(req => req.id !== id));
        showSuccess('견적 요청이 거부되었습니다.');
        setRejectReason('');
      }
    } catch (err) {
      const errorMessage = action === 'approve' 
        ? '승인 처리 중 오류가 발생했습니다.' 
        : '거부 처리 중 오류가 발생했습니다.';
      showError(errorMessage);
      console.error(err);
    }
  };

  const handleCancel = () => {
    setShowConfirmModal(false);
    setPendingAction(null);
    setRejectReason('');
  };

  const handleApprove = (id) => {
    showConfirmDialog('approve', id, '이 견적 요청을 승인하시겠습니까?');
  };

  const handleReject = (id) => {
    showConfirmDialog('reject', id, '이 견적 요청을 거부하시겠습니까?');
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'pending';
      case 'draft': return 'draft';
      case 'approved': return 'approved';
      case 'rejected': return 'rejected';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return '승인 대기';
      case 'draft': return '임시저장';
      case 'approved': return '승인됨';
      case 'rejected': return '거부됨';
      default: return status;
    }
  };

  if (loading) return <div className="admin-quote-requests-loading">로딩 중...</div>;

  return (
    <div className="admin-quote-requests-container">
      <div className="admin-quote-requests-header">
        <h1>견적 요청 관리</h1>
        <p className="admin-quote-requests-desc">고객의 견적 요청을 승인하거나 거부할 수 있습니다.</p>
      </div>

      <div className="admin-quote-requests-filters">
        <div className="filter-group">
          <label htmlFor="statusFilter">상태</label>
          <select 
            id="statusFilter" 
            value={status} 
            onChange={(e) => setStatus(e.target.value)}
            className="status-select"
          >
            <option value="pending">승인 대기</option>
            <option value="draft">임시저장</option>
            <option value="approved">승인됨</option>
            <option value="rejected">거부됨</option>
            <option value="all">전체</option>
          </select>
        </div>
      </div>

      <div className="admin-quote-requests-table-wrapper">
        {requests.length === 0 ? (
          <div className="admin-quote-requests-empty">
            {status === 'pending' ? '승인 대기 중인 견적 요청이 없습니다.' : '표시할 견적 요청이 없습니다.'}
          </div>
        ) : (
          <table className="admin-quote-requests-table">
            <thead>
              <tr>
                <th>고객명</th>
                <th>회사</th>
                <th>견적 제목</th>
                <th>요청일</th>
                <th>상태</th>
                <th>액션</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(request => (
                <tr key={request.id}>
                  <td>
                    <div className="customer-info">
                      <div className="customer-name">{request.customer_name}</div>
                      <div className="customer-email">{request.customer_email}</div>
                    </div>
                  </td>
                  <td>{request.customer_company || '-'}</td>
                  <td>
                    <Link to={`/admin/quotes/${request.id}`} className="quote-title-link">
                      {request.title}
                    </Link>
                  </td>
                  <td>{formatDateTime(request.created_at)}</td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(request.status)}`}>
                      {getStatusText(request.status)}
                    </span>
                  </td>
                  <td>
                    {request.status === 'pending' && (
                      <div className="action-buttons">
                        <button 
                          onClick={() => handleApprove(request.id)}
                          className="approve-btn"
                        >
                          승인
                        </button>
                        <button 
                          onClick={() => handleReject(request.id)}
                          className="reject-btn"
                        >
                          거부
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 확인 모달 */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>확인</h3>
            <p>
              {pendingAction?.action === 'approve' 
                ? '이 견적 요청을 승인하시겠습니까?' 
                : '이 견적 요청을 거부하시겠습니까?'}
            </p>
            
            {pendingAction?.action === 'reject' && (
              <div className="reject-reason-input">
                <label htmlFor="rejectReason">거부 사유 (선택사항)</label>
                <textarea
                  id="rejectReason"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="거부 사유를 입력하세요..."
                  rows="3"
                />
              </div>
            )}
            
            <div className="modal-actions">
              <button onClick={handleConfirm} className="confirm-btn">
                {pendingAction?.action === 'approve' ? '승인' : '거부'}
              </button>
              <button onClick={handleCancel} className="cancel-btn">
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQuoteRequestsPage;
