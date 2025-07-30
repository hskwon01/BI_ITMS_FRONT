import React, { useState, useEffect } from 'react';
import { updateProfile } from '../api/user';
import { getMe } from '../api/auth';

const EditProfileForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({ name: '', company_name: '', password: '' });
  const [initialFormData, setInitialFormData] = useState(null); // 초기 데이터 저장
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getMe();
        const userData = { name: res.data.name, company_name: res.data.company_name, password: '' };
        setFormData(userData);
        setInitialFormData(userData); // 초기 데이터 설정
      } catch (err) {
        setError('사용자 정보를 불러오는데 실패했습니다.');
      }
    };
    fetchUser();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 변경 사항이 있는지 확인하는 함수
  const hasChanges = () => {
    if (!initialFormData) return false; // 데이터 로드 전

    // 이름 또는 회사명 변경 확인
    if (formData.name !== initialFormData.name || formData.company_name !== initialFormData.company_name) {
      return true;
    }

    // 비밀번호 필드가 비어있지 않으면 변경으로 간주
    if (formData.password && formData.password !== '') {
      return true;
    }

    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await updateProfile(formData);
      window.alert('프로필이 성공적으로 업데이트되었습니다.'); // 알림
      if (onSuccess) {
        onSuccess(); // 내 정보 화면으로 리다이렉트 (ProfileLayout에서 처리)
      }
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
        placeholder="새 비밀번호 (변경 시에만 입력)"
      />
      <button type="submit" disabled={!hasChanges()}>수정하기</button>
      {message && <p className="profile-message success">{message}</p>}
      {error && <p className="profile-message error">{error}</p>}
    </form>
  );
};

export default EditProfileForm;
