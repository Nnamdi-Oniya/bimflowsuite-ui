// src/pages/BookDemoPage.tsx
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
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
  
  const [projectParams, setProjectParams] = useState<any>(null);
  const [isFromGenerateModel, setIsFromGenerateModel] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const sectors = bookDemoService.getAvailableSectors();
  const requestTypes = bookDemoService.getRequestTypes();

  useEffect(() => {
    const checkPendingRequest = () => {
      const hasPendingRequest = bookDemoService.hasPendingModelRequest();
      
      if (hasPendingRequest) {
        setIsFromGenerateModel(true);
        
        const storedModelData = bookDemoService.getStoredModelFormData();
        const storedProjectParams = bookDemoService.getStoredProjectParams();
        
        if (storedModelData) {
          setFormData(prev => ({
            ...prev,
            email: storedModelData.contactEmail || prev.email,
            request_type: 'request_demo',
            additional_details: bookDemoService.formatProjectDetails(storedModelData)
          }));
        }
        
        if (storedProjectParams) {
          setProjectParams(storedProjectParams);
        }
      }
      
      if (location.state?.fromGenerateModel) {
        setIsFromGenerateModel(true);
        if (location.state?.projectData) {
          const projectData = location.state.projectData;
          setFormData(prev => ({
            ...prev,
            email: projectData.contactEmail || prev.email,
            request_type: 'request_demo',
            additional_details: bookDemoService.formatProjectDetails(projectData)
          }));
          
          bookDemoService.storeModelFormData(projectData);
        }
      }
    };

    checkPendingRequest();
  }, [location]);

  const validateEmail = (email: string): string => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) return "Email is required.";
    if (!emailRegex.test(email)) return "Please enter a valid email address.";
    return "";
  };

  const validatePhone = (phone: string): string => {
    const phoneRegex = /^[\+]?[1-9][\d\s\-\(\)]{8,}$/;
    if (!phone.trim()) return "Phone number is required.";
    if (!phoneRegex.test(phone)) return "Please enter a valid phone number.";
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
      newErrors.firstname = "First name is required.";
    } else if (formData.firstname.length < 2) {
      newErrors.firstname = "First name must be at least 2 characters.";
    }

    if (!formData.lastname.trim()) {
      newErrors.lastname = "Last name is required.";
    } else if (formData.lastname.length < 2) {
      newErrors.lastname = "Last name must be at least 2 characters.";
    }

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    if (!formData.company_name.trim()) {
      newErrors.company_name = "Company name is required.";
    } else if (formData.company_name.length < 2) {
      newErrors.company_name = "Company name must be at least 2 characters.";
    }

    if (!formData.company_address.trim()) {
      newErrors.company_address = "Company address is required.";
    } else if (formData.company_address.length < 5) {
      newErrors.company_address = "Please enter a valid company address (minimum 5 characters).";
    }

    if (!formData.country.trim()) {
      newErrors.country = "Country is required.";
    } else if (formData.country.length < 2) {
      newErrors.country = "Please enter a valid country name.";
    }

    if (!formData.sector.trim()) {
      newErrors.sector = "Please select your sector.";
    }

    if (!formData.job_title.trim()) {
      newErrors.job_title = "Job title is required.";
    } else if (formData.job_title.length < 2) {
      newErrors.job_title = "Job title must be at least 2 characters.";
    }

    if (!formData.company_position.trim()) {
      newErrors.company_position = "Company position is required.";
    } else if (formData.company_position.length < 2) {
      newErrors.company_position = "Company position must be at least 2 characters.";
    }

    const phoneError = validatePhone(formData.phone_number);
    if (phoneError) newErrors.phone_number = phoneError;

    if (!formData.consent_privacy) {
      newErrors.consent_privacy = "You must agree to the Privacy Policy to proceed.";
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
      let response;
      
      if (isFromGenerateModel && projectParams) {
        response = await bookDemoService.submitModelGenerationRequest(
          {
            firstname: formData.firstname,
            lastname: formData.lastname,
            email: formData.email,
            company_name: formData.company_name,
            company_address: formData.company_address,
            country: formData.country,
            sector: formData.sector,
            job_title: formData.job_title,
            company_position: formData.company_position,
            phone_number: formData.phone_number
          },
          projectParams,
          true
        );
      } else {
        response = await bookDemoService.submitDemoRequest(formData, projectParams);
      }
      
      if (response.success) {
        setShowSuccessModal(true);
        
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
        
        bookDemoService.clearStoredProjectParams();
      } else {
        throw new Error(response.message || "Submission failed");
      }
    } catch (error: any) {
      let errorMessage = "Submission failed. Please try again.";
      
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
          errorMessage = "Please check the form for errors.";
        }
      } else if (error.message?.includes('Failed to fetch')) {
        errorMessage = "Cannot connect to server. Please try again later.";
      } else if (error.message?.includes('timeout')) {
        errorMessage = "Request timed out. Please try again.";
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
                      <strong>Model Generation Request</strong>
                      <p>Complete this demo request to get access to your model generation.</p>
                      <small>Your project details have been pre-filled below.</small>
                    </div>
                  </div>
                )}

                <h2 className="book-demo-title">
                  {isFromGenerateModel ? 'Book Demo & Generate Model' : 'Book a Demo'}
                </h2>
                <p className="book-demo-subtitle">
                  {isFromGenerateModel 
                    ? "Complete your demo request to get access to BIM model generation."
                    : "Schedule a call with our team to explore BIMFlow Suite."}
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
                  {isFromGenerateModel && (
                    <div className="form-group">
                      <div className="request-type-highlight">
                        <span className="request-type-label">Request Type:</span>
                        <span className="request-type-value">Demo with Model Generation</span>
                      </div>
                      <input
                        type="hidden"
                        name="request_type"
                        value="request_demo"
                      />
                    </div>
                  )}

                  {!isFromGenerateModel && (
                    <div className="form-group">
                      <label htmlFor="request_type" className="form-label">
                        Request Type *
                      </label>
                      <select
                        id="request_type"
                        name="request_type"
                        value={formData.request_type}
                        onChange={handleChange}
                        className={`form-input ${errors.request_type ? 'error' : ''}`}
                        disabled={isFormDisabled}
                        required
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
                        First Name *
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
                        required
                      />
                      {errors.firstname && <span className="error-text">{errors.firstname}</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="lastname" className="form-label">
                        Last Name *
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
                        required
                      />
                      {errors.lastname && <span className="error-text">{errors.lastname}</span>}
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="email" className="form-label">
                      Email *
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
                      required
                    />
                    {errors.email && <span className="error-text">{errors.email}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="company_name" className="form-label">
                      Company Name *
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
                      required
                    />
                    {errors.company_name && <span className="error-text">{errors.company_name}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="company_address" className="form-label">
                      Company Address *
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
                      required
                    />
                    {errors.company_address && <span className="error-text">{errors.company_address}</span>}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="country" className="form-label">
                        Country *
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
                        required
                      />
                      {errors.country && <span className="error-text">{errors.country}</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="sector" className="form-label">
                        Sector *
                      </label>
                      <select
                        id="sector"
                        name="sector"
                        value={formData.sector}
                        onChange={handleChange}
                        className={`form-input ${errors.sector ? 'error' : ''}`}
                        disabled={isFormDisabled}
                        required
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
                        Job Title *
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
                        required
                      />
                      {errors.job_title && <span className="error-text">{errors.job_title}</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="company_position" className="form-label">
                        Company Position *
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
                        required
                      />
                      {errors.company_position && <span className="error-text">{errors.company_position}</span>}
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone_number" className="form-label">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone_number"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleChange}
                      className={`form-input ${errors.phone_number ? 'error' : ''}`}
                      placeholder="+1 123 456 7890 or 0123 456 789"
                      disabled={isFormDisabled}
                      required
                    />
                    <small className="form-note">Enter your phone number with country code</small>
                    {errors.phone_number && <span className="error-text">{errors.phone_number}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="additional_details" className="form-label">
                      Additional Details {isFromGenerateModel && '(Project Details Pre-filled)'}
                    </label>
                    <textarea
                      id="additional_details"
                      name="additional_details"
                      value={formData.additional_details || ""}
                      onChange={handleChange}
                      className="form-input"
                      rows={6}
                      placeholder={isFromGenerateModel 
                        ? "Project details have been pre-filled. Add any additional comments or requirements here..."
                        : "Tell us more about your needs, specific requirements, or questions..."
                      }
                      disabled={isFormDisabled}
                    />
                    {isFromGenerateModel && (
                      <small className="form-note">
                        Your project specifications have been included. You can add more details if needed.
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
                        required
                      />
                      <span>
                        I agree to the <Link to="/privacy-policy" className="privacy-link">Privacy Policy</Link>.
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
                        I agree to receive marketing communications from BIMFlow Suite.
                      </span>
                    </label>

                    <p className="consent-disclaimer">
                      By submitting this form, you acknowledge that you have read and agree to our 
                      <Link to="/terms" className="privacy-link"> Terms of Service</Link> and 
                      <Link to="/privacy-policy" className="privacy-link"> Privacy Policy</Link>.
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
                    ) : isFromGenerateModel ? (
                      'Submit Demo & Model Request'
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
        onClose={() => setShowSuccessModal(false)}
        title={isFromGenerateModel 
          ? "Demo & Model Request Submitted!" 
          : "Demo Request Submitted Successfully!"
        }
        message={isFromGenerateModel
          ? "Thank you for your interest in BIMFlow Suite. Our team will review your model generation request and contact you within 24 hours to schedule your personalized demo and discuss your project."
          : "Thank you for your interest in BIMFlow Suite. Our team will contact you within 24 hours to schedule your personalized demo."
        }
      />
    </>
  );
};

export default BookDemoPage;