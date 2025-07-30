import React, { useState, useEffect } from 'react';
import { updateProfile } from '../api/user';
import { getCurrentUser } from '../api/auth';

const EditProfileForm = () => {
  const [formData, setFormData] = useState({ name: '', company_name: '', password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await getCurrentUser(token);
        setFormData({ name: res.data.name, company_name: res.data.company_name, password: '' });
      } catch (err) {
        setError('사용자 정보를 불러오는데 실패했습니다.');
      }
    };
    fetchUser();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const token = localStorage.getItem('token');
      await updateProfile(formData, token);
      setMessage('프로필이 성공적으로 업데이트되었습니다.');
    } catch (err) {
      setError('프로필 업데이트에 실패했습니다.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="이름"
        required
      />
      <input
        type="text"
        name="company_name"
        value={formData.company_name}
        onChange={handleChange}
        placeholder="회사명"
        required
      />
      <input
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="새 비밀번호 (선택 사항)"
      />
      <button type="submit">수정</button>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
};

export default EditProfileForm;
