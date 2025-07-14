import React, { useState } from 'react';
import { createTicket } from '../api/ticket';
import { useNavigate } from 'react-router-dom';
import DragDropFileUpload from '../components/DragDropFileUpload';
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

  // 파일 관련 함수들은 DragDropFileUpload 컴포넌트에서 처리됨

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
            <DragDropFileUpload
              files={files}
              setFiles={setFiles}
              filePreviews={filePreviews}
              setFilePreviews={setFilePreviews}
              maxFiles={5}
              maxSize={10 * 1024 * 1024} // 10MB
              acceptedTypes={[
                'image/*',
                'application/pdf',
                'text/*',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
              ]}
            />
          </div>

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
