// src/components/Header.tsx
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import GetStartedModal from "./GetStartedModal";
import logo from "../assets/images/bimflow-logo.png";
import { authService } from "../services/authService";
import { getAccessToken, isAuthenticated as checkIsAuthenticated } from "../config/api";
import type { UserProfile } from "../services/authService";
import "../assets/css/Header.css";

const Header: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();

  const checkAuth = async () => {
    setLoading(true);
    try {
      const hasToken = !!getAccessToken();
      if (!hasToken) {
        setIsLoggedIn(false);
        setUser(null);
        setLoading(false);
        return;
      }

      const authenticated = checkIsAuthenticated() && !!getAccessToken();
      setIsLoggedIn(authenticated);

      if (authenticated) {
        const stored = authService.getStoredUser();
        if (stored) {
          setUser(stored);
        } else {
          const res = await authService.getCurrentUser();
          if (res.success && res.data) {
            setUser(res.data);
          }
        }
      } else {
        setUser(null);
        authService.clearAllData();
      }
    } catch {
      setIsLoggedIn(false);
      setUser(null);
      authService.clearAllData();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "access_token" || e.key === "refresh_token" || e.key === "user_data") {
        checkAuth();
      }
    };

    const handleAuthExpired = () => {
      setIsLoggedIn(false);
      setUser(null);
      navigate("/login", { state: { from: location.pathname } });
    };

    const handleAuthStateChanged = (event: CustomEvent) => {
      setIsLoggedIn(event.detail.isAuthenticated);
      if (!event.detail.isAuthenticated) {
        setUser(null);
      } else {
        checkAuth();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", checkAuth);
    window.addEventListener("auth-expired", handleAuthExpired);
    window.addEventListener("auth-state-changed", handleAuthStateChanged as EventListener);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", checkAuth);
      window.removeEventListener("auth-expired", handleAuthExpired);
      window.removeEventListener("auth-state-changed", handleAuthStateChanged as EventListener);
    };
  }, [location.pathname, navigate]);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  if (location.pathname.startsWith("/dashboard")) {
    return null;
  }

  if (loading) {
    return (
      <header className="header" role="banner">
        <div className="header__container">
          <Link to="/" className="logo">
            <img src={logo} alt="BIMFlow Suite" className="logo__image" />
            <span className="logo__text">BIMFlow Suite</span>
          </Link>
          <div className="actions">Loading...</div>
        </div>
      </header>
    );
  }

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/features", label: "Features" },
    { to: "/projects", label: "Projects" },
    { to: "/blog", label: "Blog" },
    { to: "/faq", label: "FAQ" },
  ];

  return (
    <>
      <header className="header" role="banner">
        <div className="header__container">
          <Link to="/" className="logo">
            <img src={logo} alt="BIMFlow Suite" className="logo__image" />
            <span className="logo__text">BIMFlow Suite</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="nav nav--desktop">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`nav__link ${location.pathname === link.to ? "nav__link--active" : ""}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions - always visible on desktop */}
          <div className="actions actions--desktop">
            {isLoggedIn && user ? (
              <>
                <Link to="/dashboard" className="btn btn--primary">
                  Dashboard
                </Link>
                <button className="btn btn--secondary" onClick={() => setModalOpen(true)}>
                  Get Started
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn--secondary">
                  Login
                </Link>
                <button className="btn btn--primary" onClick={() => setModalOpen(true)}>
                  Get Started
                </button>
              </>
            )}
          </div>

          {/* Hamburger */}
          <button
            className={`menu-toggle ${mobileOpen ? "active" : ""}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        {/* Mobile Menu */}
        <nav className={`mobile-nav ${mobileOpen ? "mobile-nav--open" : ""}`}>
          <div className="mobile-nav__content">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`mobile-nav__link ${location.pathname === link.to ? "mobile-nav__link--active" : ""}`}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            <div className="mobile-nav__actions">
              {isLoggedIn && user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="btn btn--primary btn--block"
                    onClick={() => setMobileOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    className="btn btn--secondary btn--block"
                    onClick={() => {
                      setModalOpen(true);
                      setMobileOpen(false);
                    }}
                  >
                    Get Started
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="btn btn--secondary btn--block"
                    onClick={() => setMobileOpen(false)}
                  >
                    Login
                  </Link>
                  <button
                    className="btn btn--primary btn--block"
                    onClick={() => {
                      setModalOpen(true);
                      setMobileOpen(false);
                    }}
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        </nav>
      </header>

      <GetStartedModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};

export default Header;