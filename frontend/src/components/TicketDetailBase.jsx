import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getTicketDetail, postReply, deleteTicketFile, deleteReplyFile, updateReply, deleteReply, uploadReplyFiles } from '../api/ticket';
import DragDropFileUpload from './DragDropFileUpload';
import '../css/TicketDetailBase.css';
import { jwtDecode } from 'jwt-decode';

const TicketDetailBase = ({ ticketId, token, role }) => {
  const [ticket, setTicket] = useState(null);
  const [replies, setReplies] = useState([]);
  const [message, setMessage] = useState('');
  const [replyFiles, setReplyFiles] = useState([]);
  const [replyFilePreviews, setReplyFilePreviews] = useState([]);
  const [, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({ ticket_files_id: '', ticket_reply_files_id: '', isTicketFile: false });
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editedMessage, setEditedMessage] = useState('');

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
      showToast('티켓 불러오기 실패', 'error');
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
      
      // 1. 파일들을 Cloudinary에 업로드
      const uploadedFiles = [];
      for (const file of replyFiles) {
        const res = await uploadReplyFiles(file, token);
        uploadedFiles.push({
          public_id: res.data.public_id,
          url: res.data.url, // 백엔드에서 반환하는 Cloudinary URL 필드명에 맞게 수정
          originalname: file.name,
        });
      }

      // 2. 댓글 정보와 Cloudinary 파일 URL을 함께 전송
      const replyData = {
        message: message,
        files: uploadedFiles, // Cloudinary URL 목록
      };
      
      await postReply(ticketId, replyData, token);
      setMessage('');
      setReplyFiles([]);
      setReplyFilePreviews([]);
      fetchDetail();
      showToast('댓글이 성공적으로 등록되었습니다.', 'success');
    } catch {
      showToast('댓글 등록에 실패했습니다.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileDelete = async (ticket_files_id, isTicketFile = false) => {
    setDeleteTarget({ ticket_files_id, isTicketFile: true });
    setShowDeleteModal(true);
  };

  const handleReplyFileDelete = async (ticket_reply_files_id, isTicketFile = false) => {
    setDeleteTarget({ ticket_reply_files_id, isTicketFile: false });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      if (deleteTarget.isTicketFile) {
        await deleteTicketFile(deleteTarget.ticket_files_id, token);
      } else {
        await deleteReplyFile(deleteTarget.ticket_reply_files_id, token);
      }
      fetchDetail();
      showToast('파일이 삭제되었습니다.', 'success');
    } catch (error) {
      console.error("파일 삭제 에러:", error);
      if (error.response?.status === 403) {
        showToast('파일 삭제 권한이 없습니다.', 'error');
      } else if (error.response?.status === 404) {
        showToast('파일을 찾을 수 없습니다.', 'error');
      } else {
        showToast('파일 삭제에 실패했습니다.', 'error');
      }
    } finally {
      setShowDeleteModal(false);
      setDeleteTarget({ ticket_files_id: '', ticket_reply_files_id: '', isTicketFile: false });
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

  const handleImageClick = (imageUrl, filename) => {
    setSelectedImage({ url: imageUrl, filename });
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
  };

  const handleUpdateReply = async (replyId) => {
    try {
      await updateReply(ticketId, replyId, editedMessage, token);
      await fetchDetail(); // 댓글 다시 불러오기
      setEditingReplyId(null);
    } catch {
      showToast('댓글 수정 실패', 'error');
    }
  };

  const handleDeleteReply = async (replyId) => {
    try {
      await deleteReply(ticketId, replyId, token);
      await fetchDetail();
    } catch {
      showToast('첨부 파일을 먼저 삭제해 주세요', 'error');
    }
  };

  const [currentUserId, setCurrentUserId] = useState(null);
  const decoded = jwtDecode(token);
  useEffect(() => {
    if (token) {
      try {
        setCurrentUserId(decoded.id); // JWT에 있는 사용자 ID 키 확인 필요 (보통 'id' 또는 'user_id')
      } catch (err) {
        console.error("JWT 디코딩 실패", err);
      }
    }
  }, [token]);

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
              <h3>⚠️ 파일 삭제 확인</h3>
            </div>
            <div className="modal-content">
              <p>이 파일을 삭제하시겠습니까?</p>
              <div className="modal-warning">
                <span>삭제된 파일은 복구할 수 없습니다.</span>
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

      {/* 댓글 삭제 모달 */}
      {deleteTarget.replyId && (
        <div className="modal-overlay">
          <div className="reply-delete-modal">
            <div className="modal-title">댓글 삭제 확인</div>
            <div className="modal-message">정말로 이 댓글을 삭제하시겠습니까?<br/>삭제된 댓글은 복구할 수 없습니다.</div>
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setDeleteTarget({})}>취소</button>
              <button className="modal-btn confirm" onClick={async () => {
                await handleDeleteReply(deleteTarget.replyId);
                setDeleteTarget({});
              }}>삭제</button>
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
                  <div className="image-file">
                    <img
                      src={f.url}
                      alt={f.originalname}
                      className="file-image"
                      onClick={() => handleImageClick(f.url, f.originalname)}
                      style={{ cursor: 'pointer' }}
                    />
                    <div className="file-actions">
                      <a
                        href={f.url}
                        target="_blank"
                        rel="noreferrer"
                        className="file-link"
                      >
                        📎 {f.originalname}
                      </a>
                      {(role === 'admin' || ticket.author_id === currentUserId) && (
                        <button
                          className="delete-btn"
                          onClick={() => handleFileDelete(f.ticket_files_id, true)}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
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
                {editingReplyId === reply.id ? (
                  <div className="reply-edit-form">
                    <textarea
                      value={editedMessage}
                      onChange={(e) => setEditedMessage(e.target.value)}
                      className="reply-edit-textarea"
                    />
                    <div className="reply-edit-buttons">
                      <button onClick={() => handleUpdateReply(reply.id)}>저장</button>
                      <button onClick={() => setEditingReplyId(null)}>취소</button>
                    </div>
                  </div>
                ) : (
                  <p>{reply.message}</p>
                )}
              </div>
              <div className="reply-actions">
                {reply.author_id === currentUserId && editingReplyId !== reply.id && (
                  <>
                    <button className="reply-edit-btn" onClick={() => {
                      setEditingReplyId(reply.id);
                      setEditedMessage(reply.message);
                    }}>✏️ 수정</button>
                    <button className="reply-delete-btn" onClick={() => setDeleteTarget({ replyId: reply.id })}>🗑️ 삭제</button>
                  </>
                )}
              </div>
              {reply.files && reply.files.length > 0 && (
                <div className="reply-files">
                  <div className="file-grid">
                    {reply.files.map(f => (
                      <div key={f.filename} className="file-item">
                        <div className="image-file">
                          <img
                            src={f.url}
                            alt={f.originalname}
                            className="file-image"
                            onClick={() => handleImageClick(f.url, f.originalname)}
                            style={{ cursor: 'pointer' }}
                          />
                          <div className="file-actions">
                            <a
                              href={f.url}
                              target="_blank"
                              rel="noreferrer"
                              className="file-link"
                            >
                              📎 {f.originalname}
                            </a>
                            {(role === 'admin' || reply.author_id === currentUserId) && (
                              <button 
                                className="delete-btn"
                                onClick={() => handleReplyFileDelete(f.ticket_reply_files_id, false)}
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        </div>
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
            <DragDropFileUpload
              files={replyFiles}
              setFiles={setReplyFiles}
              filePreviews={replyFilePreviews}
              setFilePreviews={setReplyFilePreviews}
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

          <button 
            type="submit" 
            className="submit-btn"
            disabled={submitting || !message.trim()}
          >
            {submitting ? '등록 중...' : '댓글 등록'}
          </button>
        </form>
      </div>

      {/* 이미지 모달 */}
      {showImageModal && selectedImage && (
        <div className="image-modal-overlay" onClick={closeImageModal}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="image-modal-header">
              <h3>{selectedImage.filename}</h3>
              <button className="modal-close-btn" onClick={closeImageModal}>
                ✕
              </button>
            </div>
            <div className="image-modal-body">
              <img src={selectedImage.url} alt={selectedImage.filename} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketDetailBase;