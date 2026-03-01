// src/hooks/useScrollButton.ts
import { useState, useEffect } from 'react';

export const useScrollButton = (threshold = 300) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Use ReturnType<typeof setTimeout> instead of NodeJS.Timeout
    let timeoutId: ReturnType<typeof setTimeout>;
    
    const handleScroll = () => {
      // Clear previous timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      // Debounce the visibility change
      timeoutId = setTimeout(() => {
        setIsVisible(window.scrollY > threshold);
      }, 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [threshold]);

  return isVisible;
};