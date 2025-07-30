import React, { useState } from 'react';
import PasswordVerification from '../components/PasswordVerification';
import ProfileLayout from '../components/ProfileLayout'; // 새로 생성할 컴포넌트
import '../css/ProfilePage.css';

const ProfilePage = () => {
  const [isVerified, setIsVerified] = useState(false);

  return (
    <div className="profile-page-container">
      <div className="profile-form-wrapper">
        {!isVerified ? (
          <>
            <h2>비밀번호 확인</h2>
            <PasswordVerification onSuccess={() => setIsVerified(true)} />
          </>
        ) : (
          <ProfileLayout />
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
