import React, { createContext, useContext, useState, useCallback } from 'react';
import ToastNotification from '../components/ToastNotification';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState(null);

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now();
    const newToast = { id, message, type, duration };
    
    setToasts(prev => [...prev, newToast]);
    
    // 자동으로 제거
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showSuccess = useCallback((message, duration) => {
    showToast(message, 'success', duration);
  }, [showToast]);

  const showError = useCallback((message, duration) => {
    showToast(message, 'error', duration);
  }, [showToast]);

  const showWarning = useCallback((message, duration) => {
    showToast(message, 'warning', duration);
  }, [showToast]);

  const showInfo = useCallback((message, duration) => {
    showToast(message, 'info', duration);
  }, [showToast]);

  const showConfirm = useCallback((message, onConfirm, onCancel) => {
    setConfirmDialog({ message, onConfirm, onCancel });
  }, []);

  const hideConfirm = useCallback(() => {
    setConfirmDialog(null);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showWarning, showInfo, removeToast, showConfirm }}>
      {children}
      {toasts.map(toast => (
        <ToastNotification
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
      {confirmDialog && (
        <div className="confirm-dialog-overlay">
          <div className="confirm-dialog">
            <div className="confirm-dialog-content">
              <div className="confirm-dialog-icon">⚠️</div>
              <div className="confirm-dialog-message">{confirmDialog.message}</div>
            </div>
            <div className="confirm-dialog-actions">
              <button 
                className="btn btn-secondary" 
                onClick={() => {
                  if (confirmDialog.onCancel) confirmDialog.onCancel();
                  hideConfirm();
                }}
              >
                취소
              </button>
              <button 
                className="btn btn-danger" 
                onClick={() => {
                  if (confirmDialog.onConfirm) confirmDialog.onConfirm();
                  hideConfirm();
                }}
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}; 