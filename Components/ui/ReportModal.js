// components/ui/ReportModal.js
'use client'
import React, { useState, useEffect } from 'react';
import { fonts } from '../../app/utils/fonts';
import { reportReasons, handleReportPost } from '../../app/utils/postFunctions';

// Flag icon component to replace Feather icons
const FlagIcon = ({ size = 20, color = '#64748B' }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke={color} 
    strokeWidth="2"
  >
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line x1="4" y1="22" x2="4" y2="15" />
  </svg>
);

const ReportModal = ({ 
  isVisible, 
  onClose, 
  post, 
  token,
  onSuccess 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedReason, setSelectedReason] = useState(null);
  const [customReason, setCustomReason] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  
  // Reset state when modal opens
  useEffect(() => {
    if (isVisible) {
      setSelectedReason(null);
      setCustomReason('');
      setShowCustomInput(false);
    }
  }, [isVisible]);

  // Handle reason selection
  const handleReasonSelect = (reason) => {
    setSelectedReason(reason);
    
    // If "Other" is selected, show custom input field
    if (reason.text === 'Other') {
      setShowCustomInput(true);
    } else {
      setShowCustomInput(false);
      // Submit the report directly for non-"Other" reasons
      submitReport(reason.text);
    }
  };

  // Handle report submission
  const submitReport = async (reasonText) => {
    if (!post || !token) {
      alert('Unable to report post. Please try again later.');
      onClose();
      return;
    }

    // For "Other" reason, validate custom input
    if (reasonText === 'Other') {
      if (!customReason.trim()) {
        alert('Please provide details for your report.');
        return;
      }
      reasonText = `Other: ${customReason.trim()}`;
    }

    setIsSubmitting(true);
    try {
      await handleReportPost(post.id, reasonText, token);
      alert('Report Submitted\n\nThanks for your report. Our team will review it shortly.');
      if (onSuccess) onSuccess(post.id);
      onClose();
    } catch (error) {
      alert(`Failed to submit report: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If not visible, don't render anything
  if (!isVisible) return null;

  return (
    <div style={styles.overlay}>
      {/* Backdrop */}
      <div 
        style={styles.backdrop} 
        onClick={onClose}
        role="button"
        tabIndex={0}
        aria-label="Close modal"
      />
      
      <div style={styles.content}>
        {/* Handle indicator for bottom sheet */}
        <div style={styles.handleContainer}>
          <div style={styles.handle} />
        </div>
        
        <div style={styles.header}>
          <h2 style={{ ...styles.title, fontFamily: fonts.Bold }}>
            Report Post
          </h2>
          
          <p style={{ ...styles.subtitle, fontFamily: fonts.Regular }}>
            Why are you reporting this post?
          </p>

          {post && (
            <div style={styles.postPreview}>
              <img
                src={post.profilePic}
                alt="Profile"
                style={styles.profilePic}
              />
              <div style={styles.postDetails}>
                <p style={{ ...styles.username, fontFamily: fonts.Medium }}>
                  {post.username}
                </p>
                <p style={{ ...styles.postText, fontFamily: fonts.Regular }}>
                  {post.content?.substring(0, 60) || post.text?.substring(0, 60)}
                  {(post.content?.length > 60 || post.text?.length > 60) ? '...' : ''}
                </p>
              </div>
            </div>
          )}
        </div>

        {isSubmitting ? (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner} />
            <p style={{ ...styles.loadingText, fontFamily: fonts.Medium }}>
              Submitting report...
            </p>
          </div>
        ) : showCustomInput ? (
          // Custom reason input screen
          <div style={styles.customInputContainer}>
            <label style={{ ...styles.inputLabel, fontFamily: fonts.Medium }}>
              Please provide details:
            </label>
            <textarea
              style={{ ...styles.textInput, fontFamily: fonts.Regular }}
              placeholder="Explain why you're reporting this post..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              autoFocus
              rows={4}
            />
            <div style={styles.buttonContainer}>
              <button 
                style={styles.backButton}
                onClick={() => {
                  setShowCustomInput(false);
                  setSelectedReason(null);
                }}
              >
                <span style={{ ...styles.backButtonText, fontFamily: fonts.Medium }}>
                  Back
                </span>
              </button>
              <button 
                style={styles.submitButton}
                onClick={() => submitReport('Other')}
              >
                <span style={{ ...styles.submitButtonText, fontFamily: fonts.Medium }}>
                  Submit Report
                </span>
              </button>
            </div>
          </div>
        ) : (
          // Reasons list
          <div style={styles.reasonsList}>
            {reportReasons.map((reason) => (
              <button
                key={reason.id}
                style={styles.reasonItem}
                onClick={() => handleReasonSelect(reason)}
              >
                <div style={styles.reasonIcon}>
                  <FlagIcon size={20} color="#64748B" />
                </div>
                <span style={{ ...styles.reasonText, fontFamily: fonts.Medium }}>
                  {reason.text}
                </span>
              </button>
            ))}
          </div>
        )}

        <button
          style={styles.cancelButton}
          onClick={onClose}
        >
          <span style={{ ...styles.cancelButtonText, fontFamily: fonts.Medium }}>
            Cancel
          </span>
        </button>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// Styles converted to JavaScript objects for Next.js
const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
  },
  content: {
    backgroundColor: 'white',
    width: '100%',
    maxWidth: '500px',
    maxHeight: '90%',
    borderTopLeftRadius: '20px',
    borderTopRightRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 -3px 10px rgba(0, 0, 0, 0.1)',
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column',
  },
  handleContainer: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: '12px',
    paddingBottom: '12px',
  },
  handle: {
    width: '40px',
    height: '5px',
    borderRadius: '3px',
    backgroundColor: '#E0E0E0',
  },
  header: {
    padding: '16px',
  },
  title: {
    fontSize: '18px',
    color: '#1F2937',
    marginBottom: '8px',
    margin: 0,
  },
  subtitle: {
    fontSize: '16px',
    color: '#6B7280',
    marginBottom: '16px',
    margin: '0 0 16px 0',
  },
  postPreview: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: '12px',
    marginBottom: '16px',
    backgroundColor: '#F9FAFB',
    borderRadius: '12px',
  },
  profilePic: {
    width: '40px',
    height: '40px',
    borderRadius: '20px',
  },
  postDetails: {
    marginLeft: '12px',
    flex: 1,
  },
  username: {
    fontSize: '16px',
    color: '#1F2937',
    marginBottom: '2px',
    margin: '0 0 2px 0',
  },
  postText: {
    fontSize: '14px',
    color: '#6B7280',
    margin: 0,
  },
  reasonsList: {
    maxHeight: '320px',
    overflowY: 'auto',
  },
  reasonItem: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: '16px',
    paddingBottom: '16px',
    paddingLeft: '24px',
    paddingRight: '24px',
    borderTop: '1px solid #F3F4F6',
    backgroundColor: 'transparent',
    border: 'none',
    width: '100%',
    cursor: 'pointer',
    textAlign: 'left',
  },
  reasonIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '20px',
    backgroundColor: '#F3F4F6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '16px',
  },
  reasonText: {
    fontSize: '16px',
    color: '#1F2937',
  },
  loadingContainer: {
    padding: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid #E5E7EB',
    borderTop: '3px solid #0EA5E9',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    marginTop: '16px',
    fontSize: '16px',
    color: '#6B7280',
    margin: '16px 0 0 0',
  },
  customInputContainer: {
    padding: '16px',
  },
  inputLabel: {
    fontSize: '16px',
    color: '#1F2937',
    marginBottom: '8px',
    display: 'block',
  },
  textInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: '12px',
    padding: '16px',
    minHeight: '100px',
    fontSize: '16px',
    resize: 'vertical',
    width: '100%',
    border: 'none',
    outline: 'none',
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: '16px',
  },
  backButton: {
    backgroundColor: '#E5E7EB',
    borderRadius: '12px',
    paddingTop: '12px',
    paddingBottom: '12px',
    paddingLeft: '20px',
    paddingRight: '20px',
    marginRight: '12px',
    border: 'none',
    cursor: 'pointer',
  },
  backButtonText: {
    color: '#4B5563',
    fontSize: '16px',
  },
  submitButton: {
    backgroundColor: '#0EA5E9',
    borderRadius: '12px',
    paddingTop: '12px',
    paddingBottom: '12px',
    paddingLeft: '20px',
    paddingRight: '20px',
    border: 'none',
    cursor: 'pointer',
  },
  submitButtonText: {
    color: 'white',
    fontSize: '16px',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '8px',
    border: 'none',
    cursor: 'pointer',
    width: '100%',
  },
  cancelButtonText: {
    fontSize: '16px',
    color: '#4B5563',
  },
};

export default ReportModal;