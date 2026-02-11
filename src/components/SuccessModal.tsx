// src/components/SuccessModal.tsx - UPDATED
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/css/SuccessModal.css';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  title = "Thank You for Your Request!",
  message = "Our team will contact you shortly to schedule your demo."
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleClose = () => {
    onClose();
    navigate('/'); // Redirect to home page
  };

  return (
    <div className="success-modal-overlay">
      <div className="success-modal">
        {/* Close Button at Top Right */}
        <button 
          onClick={handleClose}
          className="success-modal-close-btn"
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
        
        <div className="success-modal-header">
          <div className="success-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                stroke="#F8780F" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className="success-modal-title">{title}</h2>
        </div>
        
        <div className="success-modal-body">
          <p className="success-message">{message}</p>
          
          <div className="confirmation-note">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM10 18C5.59 18 2 14.41 2 10C2 5.59 5.59 2 10 2C14.41 2 18 5.59 18 10C18 14.41 14.41 18 10 18ZM9 14L15 8L13.59 6.59L9 11.17L6.41 8.59L5 10L9 14Z" 
                fill="#F8780F"
              />
            </svg>
            <span>You will receive a confirmation email shortly.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;