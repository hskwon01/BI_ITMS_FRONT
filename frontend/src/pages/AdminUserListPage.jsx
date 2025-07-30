import React, { useEffect, useState } from 'react';
import { getAllUsers, approveUser } from '../api/user';
import '../css/AdminUserListPage.css';

import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

const AdminUserListPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const token = localStorage.getItem('token');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getAllUsers(token);
      setUsers(res.data);
      setFilteredUsers(res.data);
    } catch {
      alert('접근 권한이 없거나 오류 발생');
    } finally {
      setLoading(false);
    }
  };

  const toggleApproval = async (id, current) => {
    try {
      await approveUser(id, !current, token);
      fetchUsers(); // 갱신
 
      // 승인인 경우에만 이메일 전송
      if (!current) {
        await API.post(`/users/${id}/send-approval-email`, null, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch {
      alert('승인 처리 실패');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter(user =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.company_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const getStats = () => {
    const total = users.length;
    const approved = users.filter(u => u.is_approved).length;
    const pending = users.filter(u => !u.is_approved).length;
    const admins = users.filter(u => u.role === 'admin').length;
    const customers = users.filter(u => u.role === 'customer').length;
    
    return { total, approved, pending, admins, customers };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="admin-user-list-container">
        <div className="loading-spinner">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="admin-user-list-container">
      <div className="admin-user-header">
        <h1>고객 계정 관리</h1>
        <p className="admin-user-desc">모든 사용자 계정을 관리하고 승인하세요</p>
      </div>

      <div className="admin-user-stats">
        <div className="admin-user-stat-card total">
          <div className="stat-label">전체</div>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="admin-user-stat-card approved">
          <div className="stat-label">승인됨</div>
          <div className="stat-value">{stats.approved}</div>
        </div>
        <div className="admin-user-stat-card pending">
          <div className="stat-label">대기 중</div>
          <div className="stat-value">{stats.pending}</div>
        </div>
        <div className="admin-user-stat-card admin">
          <div className="stat-label">관리자</div>
          <div className="stat-value">{stats.admins}</div>
        </div>
        <div className="admin-user-stat-card customer">
          <div className="stat-label">고객</div>
          <div className="stat-value">{stats.customers}</div>
        </div>
      </div>

      <div className="admin-user-search">
        <input
          type="text"
          placeholder="이메일, 이름, 회사명으로 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="admin-user-table-wrapper">
        <table className="admin-user-table">
          <thead>
            <tr>
              <th>이메일</th>
              <th>이름</th>
              <th>회사</th>
              <th>권한</th>
              <th>승인 상태</th>
              <th>조작</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td className="user-email">{user.email}</td>
                <td className="user-name">{user.name}</td>
                <td className="user-company">{user.company_name}</td>
                <td>
                  <span className={`role-badge ${user.role}`}>
                    {user.role === 'admin' ? '관리자' : '고객'}
                  </span>
                </td>
                <td>
                  <span className={`approval-badge ${user.is_approved ? 'approved' : 'pending'}`}>
                    {user.is_approved ? '승인됨' : '대기 중'}
                  </span>
                </td>
                <td>
                  {user.role !== 'admin' && (
                    <button 
                      className={`approval-btn ${user.is_approved ? 'revoke' : 'approve'}`}
                      onClick={() => toggleApproval(user.id, user.is_approved)}
                    >
                      {user.is_approved ? '승인 취소' : '승인하기'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
          <div className="admin-user-empty">
            {searchTerm ? '검색 결과가 없습니다.' : '등록된 사용자가 없습니다.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUserListPage;
