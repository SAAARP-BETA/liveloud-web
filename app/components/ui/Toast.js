import React, { useState, useEffect } from 'react';

const Toast = ({ message, type = 'info', isVisible, onHide, duration = 3000 }) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onHide();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onHide]);

  if (!isVisible) return null;

  const getToastStyles = () => {
    const baseStyles = "fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out max-w-sm";
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-500 text-white`;
      case 'error':
        return `${baseStyles} bg-red-500 text-white`;
      case 'warning':
        return `${baseStyles} bg-yellow-500 text-white`;
      case 'info':
      default:
        return `${baseStyles} bg-blue-500 text-white`;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'info':
      default:
        return (
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className={getToastStyles()}>
      <div className="flex items-center">
        {getIcon()}
        <span className="text-sm font-medium">{message}</span>
        <button
          onClick={onHide}
          className="ml-2 p-1 hover:bg-black hover:bg-opacity-20 rounded-full transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Hook for managing toast state
export const useToast = () => {
  const [toast, setToast] = useState({
    message: '',
    type: 'info',
    isVisible: false,
  });

  const showToast = (message, type = 'info', duration = 3000) => {
    setToast({
      message,
      type,
      isVisible: true,
      duration,
    });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  const ToastComponent = () => (
    <Toast
      message={toast.message}
      type={toast.type}
      isVisible={toast.isVisible}
      onHide={hideToast}
      duration={toast.duration}
    />
  );

  return { showToast, hideToast, ToastComponent };
};

export default Toast;