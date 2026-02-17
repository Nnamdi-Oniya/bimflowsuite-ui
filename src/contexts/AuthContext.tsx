// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { authService } from "../services/authService";
import type { UserProfile } from "../services/authService";
import { 
  getAccessToken,
  isAuthenticated as checkIsAuthenticated,
  refreshTokensFromStorage
} from "../config/api";

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: any) => Promise<any>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Authentication Provider Component
 * Manages authentication state throughout the application
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    // Initialize from storage
    return authService.getStoredUser();
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Refresh tokens from storage first
    refreshTokensFromStorage();
    // Check if we have a valid token
    return checkIsAuthenticated() && !!getAccessToken();
  });

  useEffect(() => {
    // Verify token validity and fetch fresh user data
    const initAuth = async () => {
      try {
        // Refresh tokens from storage on each init
        refreshTokensFromStorage();
        
        const hasValidToken = checkIsAuthenticated() && !!getAccessToken();
        setIsAuthenticated(hasValidToken);
        
        if (hasValidToken) {
          // Always try to get fresh user data from API
          const response = await authService.getCurrentUser();
          if (response.success && response.data) {
            setUser(response.data);
          } else {
            // If API call fails but we have stored user, keep it
            const storedUser = authService.getStoredUser();
            if (storedUser) {
              setUser(storedUser);
            } else {
              // No stored user, clear everything
              authService.clearAllData();
              setIsAuthenticated(false);
              setUser(null);
            }
          }
        }
      } catch {
        // Don't clear data on error, keep existing state
        const storedUser = authService.getStoredUser();
        if (storedUser && checkIsAuthenticated()) {
          setUser(storedUser);
        } else {
          authService.clearAllData();
          setIsAuthenticated(false);
          setUser(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for auth state changes
    const handleAuthChange = (event: CustomEvent) => {
      const isAuth = event.detail.isAuthenticated;
      setIsAuthenticated(isAuth);
      
      if (!isAuth) {
        setUser(null);
      } else {
        // Re-fetch user when authenticated
        authService.getCurrentUser().then(response => {
          if (response.success && response.data) {
            setUser(response.data);
          }
        });
      }
    };

    window.addEventListener('auth-state-changed', handleAuthChange as EventListener);
    
    return () => {
      window.removeEventListener('auth-state-changed', handleAuthChange as EventListener);
    };
  }, []);

  /**
   * Handle user login
   */
  const login = async (credentials: any) => {
    const response = await authService.login(credentials);
    if (response.success && response.data) {
      setUser(response.data.user);
      setIsAuthenticated(true);
    }
    return response;
  };

  /**
   * Handle user logout
   */
  const logout = async () => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  /**
   * Refresh user data from API
   */
  const refreshUser = async () => {
    const response = await authService.getCurrentUser();
    if (response.success && response.data) {
      setUser(response.data);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoading,
      login,
      logout,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};