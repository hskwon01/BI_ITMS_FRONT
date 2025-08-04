import React, { useState, useRef, useCallback } from 'react';
import './DragDropFileUpload.css';

const DragDropFileUpload = ({ 
  files, 
  setFiles, 
  filePreviews, 
  setFilePreviews, 
  maxFiles = 5, 
  maxSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = ['image/*', 'application/pdf', 'text/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    // 파일 크기 체크
    if (file.size > maxSize) {
      return { valid: false, error: `파일 크기는 ${maxSize / (1024 * 1024)}MB 이하여야 합니다.` };
    }

    // 파일 타입 체크
    const isValidType = acceptedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -1));
      }
      return file.type === type;
    });

    if (!isValidType) {
      return { valid: false, error: '지원하지 않는 파일 형식입니다.' };
    }

    return { valid: true };
  };

  const processFiles = useCallback((newFiles) => {
    const validFiles = [];
    const errors = [];

    Array.from(newFiles).forEach(file => {
      const validation = validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    });

    // 최대 파일 수 체크
    if (files.length + validFiles.length > maxFiles) {
      errors.push(`최대 ${maxFiles}개까지 업로드 가능합니다.`);
      return { errors };
    }

    // 파일 미리보기 생성
    const newPreviews = validFiles.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }));

    setFiles(prev => [...prev, ...validFiles]);
    setFilePreviews(prev => [...prev, ...newPreviews]);

    return { errors };
  }, [files, maxFiles, maxSize, acceptedTypes, setFiles, setFilePreviews]);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev + 1);
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev - 1);
    if (dragCounter === 1) {
      setIsDragOver(false);
    }
  }, [dragCounter]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    setDragCounter(0);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      const result = processFiles(droppedFiles);
      if (result.errors && result.errors.length > 0) {
        alert(result.errors.join('\n'));
      }
    }
  }, [processFiles]);

  const handleFileSelect = useCallback((e) => {
    const selectedFiles = e.target.files;
    if (selectedFiles.length > 0) {
      const result = processFiles(selectedFiles);
      if (result.errors && result.errors.length > 0) {
        alert(result.errors.join('\n'));
      }
    }
  }, [processFiles]);

  const removeFile = useCallback((index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setFilePreviews(prev => {
      const newPreviews = prev.filter((_, i) => i !== index);
      // URL 해제
      if (prev[index]?.preview) {
        URL.revokeObjectURL(prev[index].preview);
      }
      return newPreviews;
    });
  }, [setFiles, setFilePreviews]);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return '🖼️';
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
    if (type.includes('powerpoint') || type.includes('presentation')) return '📈';
    if (type.includes('text')) return '📄';
    if (type.includes('zip') || type.includes('rar')) return '📦';
    return '📎';
  };

  const isImageFile = (type) => {
    return type.startsWith('image/');
  };

  const handleFileClick = (file, index) => {
    if (file.type.startsWith('image/')) {
      setSelectedFile({ ...file, index });
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedFile(null);
  };

  return (
    <div className="drag-drop-container">
      <div
        className={`drag-drop-area ${isDragOver ? 'drag-over' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="drag-drop-content">
          <div className="drag-drop-icon">📁</div>
          <p className="drag-drop-text">
            파일을 드래그하여 여기에 놓거나 <span className="click-here">클릭</span>하여 선택하세요
          </p>
          <p className="drag-drop-hint">
            최대 {maxFiles}개 파일, 각 파일 {maxSize / (1024 * 1024)}MB 이하<br />
            이미지, PDF, 문서, 엑셀 파일 지원
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </div>

      {filePreviews.length > 0 && (
        <div className="file-previews">
          <h4>선택된 파일 ({filePreviews.length}/{maxFiles})</h4>
          <div className="file-list">
            {filePreviews.map((file, index) => (
              <div key={index} className="file-item">
                {isImageFile(file.type) ? (
                  // 이미지 파일 미리보기
                  <div className="image-file">
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="file-image"
                      onClick={() => handleFileClick(file, index)}
                      style={{ cursor: 'pointer' }}
                    />
                    <div className="file-info">
                      <div className="file-name">{file.name}</div>
                      <div className="file-actions">
                        <span className="file-size">{formatFileSize(file.size)}</span>
                        <button
                          type="button"
                          className="remove-file-btn"
                          onClick={() => removeFile(index)}
                          title="파일 제거"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // 문서 파일 미리보기
                  <div className="document-file">
                    <div className="document-preview">
                      <div className="document-icon">
                        {getFileIcon(file.type)}
                      </div>
                      <div className="document-info">
                        <div className="document-name">{file.name}</div>
                        <div className="document-meta">
                          <span className="file-size">{formatFileSize(file.size)}</span>
                          <span className="file-type">{file.type.split('/')[1]?.toUpperCase()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="document-actions">
                      <button
                        type="button"
                        className="remove-file-btn"
                        onClick={() => removeFile(index)}
                        title="파일 제거"
                      >
                        ✕ 제거
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 이미지 모달 */}
      {showModal && selectedFile && (
        <div className="image-modal-overlay" onClick={closeModal}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="image-modal-header">
              <h3>{selectedFile.name}</h3>
              <button className="modal-close-btn" onClick={closeModal}>
                ✕
              </button>
            </div>
            <div className="image-modal-body">
              <img src={selectedFile.preview} alt={selectedFile.name} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DragDropFileUpload; 