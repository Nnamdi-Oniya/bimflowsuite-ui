// Updated LoginPage.tsx with form validation and link to book-demo
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "../assets/LoginPage.css";
import loginImage from "../assets/images/loginImage2.jpg"; // Full-page left side image

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string): string => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? "" : "Please enter a valid email address.";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error on change
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }

    // Validate email on change
    if (name === "email" && value.trim()) {
      const emailError = validateEmail(value);
      setErrors({ ...errors, email: emailError });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else {
      const emailError = validateEmail(formData.email);
      if (emailError) newErrors.email = emailError;
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
    if (!validateForm()) return;
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      if (formData.email === "demo@bimflow.dev" && formData.password === "demo123") {
        navigate("/dashboard"); // Assume dashboard route
      } else {
        setErrors({ ...errors, email: "Invalid email or password. Try demo@bimflow.dev / demo123" });
      }
    }, 1500);
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
              <p className="login-subtitle">Sign in to your BIMFlow Suite account to access your projects and tools.</p>
              <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`form-input ${errors.email ? 'error' : ''}`}
                    placeholder="Enter your email"
                    required
                  />
                  {errors.email && <span className="error-text">{errors.email}</span>}
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
                      className={`form-input ${errors.password ? 'error' : ''}`}
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                  <Link to="/forgot-password" className="forgot-password">
                    Forgot your password?
                  </Link>
                  {errors.password && <span className="error-text">{errors.password}</span>}
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
                    'Sign In'
                  )}
                </button>
              </form>

              <div className="divider">
                <span>or</span>
              </div>

              <div className="signup-prompt">
                <p>
                  Don't have an account? <Link to="/book-demo" className="signup-link">Book a demo here</Link>
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