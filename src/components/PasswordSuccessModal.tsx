// src/components/PasswordSuccessModal.tsx - COMPLETE
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/css/PasswordSuccessModal.css';

interface PasswordSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  email?: string;
  autoCloseDelay?: number; // in milliseconds
  redirectTo?: string;
  isPasswordUpdate?: boolean; // NEW: Add this prop
}

const PasswordSuccessModal: React.FC<PasswordSuccessModalProps> = ({
  isOpen,
  onClose,
  email,
  autoCloseDelay = 5000,
  redirectTo = '/login',
  isPasswordUpdate = false // NEW: Default to false
}) => {
  const navigate = useNavigate();

  // Auto-close and redirect functionality
  useEffect(() => {
    if (isOpen && autoCloseDelay > 0) {
      const timer = setTimeout(() => {
        handleRedirect();
      }, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoCloseDelay]);

  const handleRedirect = () => {
    onClose();
    navigate(redirectTo, { 
      replace: true,
      state: { 
        passwordResetSuccess: true,
        email: email 
      } 
    });
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="password-success-modal-overlay">
      <div className="password-success-modal">
        {/* Close Button at Top Right */}
        <button 
          onClick={handleClose}
          className="password-success-modal-close-btn"
          aria-label="Close modal"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M18 6L6 18M6 6L18 18" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </button>
        
        <div className="password-success-modal-header">
          <div className="password-success-icon">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="32" cy="32" r="30" stroke="#F8780F" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <path 
                d="M44 28L29.5 42L22 34.7273" 
                stroke="#F8780F" 
                strokeWidth="3" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className="password-success-modal-title">
            {isPasswordUpdate ? 'Password Updated Successfully!' : 'Password Set Successfully!'}
          </h2>
        </div>
        
        <div className="password-success-modal-body">
          <div className="success-message-container">
            <p className="success-message-main">
              {isPasswordUpdate 
                ? 'Your password has been updated successfully!'
                : 'Your password has been set successfully!'
              }
            </p>
            <p className="success-message-detail">
              {isPasswordUpdate
                ? 'You can now log in to your BIMFlow Suite account with your new password.'
                : 'Your account has been activated and you can now log in to BIMFlow Suite.'
              }
            </p>
            
            {email && (
              <div className="user-email-display">
                <span className="email-label">Account:</span>
                <span className="email-value">{email}</span>
              </div>
            )}
          </div>
          
          <div className="security-notice">
            <div className="security-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path 
                  d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" 
                  stroke="#F8780F" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                <path 
                  d="M9 12L11 14L15 10" 
                  stroke="#F8780F" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="security-text">
              Your password is securely encrypted. For your security, please don't share it with anyone.
            </p>
          </div>
          
          <div className="countdown-notice">
            <div className="countdown-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path 
                  d="M12 8V12L15 15" 
                  stroke="#6c757d" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="12" r="9" stroke="#6c757d" strokeWidth="2"/>
              </svg>
            </div>
            <p className="countdown-text">
              Redirecting to login page in 5 seconds...
            </p>
          </div>
        </div>

        <div className="password-success-modal-actions">
          <button 
            onClick={handleRedirect}
            className="password-success-modal-btn login-btn"
          >
            Go to Login Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordSuccessModal;