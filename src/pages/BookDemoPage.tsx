// src/pages/BookDemoPage.tsx
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../assets/css/BookDemoPage.css";
import registerImage from "../assets/images/registerImage.jpg";
import { bookDemoService } from "../services/bookDemoService";
import SuccessModal from "../components/SuccessModal";

interface BookDemoRequest {
  request_type: 'request_demo' | 'compliance_validation' | 'request_a_trial' | 'general_inquiry' | 'others';
  firstname: string;
  lastname: string;
  email: string;
  company_name: string;
  company_address: string;
  country: string;
  sector: string;
  job_title: string;
  company_position: string;
  phone_number: string;
  additional_details?: string;
  consent_marketing: boolean;
  consent_privacy: boolean;
}

const BookDemoPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<BookDemoRequest>({
    request_type: "request_demo",
    firstname: "",
    lastname: "",
    email: "",
    company_name: "",
    company_address: "",
    country: "",
    sector: "",
    job_title: "",
    company_position: "",
    phone_number: "",
    additional_details: "",
    consent_marketing: false,
    consent_privacy: false
  });
  
  const [storedProjectData, setStoredProjectData] = useState<any>(null);
  const [isFromGenerateModel, setIsFromGenerateModel] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const sectors = bookDemoService.getAvailableSectors();
  const requestTypes = bookDemoService.getRequestTypes();

  useEffect(() => {
    // Check if coming from project generate page
    const projectData = bookDemoService.getStoredProjectFormData();
    
    if (projectData) {
      setIsFromGenerateModel(true);
      setStoredProjectData(projectData);
      
      // Format project details for additional_details field
      const projectDetails = `
PROJECT DETAILS:
----------------
Project Name: ${projectData.name || 'Not specified'}
Project Type: ${projectData.project_type || 'Not specified'}
Description: ${projectData.description || 'Not specified'}
Phase: ${projectData.phase || 'concept'}
Client: ${projectData.client_name || 'Not specified'}
Client Type: ${projectData.client_type || 'private'}
Project Scale: ${projectData.project_scale || 'medium'}
Risk Classification: ${projectData.risk_classification || 'medium'}
Address: ${projectData.project_address || 'Not specified'}
      `.trim();
      
      setFormData(prev => ({
        ...prev,
        additional_details: projectDetails
      }));
    } else if (location.state?.fromGenerate) {
      setIsFromGenerateModel(true);
      if (location.state?.projectData) {
        const projectData = location.state.projectData;
        setStoredProjectData(projectData);
        
        const projectDetails = `
PROJECT DETAILS:
----------------
Project Name: ${projectData.name || 'Not specified'}
Project Type: ${projectData.project_type || 'Not specified'}
Description: ${projectData.description || 'Not specified'}
Phase: ${projectData.phase || 'concept'}
Client: ${projectData.client_name || 'Not specified'}
Client Type: ${projectData.client_type || 'private'}
Project Scale: ${projectData.project_scale || 'medium'}
Risk Classification: ${projectData.risk_classification || 'medium'}
Address: ${projectData.project_address || 'Not specified'}
        `.trim();
        
        setFormData(prev => ({
          ...prev,
          additional_details: projectDetails
        }));
        
        bookDemoService.storeProjectFormData(projectData);
      }
    }
  }, [location]);

  const validateEmail = (email: string): string => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) return "Email is required";
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };

  const validatePhone = (phone: string): string => {
    const phoneRegex = /^[\+]?[1-9][\d\s\-\(\)]{8,}$/;
    if (!phone.trim()) return "Phone number is required";
    if (!phoneRegex.test(phone)) return "Please enter a valid phone number";
    return "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstname.trim()) {
      newErrors.firstname = "First name is required";
    } else if (formData.firstname.length < 2) {
      newErrors.firstname = "First name must be at least 2 characters";
    }

    if (!formData.lastname.trim()) {
      newErrors.lastname = "Last name is required";
    } else if (formData.lastname.length < 2) {
      newErrors.lastname = "Last name must be at least 2 characters";
    }

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    if (!formData.company_name.trim()) {
      newErrors.company_name = "Company name is required";
    } else if (formData.company_name.length < 2) {
      newErrors.company_name = "Company name must be at least 2 characters";
    }

    if (!formData.company_address.trim()) {
      newErrors.company_address = "Company address is required";
    } else if (formData.company_address.length < 5) {
      newErrors.company_address = "Please enter a valid company address (minimum 5 characters)";
    }

    if (!formData.country.trim()) {
      newErrors.country = "Country is required";
    } else if (formData.country.length < 2) {
      newErrors.country = "Please enter a valid country name";
    }

    if (!formData.sector.trim()) {
      newErrors.sector = "Please select your sector";
    }

    if (!formData.job_title.trim()) {
      newErrors.job_title = "Job title is required";
    } else if (formData.job_title.length < 2) {
      newErrors.job_title = "Job title must be at least 2 characters";
    }

    if (!formData.company_position.trim()) {
      newErrors.company_position = "Company position is required";
    } else if (formData.company_position.length < 2) {
      newErrors.company_position = "Company position must be at least 2 characters";
    }

    const phoneError = validatePhone(formData.phone_number);
    if (phoneError) newErrors.phone_number = phoneError;

    if (!formData.consent_privacy) {
      newErrors.consent_privacy = "You must agree to the Privacy Policy to proceed";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (isLoading) return;

    setIsLoading(true);

    try {
      // Prepare project params if from generate model
      let projectParams = null;
      if (isFromGenerateModel && storedProjectData) {
        projectParams = {
          project_details: storedProjectData,
          source: "project_generate"
        };
      }
      
      const response = await bookDemoService.submitDemoRequest(formData, projectParams);
      
      if (response.success) {
        setShowSuccessModal(true);
        
        // Clear stored data
        bookDemoService.clearStoredProjectFormData();
        
        // Reset form
        setFormData({
          request_type: "request_demo",
          firstname: "",
          lastname: "",
          email: "",
          company_name: "",
          company_address: "",
          country: "",
          sector: "",
          job_title: "",
          company_position: "",
          phone_number: "",
          additional_details: "",
          consent_marketing: false,
          consent_privacy: false
        });
        setErrors({});
      } else {
        throw new Error(response.message || "Submission failed");
      }
    } catch (error: any) {
      let errorMessage = "Submission failed. Please try again";
      
      if (error.data && typeof error.data === 'object') {
        const newErrors: Record<string, string> = {};
        Object.entries(error.data).forEach(([field, value]) => {
          if (Array.isArray(value)) {
            newErrors[field] = value.join(', ');
          } else if (typeof value === 'string') {
            newErrors[field] = value;
          }
        });
        setErrors({ ...errors, ...newErrors });
        if (Object.keys(newErrors).length > 0) {
          errorMessage = "Please check the form for errors";
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrors({ ...errors, submit: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormDisabled = isLoading;

  return (
    <>
      <div className="book-demo-page">
        <div className="book-demo-main">
          <div className="book-demo-image-section">
            <img src={registerImage} alt="Demo illustration" className="book-demo-image" />
          </div>

          <div className="book-demo-content-section">
            <div className="book-demo-content-wrapper">
              <div className="book-demo-form-card">
                {isFromGenerateModel && (
                  <div className="model-request-banner">
                    <div className="model-request-icon">🚀</div>
                    <div className="model-request-content">
                      <strong>Complete Your Demo Request</strong>
                      <p>Your project details have been saved. Complete this form to schedule your demo.</p>
                    </div>
                  </div>
                )}

                <h2 className="book-demo-title">
                  {isFromGenerateModel ? 'Complete Your Demo Request' : 'Book a Demo'}
                </h2>
                <p className="book-demo-subtitle">
                  {isFromGenerateModel 
                    ? "Fill in your contact details to schedule a demo and start your BIM project"
                    : "Schedule a call with our team to explore BIMFlow Suite"}
                </p>
                
                <div className="login-prompt-top">
                  <p>
                    Already have an account?{" "}
                    <Link to="/login" className="login-link">Sign in here</Link>
                  </p>
                </div>

                {errors.submit && (
                  <div className="form-error-banner">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path 
                        d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0377 2.66667 10.2679 4L3.33975 16C2.56995 17.3333 3.5322 19 5.07183 19Z" 
                        stroke="#EF4444" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>{errors.submit}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="book-demo-form" noValidate>
                  {!isFromGenerateModel && (
                    <div className="form-group">
                      <label htmlFor="request_type" className="form-label">
                        Request Type
                      </label>
                      <select
                        id="request_type"
                        name="request_type"
                        value={formData.request_type}
                        onChange={handleChange}
                        className={`form-input ${errors.request_type ? 'error' : ''}`}
                        disabled={isFormDisabled}
                      >
                        {requestTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                      {errors.request_type && <span className="error-text">{errors.request_type}</span>}
                    </div>
                  )}

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="firstname" className="form-label">
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstname"
                        name="firstname"
                        value={formData.firstname}
                        onChange={handleChange}
                        className={`form-input ${errors.firstname ? 'error' : ''}`}
                        placeholder="John"
                        disabled={isFormDisabled}
                      />
                      {errors.firstname && <span className="error-text">{errors.firstname}</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="lastname" className="form-label">
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastname"
                        name="lastname"
                        value={formData.lastname}
                        onChange={handleChange}
                        className={`form-input ${errors.lastname ? 'error' : ''}`}
                        placeholder="Doe"
                        disabled={isFormDisabled}
                      />
                      {errors.lastname && <span className="error-text">{errors.lastname}</span>}
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="email" className="form-label">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`form-input ${errors.email ? 'error' : ''}`}
                      placeholder="john@company.com"
                      disabled={isFormDisabled}
                    />
                    {errors.email && <span className="error-text">{errors.email}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="company_name" className="form-label">
                      Company Name
                    </label>
                    <input
                      type="text"
                      id="company_name"
                      name="company_name"
                      value={formData.company_name}
                      onChange={handleChange}
                      className={`form-input ${errors.company_name ? 'error' : ''}`}
                      placeholder="Your Company Ltd."
                      disabled={isFormDisabled}
                    />
                    {errors.company_name && <span className="error-text">{errors.company_name}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="company_address" className="form-label">
                      Company Address
                    </label>
                    <input
                      type="text"
                      id="company_address"
                      name="company_address"
                      value={formData.company_address}
                      onChange={handleChange}
                      className={`form-input ${errors.company_address ? 'error' : ''}`}
                      placeholder="123 Main Street, City, State, ZIP"
                      disabled={isFormDisabled}
                    />
                    {errors.company_address && <span className="error-text">{errors.company_address}</span>}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="country" className="form-label">
                        Country
                      </label>
                      <input
                        type="text"
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className={`form-input ${errors.country ? 'error' : ''}`}
                        placeholder="United States"
                        disabled={isFormDisabled}
                      />
                      {errors.country && <span className="error-text">{errors.country}</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="sector" className="form-label">
                        Sector
                      </label>
                      <select
                        id="sector"
                        name="sector"
                        value={formData.sector}
                        onChange={handleChange}
                        className={`form-input ${errors.sector ? 'error' : ''}`}
                        disabled={isFormDisabled}
                      >
                        <option value="">Select your sector</option>
                        {sectors.map(sector => (
                          <option key={sector.value} value={sector.value}>
                            {sector.label}
                          </option>
                        ))}
                      </select>
                      {errors.sector && <span className="error-text">{errors.sector}</span>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="job_title" className="form-label">
                        Job Title
                      </label>
                      <input
                        type="text"
                        id="job_title"
                        name="job_title"
                        value={formData.job_title}
                        onChange={handleChange}
                        className={`form-input ${errors.job_title ? 'error' : ''}`}
                        placeholder="BIM Manager"
                        disabled={isFormDisabled}
                      />
                      {errors.job_title && <span className="error-text">{errors.job_title}</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="company_position" className="form-label">
                        Company Position
                      </label>
                      <input
                        type="text"
                        id="company_position"
                        name="company_position"
                        value={formData.company_position}
                        onChange={handleChange}
                        className={`form-input ${errors.company_position ? 'error' : ''}`}
                        placeholder="e.g., Director, Manager, Engineer"
                        disabled={isFormDisabled}
                      />
                      {errors.company_position && <span className="error-text">{errors.company_position}</span>}
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone_number" className="form-label">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone_number"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleChange}
                      className={`form-input ${errors.phone_number ? 'error' : ''}`}
                      placeholder="+1 123 456 7890"
                      disabled={isFormDisabled}
                    />
                    <small className="form-note">Include country code for international numbers</small>
                    {errors.phone_number && <span className="error-text">{errors.phone_number}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="additional_details" className="form-label">
                      Additional Details
                    </label>
                    <textarea
                      id="additional_details"
                      name="additional_details"
                      value={formData.additional_details || ""}
                      onChange={handleChange}
                      className="form-input"
                      rows={6}
                      placeholder={isFromGenerateModel 
                        ? "Your project details have been pre-filled. Add any additional comments here..."
                        : "Tell us more about your needs, specific requirements, or questions..."
                      }
                      disabled={isFormDisabled}
                    />
                    {isFromGenerateModel && (
                      <small className="form-note">
                        Your project details have been automatically included
                      </small>
                    )}
                  </div>

                  <div className="consent-group">
                    <label className="consent-label">
                      <input
                        type="checkbox"
                        name="consent_privacy"
                        checked={formData.consent_privacy}
                        onChange={handleChange}
                        disabled={isFormDisabled}
                      />
                      <span>
                        I agree to the <Link to="/privacy-policy" className="privacy-link">Privacy Policy</Link>
                      </span>
                    </label>
                    {errors.consent_privacy && <span className="error-text">{errors.consent_privacy}</span>}

                    <label className="consent-label">
                      <input
                        type="checkbox"
                        name="consent_marketing"
                        checked={formData.consent_marketing}
                        onChange={handleChange}
                        disabled={isFormDisabled}
                      />
                      <span>
                        I agree to receive marketing communications from BIMFlow Suite
                      </span>
                    </label>

                    <p className="consent-disclaimer">
                      By submitting this form, you acknowledge that you have read and agree to our 
                      <Link to="/terms" className="privacy-link"> Terms of Service</Link> and 
                      <Link to="/privacy-policy" className="privacy-link"> Privacy Policy</Link>
                    </p>
                  </div>

                  <button 
                    type="submit" 
                    className="book-demo-btn"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="loading-spinner"></div>
                        Processing...
                      </>
                    ) : (
                      'Submit Request'
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          if (isFromGenerateModel) {
            navigate("/");
          }
        }}
        title="Request Submitted Successfully!"
        message={isFromGenerateModel
          ? "Thank you for your interest in BIMFlow Suite. Our team will contact you within 24 hours to schedule your personalized demo and discuss your project requirements."
          : "Thank you for your interest in BIMFlow Suite. Our team will contact you within 24 hours to schedule your personalized demo."
        }
      />
    </>
  );
};

export default BookDemoPage;