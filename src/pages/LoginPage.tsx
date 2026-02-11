// src/pages/LoginPage.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "../assets/css/LoginPage.css";
import loginImage from "../assets/images/loginImage2.jpg"; 

import { authService } from "../services/authService"; 

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    identifier: "", // Can be email or username
    password: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const validateIdentifier = (identifier: string): string => {
    if (!identifier.trim()) {
      return "Email or username is required.";
    }
    return "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear field + global error on change
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
    if (apiError) {
      setApiError("");
    }

    // Live validation for identifier
    if (name === "identifier" && value.trim()) {
      const identifierError = validateIdentifier(value);
      setErrors({ ...errors, identifier: identifierError });
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
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const identifier = formData.identifier.trim();
      
      const credentials = {
        username_or_email: identifier, 
        password: formData.password,
      };

      console.log('Sending login request with:', credentials);

      const response = await authService.login(credentials);

      console.log('Login response:', response);

      if (response.success && response.data) {
        // Login successful → tokens & user already saved by authService
        navigate("/dashboard", { replace: true });
      } else {
        // Check for specific error messages from response
        if (response.message) {
          setApiError(response.message);
        } else {
          setApiError("Login failed. Please check your credentials.");
        }
      }
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Handle different error shapes from your ApiClient
      let message = "An error occurred. Please try again later.";

      if (err.message) {
        message = err.message;
      }

      // Specific handling for 401 Unauthorized (invalid credentials)
      if (err.status === 401) {
        // Check if backend returned a specific error message
        if (err.data?.error) {
          message = err.data.error; // "Invalid credentials"
        } else if (err.data?.detail) {
          message = err.data.detail;
        } else {
          message = "Invalid email/username or password.";
        }
      } 
      // Handle 400 Bad Request (validation errors)
      else if (err.status === 400) {
        if (err.errors?.length) {
          // Validation errors from serializer
          const firstError = err.errors[0];
          message = `${firstError.field}: ${firstError.messages.join(", ")}`;
        } else if (err.data) {
          // Check for field-specific errors in the data
          const errorFields = Object.keys(err.data);
          if (errorFields.length > 0 && errorFields[0] !== 'detail' && errorFields[0] !== 'error') {
            const firstField = errorFields[0];
            const fieldError = Array.isArray(err.data[firstField]) 
              ? err.data[firstField][0] 
              : err.data[firstField];
            message = `${firstField}: ${fieldError}`;
          } else if (err.data.detail) {
            message = err.data.detail;
          } else if (err.data.error) {
            message = err.data.error;
          } else if (typeof err.data === 'string') {
            message = err.data;
          }
        }
      } 
      // Handle network errors
      else if (err.status === 0 || err.code === "NETWORK_ERROR") {
        message = "Cannot connect to the server. Please check your internet connection.";
      }

      setApiError(message);
    } finally {
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

              <form onSubmit={handleSubmit} className="login-form">
                {/* API Error Display */}
                {apiError && (
                  <div className="api-error-message">
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
                    required
                  />
                  {errors.identifier && (
                    <span className="error-text">
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
                      required
                    />
                  </div>

                  <Link to="/forgot-password" className="forgot-password">
                    Forgot your password?
                  </Link>

                  {errors.password && (
                    <span className="error-text">
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
                      <div className="loading-spinner"></div>
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