// src/components/Header.tsx
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import GetStartedModal from "./GetStartedModal";
import logo from "../assets/images/bimflow-logo.png";
import "../assets/Header.css";

type NavLink = { href: string; label: string };

const Header: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [isGetStartedModalOpen, setIsGetStartedModalOpen] = useState(false);
  const location = useLocation();

  const links: NavLink[] = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/features", label: "Features" },
    { href: "/projects", label: "Projects" },
    { href: "/blog", label: "Blog" },
    { href: "/faq", label: "FAQ" }, // Updated to point to FAQ page
  ];

  const toggleMobile = () => setOpen(prev => !prev);
  const openGetStartedModal = () => setIsGetStartedModalOpen(true);

  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.substring(1));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100); 
      }
    }
  }, [location]);

  const NavItem = ({ href, label }: NavLink) => {
    const isActive = location.pathname === href;
    
    const handleClick = () => {
      setOpen(false);
    };

    return (
      <Link
        to={href}
        className={`nav__link ${isActive ? "nav__link--active" : ""}`}
        onClick={handleClick}
      >
        {label}
      </Link>
    );
  };

  return (
    <>
      <header className="header" role="banner">
        <div className="header__container">

          {/* LOGO WITH IMAGE */}
          <Link to="/" className="logo" aria-label="BIMFlow Suite Home">
            <img src={logo} alt="BIMFlow Suite" className="logo__image" />
            <span className="logo__text">BIMFlow Suite</span>
          </Link>

          <nav className="nav" aria-label="Primary navigation">
            {links.map(link => (
              <NavItem key={link.href} {...link} />
            ))}
          </nav>

          <div className="actions">
            <Link to="/login" className="btn btn--secondary">Login</Link>
            <button onClick={openGetStartedModal} className="btn btn--primary">
              Get Started
            </button>
          </div>

          <button
            className="menu-toggle"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={toggleMobile}
          >
            <span></span><span></span><span></span>
          </button>
        </div>

        {/* Mobile menu */}
        <div className={`mobile-menu ${open ? "mobile-menu--open" : ""}`}>
          <nav className="mobile-nav">
            {links.map(link => (
              <NavItem key={link.href} {...link} />
            ))}
            <div className="mobile-actions">
              <Link to="/login" className="btn btn--secondary" onClick={toggleMobile}>
                Login
              </Link>
              <button
                onClick={() => { openGetStartedModal(); toggleMobile(); }}
                className="btn btn--primary"
              >
                Get Started
              </button>
            </div>
          </nav>
        </div>
      </header>

      <GetStartedModal
        isOpen={isGetStartedModalOpen}
        onClose={() => setIsGetStartedModalOpen(false)}
      />
    </>
  );
};

export default Header;