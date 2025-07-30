import React, { useState } from 'react';
import PasswordVerification from '../components/PasswordVerification';
import EditProfileForm from '../components/EditProfileForm';

const ProfilePage = () => {
  const [isVerified, setIsVerified] = useState(false);

  return (
    <div className="profile-page">
      <h2>프로필 관리</h2>
      {!isVerified ? (
        <PasswordVerification onSuccess={() => setIsVerified(true)} />
      ) : (
        <EditProfileForm />
      )}
    </div>
  );
};

export default ProfilePage;
