import React, { useState, useEffect } from 'react';
import { getMe } from '../api/auth';

const MyInfoDisplay = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await getMe();
        setUserInfo(res.data);
      } catch (err) {
        setError('사용자 정보를 불러오는데 실패했습니다.');
        console.error('Failed to fetch user info:', err);
      }
    };
    fetchUserInfo();
  }, []);

  if (error) {
    return <div className="profile-message error">{error}</div>;
  }

  if (!userInfo) {
    return <div className="profile-message">사용자 정보를 불러오는 중...</div>;
  }

  return (
    <div className="my-info-display">
      <h3>내 정보</h3>
      <p><strong>이메일:</strong> {userInfo.email}</p>
      <p><strong>이름:</strong> {userInfo.name}</p>
      <p><strong>회사명:</strong> {userInfo.company_name}</p>
      {/* 비밀번호는 표시하지 않음 */}
    </div>
  );
};

export default MyInfoDisplay;
