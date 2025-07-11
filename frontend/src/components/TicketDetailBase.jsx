import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getTicketDetail, postReply, deleteTicketFile, deleteReplyFile } from '../api/ticket';
import '../css/TicketDetailBase.css';

const isImageFile = (filename) => {
  return /\.(png|jpe?g|gif)$/i.test(filename);
};

const TicketDetailBase = ({ ticketId, token, role }) => {
  const [ticket, setTicket] = useState(null);
  const [replies, setReplies] = useState([]);
  const [message, setMessage] = useState('');
  const [replyFiles, setReplyFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({ filename: '', isTicketFile: false });
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await getTicketDetail(ticketId, token);
      setTicket(res.data.ticket);
      setReplies(res.data.replies);
    } catch {
      alert('티켓 불러오기 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (newStatus === ticket.status) return;
    
    try {
      setUpdatingStatus(true);
      await axios.put(`${process.env.REACT_APP_API_URL}/tickets/${ticketId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast(`티켓 상태가 '${newStatus}'로 변경되었습니다.`, 'success');
      fetchDetail();
    } catch {
      showToast('상태 변경에 실패했습니다.', 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('message', message);
      replyFiles.forEach(file => formData.append('files', file));
      await postReply(ticketId, formData, token);
      setMessage('');
      setReplyFiles([]);
      fetchDetail();
      showToast('댓글이 성공적으로 등록되었습니다.', 'success');
    } catch {
      showToast('댓글 등록에 실패했습니다.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileDelete = async (filename, isTicketFile = false) => {
    setDeleteTarget({ filename, isTicketFile });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      if (deleteTarget.isTicketFile) {
        await deleteTicketFile(deleteTarget.filename, token);
      } else {
        await deleteReplyFile(deleteTarget.filename, token);
      }
      fetchDetail();
      showToast('파일이 삭제되었습니다.', 'success');
    } catch {
      showToast('파일 삭제에 실패했습니다.', 'error');
    } finally {
      setShowDeleteModal(false);
      setDeleteTarget({ filename: '', isTicketFile: false });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case '접수': return 'received';
      case '진행중': return 'in-progress';
      case '답변 완료': return 'answered';
      case '종결': return 'closed';
      default: return 'default';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case '높음': return 'high';
      case '보통': return 'medium';
      case '낮음': return 'low';
      default: return 'default';
    }
  };

  useEffect(() => {
    const markAsRead = async () => {
      try {
        await axios.post(
          `${process.env.REACT_APP_API_URL}/tickets/${ticketId}/read`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        console.error("읽음 처리 실패", err);
      }
    };

    markAsRead();      // ✅ 추가된 부분: 서버에 읽음 기록 저장
    fetchDetail();     // 기존 기능: 티켓 + 댓글 불러오기
  }, [ticketId]);

  if (!ticket) return null;

  return (
    <div className="ticket-detail-container">
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          {toast.message}
        </div>
      )}

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <div className="modal-header">
              <h3>🗑️ 파일 삭제 확인</h3>
            </div>
            <div className="modal-content">
              <p>이 파일을 삭제하시겠습니까?</p>
              <div className="modal-warning">
                <span>⚠️ 삭제된 파일은 복구할 수 없습니다.</span>
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className="modal-btn cancel"
                onClick={() => setShowDeleteModal(false)}
              >
                취소
              </button>
              <button 
                className="modal-btn confirm"
                onClick={confirmDelete}
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="ticket-header">
        <div className="ticket-header-content">
          <h1>티켓 상세</h1>
          {role === 'admin' && (
            <div className="status-change-section">
              <label htmlFor="status-select" className="status-label">상태 변경:</label>
              <select
                id="status-select"
                value={ticket.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={updatingStatus}
                className="status-select"
              >
                <option value="접수">접수</option>
                <option value="진행중">진행중</option>
                <option value="답변 완료">답변 완료</option>
                <option value="종결">종결</option>
              </select>
              {updatingStatus && <span className="updating-indicator">변경 중...</span>}
            </div>
          )}
        </div>
      </div>

      <div className="ticket-info-card">
        <div className="ticket-title-section">
          <div className="ticket-header-row">
            <h2>{ticket.title}</h2>
            <div className="ticket-meta">
              <span className={`status-badge ${getStatusColor(ticket.status)}`}>
                {ticket.status}
              </span>
              <span className={`urgency-badge ${getUrgencyColor(ticket.urgency)}`}>
                {ticket.urgency}
              </span>
              <span className="ticket-date">
                {new Date(ticket.created_at).toLocaleDateString('ko-KR', {
                  year: 'numeric', month: 'long', day: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                })}
              </span>
            </div>
          </div>
        </div>

        <div className="ticket-description">
          <h3>내용</h3>
          <p>{ticket.description}</p>
        </div>

        {ticket.files && ticket.files.length > 0 && (
          <div className="ticket-files">
            <h3>첨부파일</h3>
            <div className="file-grid">
              {ticket.files.map(f => (
                <div key={f.filename} className="file-item">
                  {isImageFile(f.originalname) ? (
                    <div className="image-file">
                      <img
                        src={`http://localhost:5000/uploads/${f.filename}`}
                        alt={f.originalname}
                        className="file-image"
                      />
                      <div className="file-actions">
                        <a
                          href={`http://localhost:5000/uploads/${f.filename}`}
                          target="_blank"
                          rel="noreferrer"
                          className="file-link"
                        >
                          📎 {f.originalname}
                        </a>
                        {role === 'admin' && (
                          <button 
                            className="delete-btn"
                            onClick={() => handleFileDelete(f.filename, true)}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="file-item">
                      <a
                        href={`http://localhost:5000/uploads/${f.filename}`}
                        target="_blank"
                        rel="noreferrer"
                        className="file-link"
                      >
                        📎 {f.originalname}
                      </a>
                      {role === 'admin' && (
                        <button 
                          className="delete-btn"
                          onClick={() => handleFileDelete(f.filename, true)}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="replies-section">
        <h3>댓글 ({replies.length})</h3>
        
        <div className="replies-list">
          {replies.map(reply => (
            <div key={reply.id} className={`reply-card ${reply.role === 'admin' ? 'admin-reply' : ''}`}>
              <div className="reply-header">
                <div className="reply-author">
                  <span className="author-name">{reply.author_name}</span>
                  <span className={`author-role ${reply.role}`}>
                    {reply.role === 'admin' ? '관리자' : '고객'}
                  </span>
                </div>
                <span className="reply-date">
                  {new Date(reply.created_at).toLocaleDateString('ko-KR', {
                    year: 'numeric', month: 'short', day: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </span>
              </div>
              
              <div className="reply-content">
                <p>{reply.message}</p>
              </div>

              {reply.files && reply.files.length > 0 && (
                <div className="reply-files">
                  <div className="file-grid">
                    {reply.files.map(f => (
                      <div key={f.filename} className="file-item">
                        {isImageFile(f.originalname) ? (
                          <div className="image-file">
                            <img
                              src={`http://localhost:5000/uploads/${f.filename}`}
                              alt={f.originalname}
                              className="file-image"
                            />
                            <div className="file-actions">
                              <a
                                href={`http://localhost:5000/uploads/${f.filename}`}
                                target="_blank"
                                rel="noreferrer"
                                className="file-link"
                              >
                                📎 {f.originalname}
                              </a>
                              {role === 'admin' && (
                                <button 
                                  className="delete-btn"
                                  onClick={() => handleFileDelete(f.filename, false)}
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="file-item">
                            <a
                              href={`http://localhost:5000/uploads/${f.filename}`}
                              target="_blank"
                              rel="noreferrer"
                              className="file-link"
                            >
                              📎 {f.originalname}
                            </a>
                            {role === 'admin' && (
                              <button 
                                className="delete-btn"
                                onClick={() => handleFileDelete(f.filename, false)}
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="reply-form">
          <div className="form-group">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="댓글을 입력하세요..."
              required
              className="reply-textarea"
            />
          </div>
          
          <div className="form-group">
            <div className="file-upload-area">
              <input 
                type="file" 
                multiple 
                onChange={(e) => setReplyFiles(Array.from(e.target.files))}
                className="file-input"
                id="file-input"
              />
              <label htmlFor="file-input" className="file-upload-label">
                📎 파일 첨부
              </label>
            </div>
            {replyFiles.length > 0 && (
              <div className="selected-files">
                <h4>선택된 파일:</h4>
                <ul>
                  {replyFiles.map((file, index) => (
                    <li key={index} className="selected-file">
                      📎 {file.name}
                      <button 
                        type="button"
                        onClick={() => setReplyFiles(replyFiles.filter((_, i) => i !== index))}
                        className="remove-file-btn"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <button 
            type="submit" 
            className="submit-btn"
            disabled={submitting || !message.trim()}
          >
            {submitting ? '등록 중...' : '댓글 등록'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TicketDetailBase;
