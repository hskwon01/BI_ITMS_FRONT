import React, { useState } from 'react';
import { createTicket } from '../api/ticket';
import { useNavigate } from 'react-router-dom';
import '../css/CreateTicketPage.css';

const CreateTicketPage = () => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    urgency: '',
    product: '',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 3000);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    
    // 파일 미리보기 생성
    const previews = selectedFiles.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }));
    setFilePreviews(previews);
  };

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = filePreviews.filter((_, i) => i !== index);
    setFiles(newFiles);
    setFilePreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('description', form.description);
    formData.append('urgency', form.urgency);
    formData.append('product', form.product);
    files.forEach(file => formData.append('files', file));

    try {
      await createTicket(formData, token);
      showToast('티켓이 성공적으로 등록되었습니다!', 'success');
      setForm({ title: '', description: '', urgency: '', product: '' });
      setFiles([]);
      setFilePreviews([]);
      
      // 2초 후 내 티켓 목록으로 이동
      setTimeout(() => {
        navigate('/my-tickets');
      }, 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || '티켓 생성에 실패했습니다. 다시 시도해주세요.';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="create-ticket-container">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          {toast.message}
        </div>
      )}

      <div className="create-ticket-card">
        <div className="create-ticket-header">
          <h1>기술 지원 요청</h1>
          <p className="create-ticket-desc">새로운 기술 지원 티켓을 등록하세요</p>
        </div>

        <form onSubmit={handleSubmit} className="create-ticket-form">
          <div className="form-group">
            <label htmlFor="title">제목 *</label>
            <input
              id="title"
              name="title"
              type="text"
              placeholder="티켓 제목을 입력하세요"
              value={form.title}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">설명 *</label>
            <textarea
              id="description"
              name="description"
              placeholder="문제 상황을 자세히 설명해주세요"
              value={form.description}
              onChange={handleChange}
              className="form-textarea"
              rows="6"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="urgency">긴급도 *</label>
              <select
                id="urgency"
                name="urgency"
                value={form.urgency}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="">긴급도를 선택하세요</option>
                <option value="낮음">낮음</option>
                <option value="보통">보통</option>
                <option value="높음">높음</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="product">관련 제품</label>
              <input
                id="product"
                name="product"
                type="text"
                placeholder="관련 제품명을 입력하세요"
                value={form.product}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="files">첨부 파일</label>
            <div className="file-upload-area">
              <input
                id="files"
                type="file"
                multiple
                onChange={handleFileChange}
                className="file-input"
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
              <div className="file-upload-text">
                <span>파일을 선택하거나 여기로 드래그하세요</span>
                <small>이미지, PDF, 문서 파일 지원 (최대 10MB)</small>
              </div>
            </div>
          </div>

          {filePreviews.length > 0 && (
            <div className="file-previews">
              <h4>선택된 파일 ({filePreviews.length}개)</h4>
              <div className="file-list">
                {filePreviews.map((file, index) => (
                  <div key={index} className="file-item">
                    {file.preview ? (
                      <img src={file.preview} alt={file.name} className="file-preview" />
                    ) : (
                      <div className="file-icon">📄</div>
                    )}
                    <div className="file-info">
                      <span className="file-name">{file.name}</span>
                      <span className="file-size">{formatFileSize(file.size)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="file-remove"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/my-tickets')}
              className="btn-secondary"
            >
              취소
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? '등록 중...' : '티켓 등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTicketPage;
