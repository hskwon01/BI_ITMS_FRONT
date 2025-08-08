import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loginWithMagicLink } from '../api/magicLink';
import { getMe } from '../api/auth';

const MagicLoginProcessor = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [message, setMessage] = useState('로그인 처리 중...');

  useEffect(() => {
    const processMagicLink = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');

      if (!token) {
        setMessage('유효하지 않은 로그인 링크입니다.');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      try {
        const res = await loginWithMagicLink(token);
        localStorage.setItem('token', res.data.token);
        setMessage('로그인 성공! 홈으로 이동합니다...');

        // 사용자 역할에 따라 리다이렉트 (기존 로그인 로직과 동일하게)
        const me = await getMe();
        if (me.data.role === 'admin' || me.data.role === 'itsm_team') {
          navigate('/home');
        } else {
          navigate('/home');
        }

      } catch (err) {
        console.error('매직 링크 로그인 에러:', err);
        const errorMessage = err.response?.data?.message || '로그인 처리 중 오류가 발생했습니다.';
        setMessage(`로그인 실패: ${errorMessage}`);
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    processMagicLink();
  }, [location, navigate]);

  // 전역 스타일 삽입을 컴포넌트 생명주기에 맞춰 관리 (중복/누수 방지)
  useEffect(() => {
    const style = document.createElement('style');
    style.type = 'text/css';
    style.innerText = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    return () => {
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>ITSM 로그인</h1>
        <p style={styles.message}>{message}</p>
        <div style={styles.spinner}></div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f0f2f5',
    padding: '20px',
  },
  card: {
    background: '#ffffff',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    width: '100%',
    maxWidth: '400px',
  },
  title: {
    fontSize: '28px',
    color: '#2d3652',
    marginBottom: '20px',
    fontWeight: '700',
  },
  message: {
    fontSize: '16px',
    color: '#495057',
    marginBottom: '30px',
  },
  spinner: {
    border: '4px solid rgba(0, 0, 0, 0.1)',
    borderLeftColor: '#7c83fd',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    animation: 'spin 1s linear infinite',
    margin: '0 auto',
  },
};

// CSS 애니메이션 키프레임은 위 useEffect에서 동적으로 삽입/정리됩니다.

export default MagicLoginProcessor;
