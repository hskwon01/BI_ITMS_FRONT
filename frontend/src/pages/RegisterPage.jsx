import React, { useState } from 'react';
import { register, sendVerificationCode, verifyEmail } from '../api/auth';
import { useNavigate, Link } from 'react-router-dom';
import '../css/RegisterPage.css';

const RegisterPage = () => {
  const [form, setForm] = useState({ email: '', password: '', name: '', company: '' });
  const [verificationCode, setVerificationCode] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
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

  const handleSendVerificationCode = async () => {
    if (!form.email) {
      showToast('이메일을 입력해주세요.', 'error');
      return;
    }

    try {
      setIsSendingCode(true);
      await sendVerificationCode(form.email);
      showToast('인증 코드가 이메일로 발송되었습니다.', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || '인증 코드 발송에 실패했습니다.', 'error');
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!verificationCode) {
      showToast('인증 코드를 입력해주세요.', 'error');
      return;
    }

    try {
      setIsVerifying(true);
      await verifyEmail(form.email, verificationCode);
      setIsEmailVerified(true);
      showToast('이메일 인증이 완료되었습니다.', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || '인증 코드가 올바르지 않습니다.', 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isEmailVerified) {
      showToast('이메일 인증이 필요합니다.', 'error');
      return;
    }
    
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
          
          {/* 이메일 인증 섹션 */}
          <div className="email-verification-section">
            <div className="email-input-group">
              <input
                name="email"
                type="email"
                placeholder="이메일"
                value={form.email}
                onChange={handleChange}
                className="register-simple-input"
                required
              />
              <button
                type="button"
                onClick={handleSendVerificationCode}
                disabled={isSendingCode || !form.email}
                className="send-code-btn"
              >
                {isSendingCode ? '발송 중...' : '인증 코드 발송'}
              </button>
            </div>
            
            {form.email && (
              <div className="verification-code-section">
                <div className="verification-input-group">
                  <input
                    type="text"
                    placeholder="인증 코드 6자리"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="register-simple-input"
                    maxLength="6"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyEmail}
                    disabled={isVerifying || !verificationCode || verificationCode.length !== 6}
                    className="verify-code-btn"
                  >
                    {isVerifying ? '인증 중...' : '인증 확인'}
                  </button>
                </div>
                {isEmailVerified && (
                  <div className="verification-success">
                    ✓ 이메일 인증이 완료되었습니다.
                  </div>
                )}
              </div>
            )}
          </div>
          
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