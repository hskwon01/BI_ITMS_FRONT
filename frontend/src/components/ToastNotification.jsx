import React, { useEffect } from 'react';

const ToastNotification = ({ message, type = 'info', duration = 3000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onClose) {
        onClose();
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!message) return null;

  return (
    <div className={`toast-notification ${type}`}>
      {message}
    </div>
  );
};

export default ToastNotification; 