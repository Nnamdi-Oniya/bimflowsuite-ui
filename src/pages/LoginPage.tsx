// src/pages/LoginPage.tsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../assets/css/LoginPage.css";
import loginImage from "../assets/images/loginImage2.jpg";
import { authService } from "../services/authService";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from || "/dashboard";

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (apiError) {
      setApiError("");
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
    if (isLoading) return;

    setIsLoading(true);

    try {
      const credentials = {
        username_or_email: formData.identifier.trim(),
        password: formData.password,
      };

      const response = await authService.login(credentials);

      if (response.success) {
        // Navigation handled by auth-state-changed event
        return;
      }

      // Service returned failure — show backend message if present
      setApiError(
        response.message ||
        "Invalid email or password. Please try again."
      );
    } catch (err: any) {
      console.log("LOGIN ERROR FULL DETAILS:", {
        message: err.message,
        status: err.status,
        data: err.data,
        code: err.code,
      });

      let message = "An unexpected error occurred. Please try again.";

      // Extract the exact backend message — your case uses "error" field
      if (err.data) {
        message = err.data.error || err.data.message || err.data.detail || message;
      } else if (err.message) {
        message = err.message;
      }

      // Status-based fallback
      if (err.status === 401 || err.status === 403) {
        message = "Invalid email or password. Please try again.";
      } else if (err.status === 400) {
        // Keep the extracted message
      } else if (err.status === 429) {
        message = "Too many attempts. Please wait and try again.";
      } else if (err.status && err.status >= 500) {
        message = "Server error — please try again later.";
      } else if (err.status === 0 || err.code === 'NETWORK_ERROR') {
        message = "Cannot connect to the server. Please check your internet.";
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
                  />
                  {errors.identifier && (
                    <span className="error-text">{errors.identifier}</span>
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
                    />
                  </div>

                  <Link to="/forgot-password" className="forgot-password">
                    Forgot your password?
                  </Link>

                  {errors.password && (
                    <span className="error-text">{errors.password}</span>
                  )}
                </div>

                <button
                  type="submit"
                  className="login-btn"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span
                        className="loading-spinner"
                        style={{
                          display: "inline-block",
                          width: "20px",
                          height: "20px",
                          border: "2px solid rgba(255,255,255,0.3)",
                          borderTop: "2px solid white",
                          borderRadius: "50%",
                          animation: "spin 0.8s linear infinite",
                          marginRight: "8px",
                        }}
                      />
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