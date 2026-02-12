// src/components/Header.tsx
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import GetStartedModal from "./GetStartedModal";
import logo from "../assets/images/bimflow-logo.png";
import { authService } from "../services/authService";
import { getAccessToken } from "../config/api";
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

      let authenticated = authService.isAuthenticated();

      if (!authenticated) {
        const refreshResult = await authService.refreshAccessToken();
        authenticated = refreshResult.success;
      }

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
    } catch (err) {
      console.error("Header auth check failed:", err);
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
      if (e.key === 'access_token' || e.key === 'refresh_token' || e.key === 'user_data') {
        checkAuth();
      }
    };

    const handleAuthExpired = () => {
      setIsLoggedIn(false);
      setUser(null);
      navigate('/login', { state: { from: location.pathname } });
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", checkAuth);
    window.addEventListener("auth-expired", handleAuthExpired);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", checkAuth);
      window.removeEventListener("auth-expired", handleAuthExpired);
    };
  }, [location.pathname]);

  const handleLogout = async () => {
    await authService.logout();
    setIsLoggedIn(false);
    setUser(null);
    setMobileOpen(false);
    navigate("/");
  };

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

  return (
    <>
      <header className="header" role="banner">
        <div className="header__container">
          <Link to="/" className="logo">
            <img src={logo} alt="BIMFlow Suite" className="logo__image" />
            <span className="logo__text">BIMFlow Suite</span>
          </Link>

          <nav className="nav">
            {[
              { to: "/", label: "Home" },
              { to: "/about", label: "About" },
              { to: "/features", label: "Features" },
              { to: "/projects", label: "Projects" },
              { to: "/blog", label: "Blog" },
              { to: "/faq", label: "FAQ" },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`nav__link ${
                  location.pathname === link.to ? "nav__link--active" : ""
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="actions">
            {isLoggedIn && user ? (
              <>
                <Link to="/dashboard" className="btn btn--primary">
                  Dashboard
                </Link>
                <button
                  className="btn btn--secondary logout-btn"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn--secondary">
                  Login
                </Link>
                <button
                  className="btn btn--primary"
                  onClick={() => setModalOpen(true)}
                >
                  Get Started
                </button>
              </>
            )}
          </div>

          <button
            className="menu-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>

      <GetStartedModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
};

export default Header;