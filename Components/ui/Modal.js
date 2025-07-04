'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import clsx from 'clsx';

const CustomModal = ({
  visible,
  onClose,
  title,
  children,
  showHeader = true,
  position = 'bottom', // 'bottom', 'center', 'top'
  transparent = true,
}) => {
  const [isVisible, setIsVisible] = useState(visible);

  useEffect(() => {
    if (visible) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 100); // Allow animations to complete
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!isVisible && !visible) return null;

  const emptyStateContent = (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <p className="text-gray-500 text-base mb-4">No options available</p>
      <button
        className="text-sky-500 font-semibold py-2 px-4"
        onClick={onClose}
      >
        Close
      </button>
    </div>
  );

  const positionClass = {
    top: 'items-start mt-10',
    center: 'items-center justify-center',
    bottom: 'items-end mb-10',
  }[position] || 'items-end mb-10';

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-black/50 transition-all">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-label="Close modal"
        role="button"
      />

      {/* Modal Content */}
      <div
        className={clsx(
          'relative w-full max-w-lg bg-white rounded-2xl shadow-lg z-50 overflow-hidden transition-all',
          'max-h-[90vh] flex flex-col',
          positionClass
        )}
      >
        {/* Handle indicator (only for bottom modal) */}
        {position === 'bottom' && (
          <div className="w-full flex justify-center py-3">
            <div className="w-10 h-1.5 rounded-full bg-gray-300" />
          </div>
        )}

        {/* Header */}
        {showHeader && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        )}

        {/* Children or Empty State */}
        <div className="overflow-y-auto">{children || emptyStateContent}</div>
      </div>
    </div>
  );
};

export default CustomModal;