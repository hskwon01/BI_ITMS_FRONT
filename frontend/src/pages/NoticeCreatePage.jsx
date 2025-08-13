import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createNotice } from '../api/notices';
import { useUser } from '../contexts/UserContext';
import '../css/NoticeCreatePage.css';

const NoticeCreatePage = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [form, setForm] = useState({
    title: '',
    content: '',
    is_pinned: false,
    files: null
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // 관리자 권한 확인
    if (!user?.data || (user.data.role !== 'admin' && user.data.role !== 'itsm_team')) {
      navigate('/admin/notices');
      return;
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.title.trim() || !form.content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    try {
      setSaving(true);
      
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('content', form.content);
      formData.append('is_pinned', form.is_pinned);
      
      if (form.files && form.files.length > 0) {
        [...form.files].forEach((file) => {
          formData.append('files', file);
        });
      }

      const response = await createNotice(formData);
      alert('공지사항이 등록되었습니다.');
      navigate('/admin/notices');
    } catch (err) {
      console.error('등록 실패:', err);
      alert('등록에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('작성 중인 내용이 모두 삭제됩니다. 계속하시겠습니까?')) {
      setForm({
        title: '',
        content: '',
        is_pinned: false,
        files: null
      });
      // 파일 input 초기화
      const fileInput = document.getElementById('files');
      if (fileInput) fileInput.value = '';
    }
  };

  // 권한이 없는 경우 리다이렉트 처리
  if (!user?.data || (user.data.role !== 'admin' && user.data.role !== 'itsm_team')) {
    return null;
  }

  return (
    <div className="notice-create-container">
      <div className="notice-create-header">
        <h1>새 공지사항 작성</h1>
        <p>새로운 공지사항을 작성하여 사용자들에게 중요한 정보를 전달하세요.</p>
      </div>

      <form onSubmit={handleSubmit} className="notice-create-form">
        <div className="form-group">
          <label htmlFor="title" className="form-label">
            제목 <span className="required">*</span>
          </label>
          <input
            type="text"
            id="title"
            className="form-input"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="공지사항 제목을 입력하세요"
            required
            maxLength="200"
          />
          <div className="char-count">{form.title.length}/200</div>
        </div>

        <div className="form-group">
          <label htmlFor="content" className="form-label">
            내용 <span className="required">*</span>
          </label>
          <textarea
            id="content"
            className="form-textarea"
            rows={15}
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="공지사항 내용을 입력하세요"
            required
            maxLength="5000"
          />
          <div className="char-count">{form.content.length}/5000</div>
        </div>

        <div className="form-group">
          <label htmlFor="files" className="form-label">첨부파일</label>
          <input
            type="file"
            id="files"
            className="form-file"
            multiple
            onChange={(e) => setForm({ ...form, files: e.target.files })}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.zip,.rar"
          />
          <div className="file-help">
            <p>• 최대 5개 파일까지 첨부 가능합니다.</p>
            <p>• 각 파일 최대 10MB까지 업로드 가능합니다.</p>
            <p>• 지원 형식: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, JPG, PNG, GIF, ZIP, RAR</p>
          </div>
        </div>

        <div className="form-group">
          <div className="form-options">
            <label className="form-checkbox-label">
              <input
                type="checkbox"
                checked={form.is_pinned}
                onChange={(e) => setForm({ ...form, is_pinned: e.target.checked })}
              />
              <span className="checkbox-text">
                상단 고정
                <span className="option-description">이 공지사항을 목록 상단에 고정합니다</span>
              </span>
            </label>
          </div>
        </div>

        <div className="form-actions">
          <div className="form-actions-left">
            <button
              type="button"
              onClick={handleReset}
              className="btn btn-outline"
              disabled={saving}
            >
              초기화
            </button>
          </div>
          <div className="form-actions-right">
            <Link to="/notices" className="btn btn-secondary">
              취소
            </Link>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? '등록 중...' : '공지사항 등록'}
            </button>
          </div>
        </div>
      </form>

      {/* 미리보기 섹션 */}
      {(form.title || form.content) && (
        <div className="notice-preview">
          <h3 className="preview-title">미리보기</h3>
          <div className="preview-content">
            <div className="preview-header">
              <h4 className="preview-notice-title">
                {form.title || '제목을 입력하세요'}
                {form.is_pinned && <span className="preview-pin">📌</span>}
              </h4>
              <div className="preview-meta">
                등록일: {new Date().toLocaleDateString('ko-KR')}
              </div>
            </div>
            <div className="preview-body">
              {form.content ? (
                <div dangerouslySetInnerHTML={{ 
                  __html: form.content.replace(/\n/g, '<br />') 
                }}></div>
              ) : (
                <p className="preview-placeholder">내용을 입력하세요</p>
              )}
            </div>
            {form.files && form.files.length > 0 && (
              <div className="preview-files">
                <strong>첨부파일:</strong>
                <ul>
                  {[...form.files].map((file, index) => (
                    <li key={index}>{file.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NoticeCreatePage;



