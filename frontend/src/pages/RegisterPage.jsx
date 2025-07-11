import React, { useState } from 'react';
import { register } from '../api/auth';
import { useNavigate, Link } from 'react-router-dom';
import '../css/RegisterPage.css';

const RegisterPage = () => {
  const [form, setForm] = useState({ email: '', password: '', name: '', company: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const navigate = useNavigate();

  const showToast = (message, type = 'success') => {
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
      await register(form); // company도 함께 전송됨
      showToast('회원가입이 완료되었습니다!', 'success');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || '회원가입에 실패했습니다. 입력값을 확인해주세요.';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-simple-container">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          {toast.message}
        </div>
      )}

      <form className="register-simple-card" onSubmit={handleSubmit}>
        <h1 className="register-simple-title">회원가입</h1>
        <div className="register-simple-fields">
          <input
            name="name"
            type="text"
            placeholder="이름"
            value={form.name}
            onChange={handleChange}
            className="register-simple-input"
            required
          />
          <input
            name="company"
            type="text"
            placeholder="회사명"
            value={form.company}
            onChange={handleChange}
            className="register-simple-input"
            required
          />
          <input
            name="email"
            type="email"
            placeholder="이메일"
            value={form.email}
            onChange={handleChange}
            className="register-simple-input"
            required
          />
          <input
            name="password"
            type="password"
            placeholder="비밀번호"
            value={form.password}
            onChange={handleChange}
            className="register-simple-input"
            required
          />
        </div>
        <button type="submit" className="register-simple-btn" disabled={loading}>
          {loading ? '가입 중...' : '회원가입'}
        </button>
        <div className="register-simple-footer">
          <span>이미 계정이 있으신가요? </span>
          <Link to="/login" className="register-simple-link">로그인</Link>
        </div>
      </form>
    </div>
  );
};

export default RegisterPage;