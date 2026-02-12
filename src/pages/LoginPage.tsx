// src/pages/LoginPage.tsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../assets/css/LoginPage.css";
import loginImage from "../assets/images/loginImage2.jpg";
import { authService } from "../services/authService";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get redirect path from state
  const from = (location.state as any)?.from || "/dashboard";
  const successMessage = (location.state as any)?.message;

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string>("");
  const [successMessageState, setSuccessMessageState] = useState<string>(successMessage || "");
  const [isLoading, setIsLoading] = useState(false);

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessageState) {
      const timer = setTimeout(() => {
        setSuccessMessageState("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessageState]);

  // Check if already authenticated
  useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate(from, { replace: true });
    }
  }, [navigate, from]);

  // Listen for auth state changes
  useEffect(() => {
    const handleAuthChange = (event: CustomEvent) => {
      if (event.detail.isAuthenticated) {
        navigate(from, { replace: true });
      }
    };

    window.addEventListener('auth-state-changed', handleAuthChange as EventListener);
    
    return () => {
      window.removeEventListener('auth-state-changed', handleAuthChange as EventListener);
    };
  }, [navigate, from]);

  const validateIdentifier = (identifier: string): string => {
    if (!identifier.trim()) {
      return "Email or username is required.";
    }
    return "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear field-specific error
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    
    // Clear API error when user starts typing
    if (apiError) {
      setApiError("");
    }

    if (name === "identifier" && value.trim()) {
      const identifierError = validateIdentifier(value);
      setErrors((prev) => ({ ...prev, identifier: identifierError }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.identifier.trim()) {
      newErrors.identifier = "Email or username is required.";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setApiError("");
    setSuccessMessageState("");
    
    if (!validateForm()) return;
    if (isLoading) return;

    setIsLoading(true);

    try {
      const credentials = {
        username_or_email: formData.identifier.trim(),
        password: formData.password,
      };

      const response = await authService.login(credentials);

      if (response.success && response.data) {
        // Don't navigate here - let the auth-state-changed event handle it
        // This ensures consistency across the app
      } else {
        if (response.message) {
          setApiError(response.message);
        } else {
          setApiError("Login failed. Please check your credentials.");
        }
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      
      let message = "An error occurred. Please try again later.";

      if (err.message) {
        message = err.message;
      }

      if (err.status === 401) {
        message = "Invalid email/username or password.";
      } else if (err.status === 400) {
        message = "Please check your input and try again.";
      } else if (err.status === 0 || err.code === "NETWORK_ERROR") {
        message = "Cannot connect to the server. Please check your internet connection.";
      } else if (err.status === 404) {
        message = "Login service not available. Please try again later.";
      }

      setApiError(message);
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-main">
        <div className="login-image-section">
          <img src={loginImage} alt="Secure login illustration" className="login-image" />
        </div>

        <div className="login-content-section">
          <div className="login-content-wrapper">
            <div className="login-form-card">
              <h2 className="login-title">Welcome Back</h2>
              <p className="login-subtitle">
                Sign in to your BIMFlow Suite account to access your projects and tools.
              </p>

              {successMessageState && (
                <div className="success-message" role="alert">
                  ✅ {successMessageState}
                </div>
              )}

              <form onSubmit={handleSubmit} className="login-form">
                {apiError && (
                  <div className="api-error-message" role="alert">
                    ⚠️ {apiError}
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="identifier" className="form-label">
                    Email or Username *
                  </label>
                  <input
                    type="text"
                    id="identifier"
                    name="identifier"
                    value={formData.identifier}
                    onChange={handleChange}
                    className={`form-input ${errors.identifier ? "error" : ""}`}
                    placeholder="Enter your email or username"
                    autoComplete="username"
                    disabled={isLoading}
                    aria-invalid={!!errors.identifier}
                    aria-describedby={errors.identifier ? "identifier-error" : undefined}
                  />
                  {errors.identifier && (
                    <span id="identifier-error" className="error-text">
                      {errors.identifier}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="password" className="form-label">
                    Password *
                  </label>
                  <div className="password-wrapper">
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`form-input ${errors.password ? "error" : ""}`}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      disabled={isLoading}
                      aria-invalid={!!errors.password}
                      aria-describedby={errors.password ? "password-error" : undefined}
                    />
                  </div>

                  <Link to="/forgot-password" className="forgot-password">
                    Forgot your password?
                  </Link>

                  {errors.password && (
                    <span id="password-error" className="error-text">
                      {errors.password}
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  className="login-btn"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="loading-spinner" style={{ 
                        display: "inline-block",
                        width: "20px", 
                        height: "20px", 
                        border: "2px solid rgba(255,255,255,0.3)", 
                        borderTop: "2px solid white", 
                        borderRadius: "50%", 
                        animation: "spin 0.8s linear infinite",
                        marginRight: "8px"
                      }} />
                      Signing In...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>

              <div className="divider">
                <span>or</span>
              </div>

              <div className="signup-prompt">
                <p>
                  Don't have an account?{" "}
                  <Link to="/book-demo" className="signup-link">
                    Book a demo here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>  
  );
};

export default LoginPage;