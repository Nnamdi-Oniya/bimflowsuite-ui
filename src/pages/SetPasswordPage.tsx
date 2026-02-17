// src/pages/SetPasswordPage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "../assets/css/SetPasswordPage.css";
import setPasswordImage from "../assets/images/setPasswordImage.jpg";
import { authService, type SetPasswordResponse } from "../services/authService";
import PasswordSuccessModal from "../components/PasswordSuccessModal";

const SetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
 
  const [formData, setFormData] = useState({
    password: "",
    password_confirm: "",
  });
 
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState<string>("");
  const [uid, setUid] = useState<string>("");
  const [token, setToken] = useState<string>("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isAlreadyActive, setIsAlreadyActive] = useState(false);

  useEffect(() => {
    // Get parameters from URL
    const searchParams = new URLSearchParams(location.search);
    const tokenParam = searchParams.get("token");
    const uidParam = searchParams.get("uid");
    const emailParam = searchParams.get("email");

    // Check if all required parameters exist
    if (!tokenParam || !uidParam || !emailParam) {
      setApiError("Missing required parameters in the activation link.");
      return;
    }

    // Store parameters
    setToken(tokenParam);
    setUid(uidParam);
   
    // Try to decode email for display
    try {
      const decodedEmail = authService.decodeBase64(emailParam);
      setEmail(decodedEmail);
    } catch (error) {
      setEmail("User account"); // Fallback
    }
  }, [location.search]);

  const validatePassword = (password: string): string => {
    if (!password.trim()) {
      return "Password is required.";
    }
    if (password.length < 8) {
      return "Password must be at least 8 characters long.";
    }
    return "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear field-specific error
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
   
    // Clear API error when user starts typing
    if (apiError) {
      setApiError("");
    }

    // Real-time validation
    if (name === "password") {
      const passwordError = validatePassword(value);
      if (passwordError) {
        setErrors({ ...errors, password: passwordError });
      } else if (formData.password_confirm && value !== formData.password_confirm) {
        setErrors({
          ...errors,
          password: "",
          password_confirm: "Passwords do not match."
        });
      } else {
        setErrors({ ...errors, password: "", password_confirm: "" });
      }
    }

    if (name === "password_confirm") {
      if (value !== formData.password) {
        setErrors({ ...errors, password_confirm: "Passwords do not match." });
      } else {
        setErrors({ ...errors, password_confirm: "" });
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const passwordError = validatePassword(formData.password);

    if (passwordError) {
      newErrors.password = passwordError;
    }

    if (!formData.password_confirm.trim()) {
      newErrors.password_confirm = "Please confirm your password.";
    } else if (formData.password !== formData.password_confirm) {
      newErrors.password_confirm = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
   
    if (!validateForm()) return;
    if (isLoading) return;

    setIsLoading(true);
    setApiError("");

    try {
      // Get email parameter from URL
      const searchParams = new URLSearchParams(location.search);
      const emailParam = searchParams.get("email") || "";
     
      const response = await authService.activateAccount({
        email: emailParam,
        uid,
        token,
        password: formData.password,
        password_confirm: formData.password_confirm,
      });

      if (response.success && response.data?.success) {
        // Check if account was already active
        const activationData = response.data as SetPasswordResponse;
        setIsAlreadyActive(activationData.already_active || false);
       
        // Success - show success modal
        setShowSuccessModal(true);
       
        // Clear form
        setFormData({
          password: "",
          password_confirm: "",
        });
      } else {
        // Handle backend validation errors
        const errorMsg = response.data?.message || response.message || "Failed to activate account. Please try again.";
        setApiError(errorMsg);
      }
    } catch (err: any) {
      let message = "An error occurred while activating your account.";
     
      // Parse different error response formats
      if (err.response?.data) {
        const data = err.response.data;
        if (data.message) {
          message = data.message;
        } else if (data.error) {
          message = data.error;
        } else if (data.detail) {
          message = data.detail;
        }
      } else if (err.message) {
        message = err.message;
      }

      setApiError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    // Redirect to login page
    navigate("/login");
  };

  // If missing parameters, show error
  if (apiError && apiError.includes("Missing required parameters")) {
    return (
      <div className="set-password-page">
        <div className="set-password-main">
          <div className="set-password-image-section">
            <img src={setPasswordImage} alt="Set password" className="set-password-image" />
          </div>
          <div className="set-password-content-section">
            <div className="set-password-content-wrapper">
              <div className="set-password-form-card">
                <h2 className="set-password-title">Invalid Activation Link</h2>
                <p className="set-password-subtitle error-text">
                  {apiError}
                </p>
               
                <div className="error-actions">
                  <p className="error-instruction">
                    Please contact support for assistance.
                  </p>
                 
                  <div className="action-buttons">
                    <button
                      onClick={() => navigate("/contact")}
                      className="request-new-btn primary-btn"
                    >
                      Contact Support
                    </button>
                   
                    <button
                      onClick={() => navigate("/login")}
                      className="back-to-login-btn secondary-btn"
                    >
                      ← Back to Login
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="set-password-page">
        <div className="set-password-main">
          <div className="set-password-image-section">
            <img src={setPasswordImage} alt="Set password illustration" className="set-password-image" />
          </div>
          <div className="set-password-content-section">
            <div className="set-password-content-wrapper">
              <div className="set-password-form-card">
                <div className="card-header">
                  <h2 className="set-password-title">
                    {isAlreadyActive ? "Set Your Password" : "Activate Your Account"}
                  </h2>
                  <p className="set-password-subtitle">
                    {isAlreadyActive
                      ? "Create a new password for your BIMFlow Suite account."
                      : "Create a password to activate your BIMFlow Suite account."
                    }
                  </p>
                  <div className="user-info">
                    <span className="user-label">Account:</span>
                    <span className="user-email">{email}</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="set-password-form" noValidate>
                  {apiError && (
                    <div className="api-error-message">
                      <div className="error-icon">⚠️</div>
                      <div className="error-content">
                        <strong>Error:</strong> {apiError}
                      </div>
                    </div>
                  )}

                  <div className="form-group">
                    <label htmlFor="password" className="form-label">
                      New Password *
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`form-input ${errors.password ? "error" : ""}`}
                      placeholder="Enter your new password"
                      autoComplete="new-password"
                      required
                      disabled={isLoading}
                    />
                    {errors.password && (
                      <span className="error-text">
                        {errors.password}
                      </span>
                    )}
                   
                    <div className="password-requirements">
                      <small className="requirements-title">Password requirements:</small>
                      <ul className="requirements-list">
                        <li className={formData.password.length >= 8 ? "valid" : ""}>
                          At least 8 characters long
                        </li>
                        <li className="recommended">
                          (Recommended) Include uppercase, lowercase, and numbers
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="password_confirm" className="form-label">
                      Confirm New Password *
                    </label>
                    <input
                      type="password"
                      id="password_confirm"
                      name="password_confirm"
                      value={formData.password_confirm}
                      onChange={handleChange}
                      className={`form-input ${errors.password_confirm ? "error" : ""}`}
                      placeholder="Confirm your new password"
                      autoComplete="new-password"
                      required
                      disabled={isLoading}
                    />
                    {errors.password_confirm && (
                      <span className="error-text">
                        {errors.password_confirm}
                      </span>
                    )}
                   
                    {formData.password_confirm && formData.password === formData.password_confirm && !errors.password_confirm && (
                      <span className="success-text">
                        ✓ Passwords match
                      </span>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="set-password-btn primary-btn"
                    disabled={isLoading || !formData.password || !formData.password_confirm}
                  >
                    {isLoading ? (
                      <>
                        <div className="loading-spinner"></div>
                        {isAlreadyActive ? "Setting Password..." : "Activating Account..."}
                      </>
                    ) : isAlreadyActive ? (
                      "Set Password"
                    ) : (
                      "Activate Account"
                    )}
                  </button>
                </form>

                <div className="additional-options">
                  <div className="login-prompt">
                    <p>
                      Already have an account?{" "}
                      <Link to="/login" className="login-link">
                        Sign in here
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PasswordSuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        email={email}
        autoCloseDelay={5000}
        redirectTo="/login"
        isPasswordUpdate={isAlreadyActive}
      />
    </>
  );
};

export default SetPasswordPage;