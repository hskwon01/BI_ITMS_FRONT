import React, { useState } from 'react';
import PasswordVerification from '../components/PasswordVerification';
import EditProfileForm from '../components/EditProfileForm';
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
          <>
            <h2>회원 정보 수정</h2>
            <EditProfileForm />
          </>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
