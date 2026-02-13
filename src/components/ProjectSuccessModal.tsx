// src/components/ProjectSuccessModal.tsx
import React from "react";
import "../assets/css/ProjectSuccessModal.css";

interface ProjectSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string | React.ReactNode;
  primaryAction: {
    label: string;
    onClick: () => void;
  };
  showUserInfo?: boolean;
  userEmail?: string;
  userName?: string;
  updatedFields?: string[];
  showConfirmation?: boolean;
  confirmationMessage?: string;
  projectId?: number | string;
}

const ProjectSuccessModal: React.FC<ProjectSuccessModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  primaryAction,
  showUserInfo = false,
  userEmail,
  userName,
  updatedFields = [],
  showConfirmation = false,
  confirmationMessage,
  projectId,
}) => {
  if (!isOpen) return null;

  return (
    <div className="project-success-modal-overlay" onClick={onClose}>
      <div className="project-success-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="project-success-modal-close-btn"
          aria-label="Close modal"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Header */}
        <div className="project-success-modal-header">
          <div className="project-success-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 7L9 18L4 13"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className="project-success-modal-title">{title}</h2>
        </div>

        {/* Body */}
        <div className="project-success-modal-body">
          {/* Message */}
          <div className="project-success-message">
            {typeof message === "string" ? <p>{message}</p> : message}
            {projectId && (
              <p
                style={{
                  marginTop: "0.75rem",
                  fontSize: "0.95rem",
                  color: "#666",
                }}
              >
                Project ID: <strong>{projectId}</strong>
              </p>
            )}
          </div>

          {/* User Info Section - Conditional */}
          {showUserInfo && (userName || userEmail) && (
            <div className="project-user-info">
              {userName && (
                <div className="project-info-row">
                  <span className="project-info-label">Name</span>
                  <span className="project-info-value">{userName}</span>
                </div>
              )}
              {userEmail && (
                <div className="project-info-row">
                  <span className="project-info-label">Email</span>
                  <span className="project-info-value">{userEmail}</span>
                </div>
              )}
            </div>
          )}

          {/* Updated Fields Section - Conditional */}
          {updatedFields.length > 0 && (
            <div className="project-updated-fields">
              <div className="project-updated-title">Updated Fields</div>
              <div className="project-updated-grid">
                {updatedFields.map((field, index) => (
                  <span key={index} className="project-updated-chip">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="8" cy="8" r="6" fill="currentColor" />
                    </svg>
                    {field}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Confirmation Note - Conditional */}
          {showConfirmation && confirmationMessage && (
            <div className="project-confirmation-note">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 16V12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 8H12.01"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>{confirmationMessage}</span>
            </div>
          )}
        </div>

        {/* Footer - Only one button (Dashboard / primary action) */}
        <div className="project-success-modal-footer">
          <button
            onClick={primaryAction.onClick}
            className="project-success-modal-btn primary"
          >
            {primaryAction.label}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectSuccessModal;