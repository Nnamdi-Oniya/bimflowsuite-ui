// src/components/GetStartedModal.tsx – UPDATED MARCH 2026
import React from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/GetStartedModal.css";

interface GetStartedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GetStartedModal: React.FC<GetStartedModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleCreateProject = () => {
    onClose();
    navigate("/generate-model"); // Project creation wizard
  };

  const handleBookDemo = () => {
    onClose();
    navigate("/book-demo"); // Book a personalized demo
  };

  if (!isOpen) return null;

  return (
    <div className="get-started-modal-overlay" onClick={onClose}>
      <div className="get-started-modal" onClick={(e) => e.stopPropagation()}>
        <div className="get-started-modal-header">
          <h2>Get Started with BIMFlow Suite</h2>
          <button onClick={onClose} className="close-btn" aria-label="Close modal">
            ×
          </button>
        </div>

        <div className="get-started-content">
          <p className="get-started-description">
            Choose how you would like to start your BIM journey with our platform.
          </p>

          <div className="get-started-options">
            {/* Option 1 – Create New Project */}
            <button onClick={handleCreateProject} className="option-btn option-btn--create">
              <div className="option-icon">🏗️</div>
              <div className="option-details">
                <h3>Create New Project</h3>
                <p>
                  Start a new BIM project from scratch. Describe your building, bridge, road, or infrastructure project using simple inputs. 
                  Our system will generate a fully compliant IFC 4.3 model for your project requirements.
                </p>
              </div>
            </button>

            {/* Option 2 – Book a Demo */}
            <button onClick={handleBookDemo} className="option-btn option-btn--upload">
              <div className="option-icon">📅</div>
              <div className="option-details">
                <h3>Book a Personalized Demo</h3>
                <p>
                  Schedule a live demo with our team. See how BIMFlow Suite can transform your BIM workflows with your existing models. 
                  Get a personalized walkthrough of validation, compliance, quantities, costs, and scheduling features.
                </p>
              </div>
            </button>
          </div>

          <div className="modal-footer-note">
            <p>
              <strong>Note:</strong> Both options will guide you through the next steps. New users are recommended to book a demo first to get full platform access.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GetStartedModal;