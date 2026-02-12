// src/hooks/useAuthState.ts
import { useState, useEffect } from "react";
import { authService } from "../services/authService";

export const useAuthState = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => 
    authService.isAuthenticated()
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set loading to false after initial check
    setIsLoading(false);

    // Listen for auth state changes
    const handleAuthChange = (event: CustomEvent) => {
      setIsAuthenticated(event.detail.isAuthenticated);
    };

    window.addEventListener('auth-state-changed', handleAuthChange as EventListener);
    
    return () => {
      window.removeEventListener('auth-state-changed', handleAuthChange as EventListener);
    };
  }, []);

  return { isAuthenticated, isLoading };
};