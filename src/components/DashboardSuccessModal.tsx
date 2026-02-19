// src/components/DashboardSuccessModal.tsx
import React, { useEffect } from 'react';
import '../assets/css/DashboardSuccessModal.css';

interface DashboardSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string | React.ReactNode; // Can be string or JSX
  userName?: string;
  userEmail?: string;
  projectId?: number | string;
  projectNumber?: string;
  numberOfModels?: number;
  updatedFields?: string[];
  showConfirmation?: boolean;
  confirmationMessage?: string;
  autoClose?: boolean;
  autoCloseDelay?: number;
  showSecondaryButton?: boolean;
  secondaryButtonText?: string;
  onSecondaryAction?: () => void;
  primaryButtonText?: string;
  showProjectDetails?: boolean;
}

const DashboardSuccessModal: React.FC<DashboardSuccessModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  userName,
  userEmail,
  projectId,
  projectNumber,
  numberOfModels,
  updatedFields = [],
  showConfirmation = true,
  confirmationMessage = "Your changes have been saved successfully",
  autoClose = true,
  autoCloseDelay = 3000,
  showSecondaryButton = false,
  secondaryButtonText = "Continue Editing",
  onSecondaryAction,
  primaryButtonText = "Done",
  showProjectDetails = false,
}) => {
  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }
    
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Format field names for display
  const formatFieldName = (field: string): string => {
    return field
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="dashboard-success-modal-overlay" onClick={onClose}>
      <div 
        className="dashboard-success-modal" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="success-modal-title"
      >
        
        {/* Close Button */}
        <button 
          className="dashboard-success-modal-close-btn" 
          onClick={onClose} 
          aria-label="Close modal"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Header with Icon */}
        <div className="dashboard-success-modal-header">
          <div className="dashboard-success-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" fill="none"/>
              <path d="M8 12L11 15L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 id="success-modal-title" className="dashboard-success-modal-title">{title}</h2>
        </div>

        {/* Body */}
        <div className="dashboard-success-modal-body">
          {/* Message - Can be string or JSX */}
          <div className="dashboard-success-message">
            {typeof message === "string" ? <p>{message}</p> : message}
          </div>
          
          {/* Project Details - Show when project info exists */}
          {showProjectDetails && (projectId || projectNumber || numberOfModels) && (
            <div className="dashboard-user-info"> {/* Reusing existing user-info class */}
              {projectId && (
                <div className="dashboard-info-row">
                  <span className="dashboard-info-label">Project ID:</span>
                  <span className="dashboard-info-value">{projectId}</span>
                </div>
              )}
              {projectNumber && (
                <div className="dashboard-info-row">
                  <span className="dashboard-info-label">Project Number:</span>
                  <span className="dashboard-info-value" style={{ color: 'var(--orange, #F8780F)', fontWeight: 700 }}>
                    {projectNumber}
                  </span>
                </div>
              )}
              {numberOfModels && (
                <div className="dashboard-info-row">
                  <span className="dashboard-info-label">Models to Generate:</span>
                  <span className="dashboard-info-value">
                    {numberOfModels} {numberOfModels === 1 ? 'Model' : 'Models'}
                  </span>
                </div>
              )}
            </div>
          )}
          
          {/* User Info - Show if userName or userEmail exists */}
          {(userName || userEmail) && !showProjectDetails && (
            <div className="dashboard-user-info">
              {userName && (
                <div className="dashboard-info-row">
                  <span className="dashboard-info-label">User</span>
                  <span className="dashboard-info-value">{userName}</span>
                </div>
              )}
              {userEmail && (
                <div className="dashboard-info-row">
                  <span className="dashboard-info-label">Email</span>
                  <span className="dashboard-info-value">{userEmail}</span>
                </div>
              )}
            </div>
          )}

          {/* Updated Fields - Only show if there are updated fields */}
          {updatedFields.length > 0 && (
            <div className="dashboard-updated-fields">
              <h4 className="dashboard-updated-title">Updated Information:</h4>
              <div className="dashboard-updated-grid">
                {updatedFields.map((field, index) => (
                  <div key={index} className="dashboard-updated-chip">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>{formatFieldName(field)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Confirmation Note - Optional */}
          {showConfirmation && (
            <div className="dashboard-confirmation-note">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="8" r="1" fill="currentColor"/>
              </svg>
              <span>{confirmationMessage}</span>
            </div>
          )}
        </div>

        {/* Footer Buttons - Flexible based on props */}
        <div className="dashboard-success-modal-footer">
          <button className="dashboard-success-modal-btn" onClick={onClose}>
            {primaryButtonText}
          </button>
          {showSecondaryButton && (
            <button 
              className="dashboard-success-modal-btn-secondary" 
              onClick={onSecondaryAction || onClose}
            >
              {secondaryButtonText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardSuccessModal;