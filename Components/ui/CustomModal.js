"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

const CustomModal = ({
  visible,
  onClose,
  title,
  children,
  showHeader = true,
  position = "bottom", // 'bottom', 'center', 'top'
  transparent = true,
  animationType = null, // Optional override for animationType
}) => {
  // Track internal visibility state
  const [isVisible, setIsVisible] = useState(visible);
  const [isAnimating, setIsAnimating] = useState(false);

  // Debug log for visibility changes
  useEffect(() => {
    console.log("CustomModal: visible prop changed:", visible);
  }, [visible]);

  // Update internal visibility when prop changes
  useEffect(() => {
    if (visible) {
      console.log("CustomModal: Setting isVisible to true");
      setIsVisible(true);
      setIsAnimating(true);
      // Trigger enter animation
      setTimeout(() => setIsAnimating(false), 10);
    } else {
      console.log("CustomModal: Will set isVisible to false after delay");
      setIsAnimating(true);
      // When closing, delay hiding the modal slightly to allow animations to complete
      const timer = setTimeout(() => {
        console.log("CustomModal: Setting isVisible to false now");
        setIsVisible(false);
        setIsAnimating(false);
      }, 300); // Match animation duration
      return () => clearTimeout(timer);
    }
  }, [visible]);

  // Handle escape key press
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === "Escape" && visible) {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener("keydown", handleEscapeKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "unset";
    };
  }, [visible, onClose]);

  // Don't render anything when not visible
  if (!isVisible && !visible) {
    return null;
  }

  console.log("CustomModal: Rendering modal content");

  // Determine animation classes based on position
  const getAnimationClasses = () => {
    const baseClasses = "transition-all duration-300 ease-in-out";

    if (position === "center") {
      return `${baseClasses} ${
        isAnimating && !visible ? "opacity-0 scale-95" : "opacity-100 scale-100"
      }`;
    }

    if (position === "top") {
      return `${baseClasses} ${
        isAnimating && !visible
          ? "transform -translate-y-full opacity-0"
          : "transform translate-y-0 opacity-100"
      }`;
    }

    // Default: bottom
    return `${baseClasses} ${
      isAnimating && !visible
        ? "transform translate-y-full opacity-0"
        : "transform translate-y-0 opacity-100"
    }`;
  };

  // Get position-specific classes
  const getPositionClasses = () => {
    switch (position) {
      case "top":
        return "justify-start items-center pt-0";
      case "center":
        return "justify-center items-center p-5";
      case "bottom":
      default:
        return "justify-end items-center pb-0";
    }
  };

  // Get content-specific classes
  const getContentClasses = () => {
    const baseClasses =
      "bg-white w-full max-h-[90vh] overflow-hidden shadow-2xl relative z-20";

    switch (position) {
      case "top":
        return `${baseClasses} rounded-b-2xl max-w-full`;
      case "center":
        return `${baseClasses} rounded-2xl max-w-lg mx-5`;
      case "bottom":
      default:
        return `${baseClasses} rounded-t-2xl max-w-full`;
    }
  };

  // Content for empty state
  const emptyStateContent = (
    <div className="p-5 text-center">
      <p className="text-base text-gray-600 mb-4">No options available</p>
      <button
        className="px-6 py-2 text-sky-500 font-semibold hover:bg-sky-50 rounded-lg transition-colors"
        onClick={onClose}
      >
        Close
      </button>
    </div>
  );

  const modalContent = (
    <div className="fixed inset-0 z-50 flex" style={{ zIndex: 9999 }}>
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isAnimating && !visible ? "opacity-0" : "opacity-50"
        }`}
        onClick={onClose}
        role="button"
        tabIndex={0}
        aria-label="Close modal"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            onClose();
          }
        }}
      />

      {/* Modal container */}
      <div className={`relative w-full h-full flex ${getPositionClasses()}`}>
        <div className={`${getContentClasses()} ${getAnimationClasses()}`}>
          {/* Handle indicator for bottom sheet */}
          {position === "bottom" && (
            <div className="w-full flex justify-center py-3">
              <div className="w-10 h-1.5 bg-gray-300 rounded-full" />
            </div>
          )}

          {/* Header with title and close button */}
          {showHeader && (
            <div className="flex items-center justify-between px-5 pt-1 pb-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
              <button
                className="p-2 hover:bg-gray-100 rounded-full transition-colors -mr-2"
                onClick={onClose}
                aria-label="Close modal"
                type="button"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>
          )}

          {/* Modal content or empty state */}
          <div className="flex-1 overflow-y-auto">
            {children || emptyStateContent}
          </div>
        </div>
      </div>
    </div>
  );

  // Use portal to render modal at document root level
  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : null;
};

export default CustomModal;
