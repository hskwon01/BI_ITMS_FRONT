import React, { useState } from 'react';
import { deleteAccount } from '../api/user';
import { useNavigate } from 'react-router-dom';

const AccountDeletion = () => {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    if (window.confirm('정말로 계정을 탈퇴하시겠습니까? 모든 데이터가 삭제되며 복구할 수 없습니다.')) {
      try {
        await deleteAccount();
        localStorage.clear(); // 로컬 스토리지 비우기
        navigate('/'); // 홈페이지로 리디렉션
      } catch (err) {
        setError('계정 탈퇴 중 오류가 발생했습니다. 다시 시도해주세요.');
        console.error('Account deletion error:', err);
      }
    }
  };

  return (
    <div className="account-deletion">
      <h3>계정 탈퇴</h3>
      <p className="warning-message">
        계정을 탈퇴하시면 모든 사용자 정보와 관련된 데이터가 영구적으로 삭제되며, 복구할 수 없습니다.
        신중하게 결정해주세요.
      </p>
      <button onClick={handleDeleteAccount} className="delete-button">
        계정 탈퇴
      </button>
      {message && <p className="profile-message success">{message}</p>}
      {error && <p className="profile-message error">{error}</p>}
    </div>
  );
};

export default AccountDeletion;
