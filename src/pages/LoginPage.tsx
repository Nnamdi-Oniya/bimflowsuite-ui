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

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate(from, { replace: true });
    }
  }, [navigate, from]);

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

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
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
        navigate(from, { replace: true });
        return;
      }

      setApiError(response.message || "Login failed. Please try again.");

    } catch (err: any) {
      let message = "An unexpected error occurred. Please try again.";

      if (err.data) {
        message = err.data.error || err.data.message || err.data.detail || message;
      } else if (err.message) {
        message = err.message;
      }

      if (err.status === 401) {
        message = message || "Invalid email or password. Please try again.";
      } else if (err.status === 403) {
        message = message || "Your account may be inactive or you don't have permission.";
      } else if (err.status === 429) {
        message = "Too many attempts. Please wait and try again.";
      } else if (err.status && err.status >= 500) {
        message = "Server error — please try again later.";
      } else if (err.status === 0 || err.code === 'NETWORK_ERROR') {
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
                {apiError && (
                  <div className="api-error-message" role="alert">
                    ⚠️ {apiError}
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="identifier" className="form-label">
                    Email or Username
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
                    Password
                  </label>
                  <div className="password-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`form-input ${errors.password ? "error" : ""}`}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={togglePasswordVisibility}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      disabled={isLoading}
                    >
                      {showPassword ? (
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