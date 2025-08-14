import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import CommonLayout from '../components/CommonLayout';
import { fetchNotice, updateNotice } from '../api/notices';
import { useUser } from '../contexts/UserContext';
import { useToast } from '../contexts/ToastContext';
import { File } from 'lucide-react';
import '../css/NoticeEditPage.css';

const NoticeEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const { showSuccess, showError } = useToast();
  const [form, setForm] = useState({
    title: '',
    content: '',
    is_pinned: false,
    files: null
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [existingFiles, setExistingFiles] = useState([]);

  useEffect(() => {
    // 관리자 권한 확인
    if (!user?.data || (user.data.role !== 'admin' && user.data.role !== 'itsm_team')) {
      navigate('/notices');
      return;
    }
    
    loadNotice();
  }, [id, user, navigate]);

  const loadNotice = async () => {
    try {
      setLoading(true);
      const response = await fetchNotice(id);
      const notice = response.data;
      
      setForm({
        title: notice.title,
        content: notice.content,
        is_pinned: notice.is_pinned,
        files: null
      });
      setExistingFiles(notice.files || []);
    } catch (err) {
      console.error('공지사항 로드 실패:', err);
      setError('공지사항을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.title.trim() || !form.content.trim()) {
      showError('제목과 내용을 모두 입력해주세요.');
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

      await updateNotice(id, formData);
      showSuccess('공지사항이 수정되었습니다.');
      // 토스트 알림창이 표시될 시간을 주기 위해 약간의 지연 후 페이지 이동
      setTimeout(() => {
        navigate(`/notices/${id}`);
      }, 1000);
    } catch (err) {
      console.error('수정 실패:', err);
      showError('수정에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <CommonLayout>
        <div className="notice-edit-container">
          <div className="notice-loading">
            <div className="spinner"></div>
            <p>공지사항을 불러오는 중...</p>
          </div>
        </div>
      </CommonLayout>
    );
  }

  if (error) {
    return (
      <CommonLayout>
        <div className="notice-edit-container">
          <div className="notice-error">
            <h2>오류가 발생했습니다</h2>
            <p>{error}</p>
            <Link to="/notices" className="btn btn-primary">
              목록으로 돌아가기
            </Link>
          </div>
        </div>
      </CommonLayout>
    );
  }

  return (
    <CommonLayout>
      <div className="notice-edit-container">
        {/* 브레드크럼 */}
        <div className="notice-breadcrumb">
          <Link to="/notices" className="breadcrumb-link">공지사항</Link>
          <span className="breadcrumb-separator">/</span>
          <Link to={`/notices/${id}`} className="breadcrumb-link">상세보기</Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">수정</span>
        </div>

        <div className="notice-edit-header">
          <h1>공지사항 수정</h1>
          <p>공지사항 내용을 수정할 수 있습니다.</p>
        </div>

        <form onSubmit={handleSubmit} className="notice-edit-form">
          <div className="form-group">
            <label htmlFor="title" className="form-label">제목 *</label>
            <input
              type="text"
              id="title"
              className="form-input"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="공지사항 제목을 입력하세요"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="content" className="form-label">내용 *</label>
            <textarea
              id="content"
              className="form-textarea"
              rows={12}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="공지사항 내용을 입력하세요"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="files" className="form-label">첨부파일</label>
            <input
              type="file"
              id="files"
              className="form-file"
              multiple
              onChange={(e) => setForm({ ...form, files: e.target.files })}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif"
            />
            <p className="file-help">
              최대 5개 파일까지 첨부 가능합니다. (각 파일 최대 10MB)
            </p>
          </div>

          {existingFiles.length > 0 && (
            <div className="form-group">
              <label className="form-label">기존 첨부파일</label>
              <div className="existing-files">
                {existingFiles.map((file, index) => (
                  <div key={index} className="existing-file-item">
                    <span className="file-icon"><File size={16} /></span>
                    <span className="file-name">{file.originalname}</span>
                  </div>
                ))}
              </div>
              <p className="file-note">
                새 파일을 첨부하면 기존 파일이 교체됩니다.
              </p>
            </div>
          )}

          <div className="form-group">
            <label className="form-checkbox-label">
              <input
                type="checkbox"
                checked={form.is_pinned}
                onChange={(e) => setForm({ ...form, is_pinned: e.target.checked })}
              />
              <span className="checkbox-text">상단 고정</span>
            </label>
          </div>

          <div className="form-actions">
            <Link to={`/notices/${id}`} className="btn btn-secondary">
              취소
            </Link>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? '저장 중...' : '수정 완료'}
            </button>
          </div>
        </form>
      </div>
    </CommonLayout>
  );
};

export default NoticeEditPage;




