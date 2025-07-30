import React, { useState } from 'react';
import MyInfoDisplay from './MyInfoDisplay';
import EditProfileForm from './EditProfileForm';
import AccountDeletion from './AccountDeletion';
import '../css/ProfilePage.css'; // 기존 CSS 재활용

const ProfileLayout = () => {
  const [selectedMenu, setSelectedMenu] = useState('myInfo'); // 'myInfo', 'editProfile', 'deleteAccount'

  const renderContent = () => {
    switch (selectedMenu) {
      case 'myInfo':
        return <MyInfoDisplay />;
      case 'editProfile':
        return <EditProfileForm onSuccess={() => setSelectedMenu('myInfo')} />;
      case 'deleteAccount':
        return <AccountDeletion />;
      default:
        return <MyInfoDisplay />;
    }
  };

  return (
    <div className="profile-layout">
      <div className="profile-menu">
        <button
          className={selectedMenu === 'myInfo' ? 'active' : ''}
          onClick={() => setSelectedMenu('myInfo')}
        >
          내 정보
        </button>
        <button
          className={selectedMenu === 'editProfile' ? 'active' : ''}
          onClick={() => setSelectedMenu('editProfile')}
        >
          내 정보 수정
        </button>
        <button
          className={selectedMenu === 'deleteAccount' ? 'active' : ''}
          onClick={() => setSelectedMenu('deleteAccount')}
        >
          계정 탈퇴
        </button>
      </div>
      <div className="profile-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default ProfileLayout;
