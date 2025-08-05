import React, { useState } from 'react';
import PasswordVerification from '../components/PasswordVerification';
import ProfileLayout from '../components/ProfileLayout'; // 새로 생성할 컴포넌트
import UserLayout from '../components/UserLayout';
import '../css/ProfilePage.css';

const ProfilePage = () => {
  const [isVerified, setIsVerified] = useState(false);

  return (
    <UserLayout>
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
    </UserLayout>
  );
};

export default ProfilePage;
