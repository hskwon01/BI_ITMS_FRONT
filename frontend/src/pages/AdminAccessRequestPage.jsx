import React from 'react';
import AdminLayout from '../components/AdminLayout';
import AdminAccessRequestList from '../components/AdminAccessRequestList';
import '../css/AdminAccessRequestPage.css'; // CSS 파일 임포트

const AdminAccessRequestPage = () => {
  return (
    <AdminLayout>
      <div className="admin-access-request-container">
        <div className="admin-access-header">
          <h1>사용자 접근 요청 관리</h1>
          <p className="admin-access-desc">새로운 사용자의 접근 요청을 승인하거나 거부할 수 있습니다.</p>
        </div>
        <AdminAccessRequestList />
      </div>
    </AdminLayout>
  );
};

export default AdminAccessRequestPage;
