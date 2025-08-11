import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { requestAccess } from '../api/magicLink'; // 새로 생성할 API 파일
import '../css/RequestAccessPage.css'; // 새로운 CSS 파일

const RequestAccessPage = () => {
  const [form, setForm] = useState({ email: '', name: '', company: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const showToast = (msg, type = 'error') => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 3000);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    try {
      const res = await requestAccess(form);
      showToast(res.data.message, 'success');
      setForm({ email: '', name: '', company: '' }); // 폼 초기화
    } catch (err) {
      console.error('접근 요청 에러:', err);
      const errorMessage = err.response?.data?.message || '접근 요청 중 오류가 발생했습니다.';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="request-access-container">
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          {toast.message}
        </div>
      )}
      <form className="request-access-card" onSubmit={handleSubmit}>
        <div className="request-access-logo">
          <img src="/metanet-logo.jpg" alt="Metanet Logo" />
        </div>
        <h1 className="request-access-title">ITSM 접근 요청</h1>
        <p className="request-access-description">
          비밀번호 없는 로그인을 위해 이메일과 정보를 입력하여 접근을 요청해주세요.
          관리자 승인 후 로그인 링크가 이메일로 발송됩니다.
        </p>
        <div className="request-access-fields">
          <input
            name="email"
            type="email"
            placeholder="이메일"
            value={form.email}
            onChange={handleChange}
            className="request-access-input"
            required
          />
          <input
            name="name"
            type="text"
            placeholder="이름"
            value={form.name}
            onChange={handleChange}
            className="request-access-input"
            required
          />
          <input
            name="company"
            type="text"
            placeholder="회사명 (선택 사항)"
            value={form.company}
            onChange={handleChange}
            className="request-access-input"
          />
        </div>
        <button type="submit" className="request-access-btn" disabled={loading}>
          {loading ? '요청 중...' : '접근 요청 제출'}
        </button>
        <div className="request-access-footer">
          <span>이미 계정이 있으신가요? </span>
          <Link to="/login" className="request-access-link">기존 로그인</Link>
        </div>
      </form>
    </div>
  );
};

export default RequestAccessPage;
