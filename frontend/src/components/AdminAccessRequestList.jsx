import React, { useState, useEffect } from 'react';
import { getRequests, approveRequest, rejectRequest } from '../api/magicLink';
import '../css/AdminAccessRequestPage.css'; // CSS 파일 임포트

const AdminAccessRequestList = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('pending');

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

  const handleApprove = async (id) => {
    if (!window.confirm('이 요청을 승인하고 로그인 링크를 발송하시겠습니까?')) return;
    try {
      await approveRequest(id);
      setRequests(requests.filter(req => req.id !== id));
      alert('요청이 승인되었습니다. 사용자에게 로그인 링크가 발송되었습니다.');
    } catch (err) {
      alert('승인 처리 중 오류가 발생했습니다.');
      console.error(err);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('이 요청을 거부하시겠습니까?')) return;
    try {
      await rejectRequest(id);
      setRequests(requests.filter(req => req.id !== id));
      alert('요청이 거부되었습니다.');
    } catch (err) {
      alert('거부 처리 중 오류가 발생했습니다.');
      console.error(err);
    }
  };

  if (loading) return <div className="loading-spinner"></div>;
  if (error) return <p className="error-message">{error}</p>;

  return (
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
  );
};

export default AdminAccessRequestList;
