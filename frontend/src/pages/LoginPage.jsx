import React, { useState } from 'react';
import { login, getMe } from '../api/auth';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import '../css/LoginPage.css';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const navigate = useNavigate();
  const location = useLocation();

  const showToast = (message, type = 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 3000);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      setLoading(true);      
      const res = await login(form);     
      const token = res.data.token;  
      localStorage.setItem('token', token);
      const me = await getMe();
      const params = new URLSearchParams(location.search);
      const next = params.get('next');

      if (next) {
        navigate(next);
        return;
      }
      if (me.data.role === 'admin' || me.data.role === 'itsm_team') {
        navigate('/home');
      } else {
        navigate('/home');
      }
    } catch (err) {
      console.error('로그인 에러:', err);
      console.error('에러 응답:', err.response);
      const errorMessage = err.response?.data?.message || '사용자를 찾을 수 없습니다. 이메일과 비밀번호를 확인해주세요.';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-simple-container">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          {toast.message}
        </div>
      )}

      <form className="login-simple-card" onSubmit={handleSubmit}>
        <div className="login-simple-logo">
          <img src="/metanet-logo.jpg" alt="Metanet Logo" />
        </div>
        <h1 className="login-simple-title">ITSM 로그인</h1>
        <div className="login-simple-fields">
          <input
            name="email"
            type="email"
            placeholder="이메일"
            value={form.email}
            onChange={handleChange}
            className="login-simple-input"
            autoComplete="username"
            required
          />
          <input
            name="password"
            type="password"
            placeholder="비밀번호"
            value={form.password}
            onChange={handleChange}
            className="login-simple-input"
            autoComplete="current-password"
            required
          />
        </div>
        <button type="submit" className="login-simple-btn" disabled={loading}>
          {loading ? '로그인 중...' : '로그인'}
        </button>
        <div className="login-simple-footer">
          <span>계정이 없으신가요? </span>
          <Link to="/register" className="login-simple-link">회원가입</Link>
          <br />
          <span>비밀번호 없이 로그인하고 싶으신가요? </span>
          <Link to="/request-access" className="login-simple-link">접근 요청</Link>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;