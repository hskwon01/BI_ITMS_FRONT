import React, { useState } from 'react';
import { verifyPassword } from '../api/user';

const PasswordVerification = ({ onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('token');
      await verifyPassword(password, token);
      onSuccess();
    } catch (err) {
      setError('비밀번호가 일치하지 않습니다.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <p>회원 정보를 안전하게 보호하기 위해 비밀번호를 다시 한번 입력해주세요.</p>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="비밀번호"
        required
      />
      <button type="submit">확인</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
};

export default PasswordVerification;
