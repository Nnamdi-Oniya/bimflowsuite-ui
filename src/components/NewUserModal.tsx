// src/components/NewUserModal.tsx - CORRECTED VERSION
import React from "react";
import "../assets/css/GetStartedModal.css";

interface NewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string | null;
  hasExistingAccount?: boolean;
  onLogin: () => void;
  onBookDemo: () => void;
}

const NewUserModal: React.FC<NewUserModalProps> = ({ 
  isOpen, 
  onClose, 
  userEmail,
  hasExistingAccount = false,
  onLogin,
  onBookDemo
}) => {
  if (!isOpen) return null;

  return (
    <div className="get-started-modal-overlay" onClick={onClose}>
      <div className="get-started-modal" onClick={(e) => e.stopPropagation()}>
        <div className="get-started-modal-header">
          <h2>Account Required</h2>
          <button onClick={onClose} className="close-btn" aria-label="Close modal">
            ×
          </button>
        </div>

        <div className="get-started-content">
          {hasExistingAccount ? (
            <div className="email-notice" style={{
              background: '#fff3e8',
              border: '1px solid var(--orange)',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <span style={{ fontSize: '1.5rem' }}>📧</span>
              <p style={{ margin: 0, color: 'var(--brown-dark)' }}>
                {userEmail ? (
                  <>We found an existing account for <strong>{userEmail}</strong>. Please login to continue.</>
                ) : (
                  <>You already have an account. Please login to continue.</>
                )}
              </p>
            </div>
          ) : (
            <div className="email-notice" style={{
              background: '#e8f4ff',
              border: '1px solid #007bff',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <span style={{ fontSize: '1.5rem' }}>👋</span>
              <p style={{ margin: 0, color: 'var(--brown-dark)' }}>
                Welcome to BIMFlow Suite! To generate models, you need an account.
              </p>
            </div>
          )}

          <div className="get-started-options">
            {hasExistingAccount ? (
              // If user has existing account, show Login as primary option
              <button onClick={onLogin} className="option-btn option-btn--create">
                <div className="option-icon">🔐</div>
                <div className="option-details">
                  <h3>Login to Continue</h3>
                  <p>
                    Access your existing account to submit your model generation request 
                    and use all BIMFlow Suite features.
                  </p>
                </div>
              </button>
            ) : (
              // If new user, show Book Demo as primary option
              <button onClick={onBookDemo} className="option-btn option-btn--upload">
                <div className="option-icon">📅</div>
                <div className="option-details">
                  <h3>Book a Demo</h3>
                  <p>
                    Experience BIMFlow Suite in action. Book a personalized demo 
                    to get access to model generation and all platform features.
                  </p>
                </div>
              </button>
            )}
            
            {/* Secondary option for both cases */}
            <button 
              onClick={hasExistingAccount ? onBookDemo : onLogin} 
              className="option-btn option-btn--secondary"
            >
              <div className="option-icon">{hasExistingAccount ? '📅' : '🔐'}</div>
              <div className="option-details">
                <h3>{hasExistingAccount ? 'Book a New Demo' : 'Already Have an Account?'}</h3>
                <p>
                  {hasExistingAccount 
                    ? 'Need additional access? Book another demo for your team or explore new features.'
                    : 'If you have an account, login to submit your model generation request.'}
                </p>
              </div>
            </button>
          </div>

          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-light)' }}>
              <strong>Note:</strong> Your project details have been saved. 
              {hasExistingAccount 
                ? " After logging in, you can submit your model generation request." 
                : " After booking a demo, you'll get access to submit your model generation request."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewUserModal;