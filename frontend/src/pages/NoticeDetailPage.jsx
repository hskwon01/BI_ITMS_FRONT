import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import CommonLayout from '../components/CommonLayout';
import { fetchNotice, deleteNotice } from '../api/notices';
import { useUser } from '../contexts/UserContext';
import { FileText, BarChart3 } from 'lucide-react';
import '../css/NoticeDetailPage.css';

const NoticeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    loadNotice();
  }, [id]);

  const loadNotice = async () => {
    try {
      setLoading(true);
      const response = await fetchNotice(id);
      setNotice(response.data);
    } catch (err) {
      console.error('공지사항 로드 실패:', err);
      setError('공지사항을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('이 공지사항을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await deleteNotice(id);
      alert('공지사항이 삭제되었습니다.');
      navigate('/notices');
    } catch (err) {
      console.error('삭제 실패:', err);
      alert('삭제에 실패했습니다.');
    }
  };

  const getFileUrl = (fileName) => {
    const baseUrl = process.env.REACT_APP_API_URL ? 
      process.env.REACT_APP_API_URL.replace('/api', '') : 
      'http://localhost:5000';
    return `${baseUrl}/uploads/${fileName}`;
  };

  const handleFileDownload = (file) => {
    // 파일 다운로드 로직
    const link = document.createElement('a');
    link.href = getFileUrl(file.url);
    link.download = file.originalname;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImageClick = (imageUrl, filename) => {
    setSelectedImage({ url: imageUrl, filename });
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
  };

  // 파일 타입에 따른 아이콘 생성 함수
  const getFileIcon = (filename) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return <FileText size={16} />;
      case 'xls':
      case 'xlsx':
        return <BarChart3 size={16} />;
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
      case 'webp':
        return '🖼️';
      default:
        return '📎';
    }
  };

  const isImageFile = (filename) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(extension);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <CommonLayout>
        <div className="notice-detail-container">
          <div className="notice-loading">
            <div className="spinner"></div>
            <p>공지사항을 불러오는 중...</p>
          </div>
        </div>
      </CommonLayout>
    );
  }

  if (error || !notice) {
    return (
      <CommonLayout>
        <div className="notice-detail-container">
          <div className="notice-error">
            <h2>오류가 발생했습니다</h2>
            <p>{error || '공지사항을 찾을 수 없습니다.'}</p>
            <Link to="/notices" className="btn btn-primary">
              목록으로 돌아가기
            </Link>
          </div>
        </div>
      </CommonLayout>
    );
  }

  const canManage = user?.data?.role === 'admin' || user?.data?.role === 'itsm_team';

  return (
    <CommonLayout>
      <div className="notice-detail-container">
        {/* 브레드크럼 */}
        <div className="notice-breadcrumb">
          <Link to="/notices" className="breadcrumb-link">공지사항</Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">상세보기</span>
        </div>

        {/* 상단 액션 버튼 */}
        <div className="notice-actions">
          <Link to="/notices" className="btn btn-secondary">
            <i className="icon">←</i> 목록으로
          </Link>
          {canManage && (
            <div className="notice-manage-actions">
              <Link to={`/notices/${id}/edit`} className="btn btn-primary">
                수정
              </Link>
              <button onClick={handleDelete} className="btn btn-danger">
                삭제
              </button>
            </div>
          )}
        </div>

        {/* 공지사항 상세 정보 */}
        <div className="notice-detail-card">
          <div className="notice-header">
            <div className="notice-title-section">
              <h1 className="notice-title">
                {notice.title}
                {notice.is_pinned && <span className="notice-pin">📌</span>}
              </h1>
              <div className="notice-meta">
                <span className="notice-date">
                  등록일: {new Date(notice.created_at).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
                {notice.updated_at && notice.updated_at !== notice.created_at && (
                  <span className="notice-updated">
                    수정일: {new Date(notice.updated_at).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="notice-divider"></div>

          {/* 공지사항 내용 */}
          <div className="notice-content">
            <div className="notice-text" dangerouslySetInnerHTML={{ 
              __html: notice.content.replace(/\n/g, '<br />') 
            }}></div>
          </div>

          {/* 첨부파일 */}
          {notice.files && notice.files.length > 0 && (
            <div className="notice-files-section">
              <div className="notice-divider"></div>
              <h3 className="files-title">첨부파일 ({notice.files.length}개)</h3>
              <div className="file-grid">
                {notice.files.map((file, index) => (
                  <div key={index} className="file-item">
                    {isImageFile(file.originalname) ? (
                      // 이미지 파일 미리보기
                      <div className="image-file">
                        <div className="image-preview">
                          <img
                            src={getFileUrl(file.url)}
                            alt={file.originalname}
                            className="file-image"
                            onClick={() => handleImageClick(getFileUrl(file.url), file.originalname)}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div className="image-error" style={{ display: 'none' }}>
                            <span className="file-icon">{getFileIcon(file.originalname)}</span>
                            <span>미리보기 불가</span>
                          </div>
                        </div>
                        <div className="file-info">
                          <div className="file-name" title={file.originalname}>
                            {file.originalname}
                          </div>
                          <div className="file-actions">
                            <button
                              onClick={() => handleImageClick(getFileUrl(file.url), file.originalname)}
                              className="file-action-btn preview-btn"
                              title="확대 보기"
                            >
                              🔍
                            </button>
                            <button 
                              onClick={() => handleFileDownload(file)}
                              className="file-action-btn download-btn"
                              title="다운로드"
                            >
                              ⬇️
                            </button>
                            <a
                              href={getFileUrl(file.url)}
                              target="_blank"
                              rel="noreferrer"
                              className="file-action-btn link-btn"
                              title="새 탭에서 열기"
                            >
                              🔗
                            </a>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // 문서 파일
                      <div className="document-file">
                        <div className="document-preview">
                          <div className="document-icon">
                            {getFileIcon(file.originalname)}
                          </div>
                          <div className="document-meta">
                            <div className="file-extension">
                              {file.originalname.split('.').pop()?.toUpperCase()}
                            </div>
                          </div>
                        </div>
                        <div className="file-info">
                          <div className="file-name" title={file.originalname}>
                            {file.originalname}
                          </div>
                          <div className="file-actions">
                            <button 
                              onClick={() => handleFileDownload(file)}
                              className="file-action-btn download-btn"
                              title="다운로드"
                            >
                              ⬇️
                            </button>
                            <a
                              href={getFileUrl(file.url)}
                              target="_blank"
                              rel="noreferrer"
                              className="file-action-btn link-btn"
                              title="새 탭에서 열기"
                            >
                              🔗
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 하단 네비게이션 */}
        <div className="notice-bottom-nav">
          <Link to="/notices" className="btn btn-outline">
            목록으로 돌아가기
          </Link>
        </div>

        {/* 이미지 확대 모달 */}
        {showImageModal && selectedImage && (
          <div className="image-modal-overlay" onClick={closeImageModal}>
            <div className="image-modal" onClick={(e) => e.stopPropagation()}>
              <div className="image-modal-header">
                <h3 className="image-modal-title">{selectedImage.filename}</h3>
                <button className="image-modal-close" onClick={closeImageModal}>
                  ✕
                </button>
              </div>
              <div className="image-modal-body">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.filename}
                  className="image-modal-content"
                />
              </div>
              <div className="image-modal-footer">
                <button 
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = selectedImage.url;
                    link.download = selectedImage.filename;
                    link.click();
                  }}
                  className="btn btn-primary"
                >
                  ⬇️ 다운로드
                </button>
                <a
                  href={selectedImage.url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary"
                >
                  🔗 새 탭에서 열기
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </CommonLayout>
  );
};

export default NoticeDetailPage;
