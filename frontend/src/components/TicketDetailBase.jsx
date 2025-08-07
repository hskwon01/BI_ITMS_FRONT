import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getTicketDetail, postReply, deleteTicketFile, deleteReplyFile, updateReply, deleteReply, uploadReplyFiles, assignTicket, updateTicketStatus } from '../api/ticket';
import { getAssignees } from '../api/user';
import DragDropFileUpload from './DragDropFileUpload';
import AdminLayout from './AdminLayout';
import UserLayout from './UserLayout';
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
  const [modalState, setModalState] = useState({ show: false, title: '', content: '', warning: '', onConfirm: null });
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [assignees, setAssignees] = useState([]); // 담당자 목록
  const [assigning, setAssigning] = useState(false); // 담당자 배정 중 상태
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editedMessage, setEditedMessage] = useState('');

  // 담당자 배정 및 댓글 모달 관련 상태
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [assignReplyMessage, setAssignReplyMessage] = useState('');

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

    if (ticket.status === '종결') {
      showToast('이미 종결된 티켓입니다.', 'error');
      return;
    }

    if (newStatus === '종결') {
      setModalState({
        show: true,
        title: '티켓 종결 확인',
        content: '이 티켓을 종결 처리하시겠습니까?',
        warning: '종결된 티켓은 더 이상 상태를 변경할 수 없습니다.',
        onConfirm: () => handleCloseTicket(),
      });
      return;
    }

    if (ticket.status === '접수' && newStatus === '진행중') {
      setShowAssignModal(true);
      return;
    }

    // 진행중 상태에서 접수로 변경하는 것을 막음
    if (ticket.status === '진행중' && newStatus === '접수') {
      showToast('진행중인 티켓은 접수 상태로 되돌릴 수 없습니다.', 'error');
      return;
    }
    
    try {
      setUpdatingStatus(true);
      await updateTicketStatus(ticketId, newStatus, token);
      showToast(`티켓 상태가 '${newStatus}'로 변경되었습니다.`, 'success');
      fetchDetail();
    } catch {
      showToast('상태 변경에 실패했습니다.', 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAssignAndReplySubmit = async () => {
    if (!selectedAssignee) {
      showToast('담당자를 선택해주세요.', 'error');
      return;
    }

    try {
      setAssigning(true);
      // 1. 담당자 배정
      await assignTicket(ticketId, parseInt(selectedAssignee), token);

      // 2. 댓글 등록 (선택 사항)
      if (assignReplyMessage.trim()) {
        const replyData = { message: assignReplyMessage, files: [] };
        await postReply(ticketId, replyData, token);
      }

      // 3. 상태 변경
      await updateTicketStatus(ticketId, '진행중', token);

      showToast('담당자 배정 및 상태 변경 완료', 'success');
      setShowAssignModal(false);
      setSelectedAssignee('');
      setAssignReplyMessage('');
      fetchDetail();
    } catch (err) {
      console.error("담당자 배정 및 상태 변경 실패:", err);
      showToast('담당자 배정 및 상태 변경 실패', 'error');
    } finally {
      setAssigning(false);
    }
  };

  const handleCloseTicket = async () => {
    try {
      setUpdatingStatus(true);
      await updateTicketStatus(ticketId, '종결', token);
      showToast('티켓이 종결 처리되었습니다.', 'success');
      fetchDetail();
    } catch (err) {
      console.error("티켓 종결 실패:", err);
      showToast('티켓 종결 처리에 실패했습니다.', 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAssigneeChange = async (e) => {
    const newAssigneeId = e.target.value === '' ? null : parseInt(e.target.value);
    if (newAssigneeId === ticket.assignee_id) return; // 동일한 담당자 선택 시 변경 없음

    try {
      setAssigning(true);
      await assignTicket(ticketId, newAssigneeId, token);
      showToast(newAssigneeId ? '담당자가 배정되었습니다.' : '담당자 배정이 해제되었습니다.', 'success');
      fetchDetail(); // 변경된 담당자 정보 반영
    } catch (err) {
      console.error("담당자 배정 실패:", err);
      showToast('담당자 배정에 실패했습니다.', 'error');
    } finally {
      setAssigning(false);
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
    setModalState({
      show: true,
      title: '⚠️ 파일 삭제 확인',
      content: '이 파일을 삭제하시겠습니까?',
      warning: '삭제된 파일은 복구할 수 없습니다.',
      onConfirm: () => confirmDelete(ticket_files_id, isTicketFile),
    });
  };

  const handleReplyFileDelete = async (ticket_reply_files_id, isTicketFile = false) => {
    setModalState({
      show: true,
      title: '⚠️ 파일 삭제 확인',
      content: '이 파일을 삭제하시겠습니까?',
      warning: '삭제된 파일은 복구할 수 없습니다.',
      onConfirm: () => confirmDelete(ticket_reply_files_id, isTicketFile),
    });
  };

  const confirmDelete = async (id, isTicketFile) => {
    try {
      if (isTicketFile) {
        await deleteTicketFile(id, token);
      } else {
        await deleteReplyFile(id, token);
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
      setModalState({ show: false, title: '', content: '', warning: '', onConfirm: null });
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

  // 파일 타입에 따른 아이콘과 미리보기 컴포넌트 생성 함수
  const getFileIcon = (filename) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'xls':
      case 'xlsx':
        return '📊';
      case 'ppt':
      case 'pptx':
        return '📈';
      case 'txt':
        return '📄';
      case 'zip':
      case 'rar':
        return '📦';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'bmp':
      case 'svg':
        return '🖼️';
      default:
        return '📎';
    }
  };

  const isImageFile = (filename) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(extension);
  };

  const isPdfFile = (filename) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    return extension === 'pdf';
  };

  const isDocumentFile = (filename) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    return ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'].includes(extension);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
    // 해당 댓글의 첨부파일이 있는지 확인
    const reply = replies.find(r => r.id === replyId);
    if (reply && reply.files && reply.files.length > 0) {
      showToast('첨부 파일을 먼저 삭제해 주세요', 'error');
      return;
    }

    setModalState({
      show: true,
      title: '⚠️ 댓글 삭제 확인',
      content: '이 댓글을 삭제하시겠습니까?',
      warning: '삭제된 댓글은 복구할 수 없습니다.',
      onConfirm: async () => {
        try {
          await deleteReply(ticketId, replyId, token);
          await fetchDetail();
          showToast('댓글이 삭제되었습니다.', 'success');
        } catch (error) {
          console.error("댓글 삭제 에러:", error);
          showToast('댓글 삭제에 실패했습니다.', 'error');
        }
      },
    });
  };

  const [currentUserId, setCurrentUserId] = useState(null);
  
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
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

    markAsRead();
    fetchDetail();
  }, [ticketId, token]);

  useEffect(() => {
    const fetchAssignees = async () => {
      if (role === 'admin' || role === 'itsm_team') {
        try {
          const res = await getAssignees(token);
          setAssignees(res.data);
        } catch (err) {
          console.error("담당자 목록 불러오기 실패", err);
          showToast('담당자 목록 불러오기 실패', 'error');
        }
      }
    };
    fetchAssignees();
  }, [role, token]);

  if (!ticket) return null;

  const Layout = role === 'admin' ? AdminLayout : UserLayout;
  
  return (
    <Layout>
      <div className="ticket-detail-container">
        {toast.show && (
          <div className={`toast-notification ${toast.type}`}>
            {toast.message}
          </div>
        )}

      {modalState.show && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <div className="modal-header">
              <h3>{modalState.title}</h3>
            </div>
            <div className="modal-content">
              <p>{modalState.content}</p>
              {modalState.warning && (
                <div className="modal-warning">
                  <span>{modalState.warning}</span>
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button 
                className="modal-btn cancel"
                onClick={() => setModalState({ ...modalState, show: false })}
              >
                취소
              </button>
              <button 
                className="modal-btn confirm"
                onClick={() => {
                  modalState.onConfirm();
                  setModalState({ ...modalState, show: false });
                }}
              >
                확인
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
                disabled={updatingStatus || ticket.status === '종결'}
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

        <div className="ticket-meta-grid">
          {ticket.ticket_type === 'SR' ? (
            <>
              <div className="meta-item">
                <span className="meta-label">관련 제품:</span>
                <span className="meta-value">{ticket.product}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">S/W Version:</span>
                <span className="meta-value">{ticket.sw_version}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">OS:</span>
                <span className="meta-value">{ticket.os}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Platform:</span>
                <span className="meta-value">{ticket.platform}</span>
              </div>
            </>
          ) : (
            <div className="meta-item">
              <span className="meta-label">고객사:</span>
              <span className="meta-value">{ticket.client_company}</span>
            </div>
          )}
          <div className="meta-item">
            <span className="meta-label">담당자:</span>
            <span className="meta-value">{ticket.assignee_name || '미배정'}</span>
          </div>
        </div>

        {ticket.files && ticket.files.length > 0 && (
          <div className="ticket-files">
            <h3>첨부파일</h3>
            <div className="file-grid">
              {ticket.files.map(f => (
                <div key={f.filename} className="file-item">
                  {isImageFile(f.originalname) ? (
                    // 이미지 파일 미리보기
                    <div className="image-file">
                      <img
                        src={f.url}
                        alt={f.originalname}
                        className="file-image"
                        onClick={() => handleImageClick(f.url, f.originalname)}
                        style={{ cursor: 'pointer' }}
                      />
                      <div className="file-info">
                        <div className="file-name">{f.originalname}</div>
                        <div className="file-actions">
                          <a
                            href={f.url}
                            target="_blank"
                            rel="noreferrer"
                            className="file-link"
                            title="새 탭에서 열기"
                          >
                            🔗
                          </a>
                          {(role === 'admin' || ticket.author_id === currentUserId) && (
                            <button
                              className="delete-btn"
                              onClick={() => handleFileDelete(f.ticket_files_id, true)}
                              title="삭제"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    // 문서 파일 미리보기
                    <div className="document-file">
                      <div className="document-preview">
                        <div className="document-icon">
                          {getFileIcon(f.originalname)}
                        </div>
                        <div className="document-info">
                          <div className="document-name">{f.originalname}</div>
                          <div className="document-meta">
                            {f.size && <span className="file-size">{formatFileSize(f.size)}</span>}
                            <span className="file-type">{f.originalname.split('.').pop()?.toUpperCase()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="document-actions">
                        {!(isPdfFile(f.originalname) || isDocumentFile(f.originalname)) && (
                          <a
                            href={f.url}
                            target="_blank"
                            rel="noreferrer"
                            className="document-link"
                            title="새 탭에서 열기"
                          >
                            🔗 열기
                          </a>
                        )}
                        <a
                          href={f.url}
                          download={f.originalname}
                          className="document-download"
                          title="다운로드"
                        >
                          ⬇️ 다운로드
                        </a>
                        {(role === 'admin' || ticket.author_id === currentUserId) && (
                          <button
                            className="delete-btn"
                            onClick={() => handleFileDelete(f.ticket_files_id, true)}
                            title="삭제"
                          >
                            ✕
                          </button>
                        )}
                      </div>
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
                    <button className="reply-delete-btn" onClick={() => handleDeleteReply(reply.id)}>🗑️ 삭제</button>
                  </>
                )}
              </div>
              {reply.files && reply.files.length > 0 && (
                <div className="reply-files">
                  <div className="file-grid">
                    {reply.files.map(f => (
                      <div key={f.filename} className="file-item">
                        {isImageFile(f.originalname) ? (
                          // 이미지 파일 미리보기
                          <div className="image-file">
                            <img
                              src={f.url}
                              alt={f.originalname}
                              className="file-image"
                              onClick={() => handleImageClick(f.url, f.originalname)}
                              style={{ cursor: 'pointer' }}
                            />
                            <div className="file-info">
                              <div className="file-name">{f.originalname}</div>
                              <div className="file-actions">
                                <a
                                  href={f.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="file-link"
                                  title="새 탭에서 열기"
                                >
                                  🔗
                                </a>
                                {(role === 'admin' || reply.author_id === currentUserId) && (
                                  <button 
                                    className="delete-btn"
                                    onClick={() => handleReplyFileDelete(f.ticket_reply_files_id, false)}
                                    title="삭제"
                                  >
                                    ✕
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          // 문서 파일 미리보기
                          <div className="document-file">
                            <div className="document-preview">
                              <div className="document-icon">
                                {getFileIcon(f.originalname)}
                              </div>
                              <div className="document-info">
                                <div className="document-name">{f.originalname}</div>
                                <div className="document-meta">
                                  {f.size && <span className="file-size">{formatFileSize(f.size)}</span>}
                                  <span className="file-type">{f.originalname.split('.').pop()?.toUpperCase()}</span>
                                </div>
                              </div>
                            </div>
                            <div className="document-actions">
                              {!(isPdfFile(f.originalname) || isDocumentFile(f.originalname)) && (
                                <a
                                  href={f.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="document-link"
                                  title="새 탭에서 열기"
                                >
                                  🔗 열기
                                </a>
                              )}
                              <a
                                href={f.url}
                                download={f.originalname}
                                className="document-download"
                                title="다운로드"
                              >
                                ⬇️ 다운로드
                              </a>
                              {(role === 'admin' || reply.author_id === currentUserId) && (
                                <button 
                                  className="delete-btn"
                                  onClick={() => handleReplyFileDelete(f.ticket_reply_files_id, false)}
                                  title="삭제"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
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

      {/* 담당자 배정 및 댓글 모달 */}
      {showAssignModal && (
        <div className="modal-overlay">
          <div className="assign-modal">
            <div className="modal-header">
              <h3>티켓 진행 시작</h3>
            </div>
            <div className="modal-content">
              <p>이 티켓의 상태를 '진행중'으로 변경하고 담당자를 배정하시겠습니까?</p>
              
              <div className="form-group">
                <label htmlFor="assignee-select">담당자 선택:</label>
                <select
                  id="assignee-select"
                  value={selectedAssignee}
                  onChange={(e) => setSelectedAssignee(e.target.value)}
                  className="assignee-select"
                  disabled={assigning}
                >
                  <option value="">-- 담당자 선택 --</option>
                  {assignees.map(assignee => (
                    <option key={assignee.id} value={assignee.id}>
                      {assignee.name} ({assignee.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="assign-reply-message">댓글 (선택 사항):</label>
                <textarea
                  id="assign-reply-message"
                  value={assignReplyMessage}
                  onChange={(e) => setAssignReplyMessage(e.target.value)}
                  placeholder="진행 시작에 대한 댓글을 남겨주세요..."
                  className="assign-reply-textarea"
                />
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className="modal-btn cancel"
                onClick={() => setShowAssignModal(false)}
                disabled={assigning}
              >
                취소
              </button>
              <button 
                className="modal-btn confirm"
                onClick={handleAssignAndReplySubmit}
                disabled={assigning || !selectedAssignee}
              >
                {assigning ? '처리 중...' : '진행 시작'}
              </button>
            </div>
          </div>
        </div>
      )}

      
    </div>
    </Layout>
    
  );
};

export default TicketDetailBase;