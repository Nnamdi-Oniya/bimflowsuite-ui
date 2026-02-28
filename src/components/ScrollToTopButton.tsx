// src/components/ScrollToTopButton.tsx
import React, { useState, useEffect } from 'react';

const ScrollToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Use ReturnType<typeof setTimeout> instead of NodeJS.Timeout
    let timeoutId: ReturnType<typeof setTimeout>;
    
    const toggleVisibility = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      timeoutId = setTimeout(() => {
        const shouldBeVisible = window.pageYOffset > 300;
        
        if (shouldBeVisible !== isVisible) {
          setIsAnimating(true);
          setIsVisible(shouldBeVisible);
          
          // Reset animation flag after transition
          setTimeout(() => {
            setIsAnimating(false);
          }, 200);
        }
      }, 50);
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isVisible]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible && !isAnimating) return null;

  return (
    <button
      onClick={scrollToTop}
      className={`scroll-to-top-btn ${isVisible ? 'visible' : 'hidden'}`}
      aria-label="Scroll to top"
      style={{
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        background: '#F8780F',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'opacity 0.2s ease-in-out, transform 0.2s ease-in-out',
        opacity: isVisible ? 1 : 0,
        transform: `scale(${isVisible ? 1 : 0.8})`,
        pointerEvents: isVisible ? 'auto' : 'none',
        zIndex: 1000,
      }}
    >
      <svg 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2.5"
      >
        <path d="M18 15L12 9L6 15" />
      </svg>
    </button>
  );
};

export default ScrollToTopButton;