// src/components/ScrollToTop.tsx
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  // Use ReturnType<typeof setTimeout> instead of NodeJS.Timeout
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Use requestAnimationFrame for better performance
    const rafId = requestAnimationFrame(() => {
      timeoutRef.current = setTimeout(() => {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'auto'
        });
      }, 10);
    });

    return () => {
      cancelAnimationFrame(rafId);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [pathname]);

  return null;
};

export default ScrollToTop;