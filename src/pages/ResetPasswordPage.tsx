// src/pages/ResetPasswordPage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "../assets/css/ResetPasswordPage.css";
import setPasswordImage from "../assets/images/ResetPasswordImage.jpg";
import { authService } from "../services/authService";
import PasswordSuccessModal from "../components/PasswordSuccessModal";

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    password: "",
    password_confirm: "",
  });

  const [showPassword, setShowPassword] = useState({
    password: false,
    password_confirm: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string>("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tokenParam = searchParams.get("token");

    if (!tokenParam) {
      setApiError("Missing required token in the reset link.");
      return;
    }

    setToken(tokenParam);
  }, [location.search]);

  const validatePassword = (password: string): string => {
    if (!password.trim()) return "Password is required.";
    if (password.length < 8) return "Password must be at least 8 characters long.";
    return "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (apiError) setApiError("");

    if (name === "password") {
      const passwordError = validatePassword(value);
      if (passwordError) {
        setErrors((prev) => ({ ...prev, password: passwordError }));
      } else if (formData.password_confirm && value !== formData.password_confirm) {
        setErrors((prev) => ({
          ...prev,
          password: "",
          password_confirm: "Passwords do not match.",
        }));
      } else {
        setErrors((prev) => ({ ...prev, password: "", password_confirm: "" }));
      }
    }

    if (name === "password_confirm") {
      if (value !== formData.password) {
        setErrors((prev) => ({ ...prev, password_confirm: "Passwords do not match." }));
      } else {
        setErrors((prev) => ({ ...prev, password_confirm: "" }));
      }
    }
  };

  const togglePasswordVisibility = (field: 'password' | 'password_confirm') => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;

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
      const response = await authService.confirmPasswordReset({
        token,
        new_password: formData.password,
        confirm_new_password: formData.password_confirm,
      });

      if (response.success) {
        setShowSuccessModal(true);
        setFormData({ password: "", password_confirm: "" });
      } else {
        const errorMsg = response.message || "Failed to reset password. Please try again.";
        setApiError(errorMsg);
      }
    } catch (err: any) {
      console.error("Reset password error:", err);

      let message = "An error occurred while resetting your password.";

      if (err.response?.data) {
        const data = err.response.data;
        message = data.message || data.error || data.detail || message;
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
    navigate("/login");
  };

  // Invalid link state
  if (apiError && apiError.includes("Missing required token")) {
    return (
      <div className="reset-password-page">
        <div className="reset-password-main">
          <div className="reset-password-image-section">
            <img src={setPasswordImage} alt="Reset password" className="reset-password-image" />
          </div>
          <div className="reset-password-content-section">
            <div className="reset-password-content-wrapper">
              <div className="reset-password-form-card">
                <h2 className="reset-password-title">Invalid Reset Link</h2>
                <p className="reset-password-subtitle error-text">{apiError}</p>

                <div className="error-actions">
                  <p className="error-instruction">Please request a new password reset link.</p>

                  <div className="action-buttons">
                    <button
                      onClick={() => navigate("/forgot-password")}
                      className="request-new-btn primary-btn"
                    >
                      Request New Link
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
      <div className="reset-password-page">
        <div className="reset-password-main">
          <div className="reset-password-image-section">
            <img
              src={setPasswordImage}
              alt="Reset password illustration"
              className="reset-password-image"
            />
          </div>

          <div className="reset-password-content-section">
            <div className="reset-password-content-wrapper">
              <div className="reset-password-form-card">
                <div className="card-header">
                  <h2 className="reset-password-title">Reset Your Password</h2>
                  <p className="reset-password-subtitle">
                    Create a new password for your BIMFlow Suite account.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="reset-password-form" noValidate>
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
                    <div className="password-wrapper">
                      <input
                        type={showPassword.password ? "text" : "password"}
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
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => togglePasswordVisibility('password')}
                        aria-label={showPassword.password ? "Hide password" : "Show password"}
                        disabled={isLoading}
                      >
                        {showPassword.password ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="password-toggle-icon"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                            />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="password-toggle-icon"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                    {errors.password && <span className="error-text">{errors.password}</span>}

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
                    <div className="password-wrapper">
                      <input
                        type={showPassword.password_confirm ? "text" : "password"}
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
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => togglePasswordVisibility('password_confirm')}
                        aria-label={showPassword.password_confirm ? "Hide password" : "Show password"}
                        disabled={isLoading}
                      >
                        {showPassword.password_confirm ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="password-toggle-icon"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                            />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="password-toggle-icon"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                    {errors.password_confirm && (
                      <span className="error-text">{errors.password_confirm}</span>
                    )}

                    {formData.password_confirm &&
                      formData.password === formData.password_confirm &&
                      !errors.password_confirm && (
                        <span className="success-text">✓ Passwords match</span>
                      )}
                  </div>

                  <button
                    type="submit"
                    className="reset-password-btn primary-btn"
                    disabled={isLoading || !formData.password || !formData.password_confirm}
                  >
                    {isLoading ? (
                      <>
                        <div className="loading-spinner"></div>
                        Resetting Password...
                      </>
                    ) : (
                      "Reset Password"
                    )}
                  </button>
                </form>

                <div className="additional-options">
                  <div className="login-prompt">
                    <p>
                      Remember your password?{" "}
                      <Link to="/login" className="login-link">
                        Sign in here
                      </Link>
                    </p>
                  </div>

                  <div className="security-note">
                    <p className="note-text">
                      🔒 Your password will be securely encrypted. For security reasons, this
                      link will expire after use.
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
        autoCloseDelay={5000}
        redirectTo="/login"
        isPasswordUpdate={true}
      />
    </>
  );
};

export default ResetPasswordPage;