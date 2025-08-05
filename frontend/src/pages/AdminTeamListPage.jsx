import React, { useEffect, useState } from 'react';
import { getTeam, createTeamMember } from '../api/user';
import { jwtDecode } from 'jwt-decode';
import AdminLayout from '../components/AdminLayout';
import '../css/AdminUserListPage.css'; // 기존 CSS 재활용

const AdminTeamListPage = () => {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', password: '', name: '', role: 'itsm_team' });
  const [currentUserRole, setCurrentUserRole] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) {
      const decoded = jwtDecode(token);
      setCurrentUserRole(decoded.role);
    }
    fetchTeam();
  }, [token]);

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const res = await getTeam(token);
      setTeam(res.data);
    } catch {
      alert('팀 목록을 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await createTeamMember(newUser, token);
      setShowModal(false);
      fetchTeam();
      setNewUser({ email: '', password: '', name: '', role: 'itsm_team' });
    } catch (err) {
      alert(err.response?.data?.error || '팀 멤버 생성에 실패했습니다.');
    }
  };

  const handleModalChange = (e) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  const getRoleName = (role) => {
    if (role === 'admin') return '관리자';
    if (role === 'itsm_team') return '기술지원팀';
    return role;
  };

  if (loading) {
    return <div className="loading-spinner">로딩 중...</div>;
  }

  return (
    <AdminLayout>
      <div className="admin-user-list-container">
        <div className="admin-user-header">
          <h1>팀 멤버 관리</h1>
          <p className="admin-user-desc">내부 팀 멤버(관리자, 기술지원팀) 계정을 관리합니다.</p>
        </div>

      {currentUserRole === 'admin' && (
        <div className="add-user-section">
          <button onClick={() => setShowModal(true)} className="add-user-btn">+ 새로운 팀 멤버 추가</button>
        </div>
      )}

      <div className="admin-user-table-wrapper">
        <table className="admin-user-table">
          <thead>
            <tr>
              <th>이메일</th>
              <th>이름</th>
              <th>권한</th>
            </tr>
          </thead>
          <tbody>
            {team.map(user => (
              <tr key={user.id}>
                <td className="user-email">{user.email}</td>
                <td className="user-name">{user.name}</td>
                <td>
                  <span className={`role-badge ${user.role}`}>
                    {getRoleName(user.role)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <form onSubmit={handleCreateUser}>
              <h2>새로운 팀 멤버 추가</h2>
              <input type="email" name="email" placeholder="이메일" value={newUser.email} onChange={handleModalChange} required />
              <input type="password" name="password" placeholder="비밀번호" value={newUser.password} onChange={handleModalChange} required />
              <input type="text" name="name" placeholder="이름" value={newUser.name} onChange={handleModalChange} required />
              <select name="role" value={newUser.role} onChange={handleModalChange}>
                <option value="itsm_team">기술지원팀</option>
                <option value="admin">관리자</option>
              </select>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)}>취소</button>
                <button type="submit">생성</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </AdminLayout>
  );
};

export default AdminTeamListPage;