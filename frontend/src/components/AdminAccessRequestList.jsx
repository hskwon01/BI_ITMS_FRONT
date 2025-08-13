import React, { useState, useEffect } from 'react';
import { getRequests, approveRequest, rejectRequest } from '../api/magicLink';
import { useToast } from '../contexts/ToastContext';
import '../css/AdminAccessRequestPage.css'; // CSS 파일 임포트

const AdminAccessRequestList = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('pending');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const { showSuccess, showError, showWarning } = useToast();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await getRequests(status);
        setRequests(res.data);
      } catch (err) {
        setError('요청 목록을 불러오는 데 실패했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [status]);

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
        await approveRequest(id);
        setRequests(requests.filter(req => req.id !== id));
        showSuccess('요청이 승인되었습니다. 사용자에게 로그인 링크가 발송되었습니다.');
      } else if (action === 'reject') {
        await rejectRequest(id);
        setRequests(requests.filter(req => req.id !== id));
        showSuccess('요청이 거부되었습니다.');
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
  };

  const handleApprove = (id) => {
    showConfirmDialog('approve', id, '이 요청을 승인하고 로그인 링크를 발송하시겠습니까?');
  };

  const handleReject = (id) => {
    showConfirmDialog('reject', id, '이 요청을 거부하시겠습니까?');
  };

  if (loading) return <div className="loading-spinner"></div>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <>
      <div className="admin-access-table-wrapper">
        <div className="filter-bar">
          <label htmlFor="statusFilter">상태</label>
          <div className="select-wrapper">
            <select id="statusFilter" className="select-control" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="pending">대기</option>
            <option value="approved">승인</option>
            <option value="rejected">거부</option>
            <option value="used">사용됨</option>
            <option value="all">전체</option>
            </select>
          </div>
        </div>
        {requests.length === 0 ? (
          <div className="admin-access-empty">표시할 요청이 없습니다.</div>
        ) : (
          <table className="admin-access-table">
            <thead>
              <tr>
                <th>이름</th>
                <th>이메일</th>
                <th>회사</th>
                <th>요청일</th>
                <th>상태</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(req => (
                <tr key={req.id}>
                  <td className="user-name">{req.name}</td>
                  <td className="user-email">{req.email}</td>
                  <td className="user-company">{req.company_name}</td>
                  <td>{new Date(req.created_at).toLocaleDateString()}</td>
                  <td>{req.status}</td>
                  <td className="action-buttons">
                    <button className={`action-btn approve ${req.status !== 'pending' ? 'disabled' : ''}`} onClick={() => handleApprove(req.id)} disabled={req.status !== 'pending'}>승인</button>
                    <button className="action-btn reject" onClick={() => handleReject(req.id)} disabled={req.status !== 'pending'}>거부</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 확인 모달 */}
      {showConfirmModal && (
        <div className="modal-overlay" onClick={handleCancel}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>확인</h3>
            </div>
            <div className="modal-body">
              <p>
                {pendingAction?.action === 'approve' 
                  ? '이 요청을 승인하고 로그인 링크를 발송하시겠습니까?' 
                  : '이 요청을 거부하시겠습니까?'}
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={handleCancel}>
                취소
              </button>
              <button 
                className={`btn ${pendingAction?.action === 'approve' ? 'btn-success' : 'btn-danger'}`} 
                onClick={handleConfirm}
              >
                {pendingAction?.action === 'approve' ? '승인' : '거부'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 모달 스타일 */}
      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 8px;
          padding: 0;
          max-width: 400px;
          width: 90%;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .modal-header {
          padding: 20px 20px 0 20px;
          border-bottom: 1px solid #e2e8f0;
        }

        .modal-header h3 {
          margin: 0;
          color: #2d3652;
          font-size: 18px;
          font-weight: 600;
        }

        .modal-body {
          padding: 20px;
        }

        .modal-body p {
          margin: 0;
          color: #4a5568;
          font-size: 16px;
          line-height: 1.5;
        }

        .modal-footer {
          padding: 0 20px 20px 20px;
          display: flex;
          gap: 10px;
          justify-content: flex-end;
        }

        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .btn-secondary {
          background-color: #e2e8f0;
          color: #4a5568;
        }

        .btn-secondary:hover {
          background-color: #cbd5e0;
        }

        .btn-success {
          background-color: #38a169;
          color: white;
        }

        .btn-success:hover {
          background-color: #2f855a;
        }

        .btn-danger {
          background-color: #e53e3e;
          color: white;
        }

        .btn-danger:hover {
          background-color: #c53030;
        }
      `}</style>
    </>
  );
};

export default AdminAccessRequestList;
