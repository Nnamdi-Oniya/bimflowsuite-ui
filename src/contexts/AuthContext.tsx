// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { authService } from "../services/authService";
import type { UserProfile } from "../services/authService";
import { 
  isUserAuthenticated, 
  getUserFromStorage, 
  clearAuthData 
} from "../utils/authUtils";

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: any) => Promise<any>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    // Initialize from storage using your utility
    return getUserFromStorage<UserProfile>();
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Initialize from your utility
    return isUserAuthenticated();
  });

  useEffect(() => {
    // Verify token validity and fetch fresh user data
    const initAuth = async () => {
      try {
        const authenticated = isUserAuthenticated();
        setIsAuthenticated(authenticated);
        
        if (authenticated) {
          const response = await authService.getCurrentUser();
          if (response.success && response.data) {
            setUser(response.data);
          }
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        // Clear invalid auth data using your utility
        clearAuthData();
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for auth state changes
    const handleAuthChange = (event: CustomEvent) => {
      setIsAuthenticated(event.detail.isAuthenticated);
      if (!event.detail.isAuthenticated) {
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

  const login = async (credentials: any) => {
    const response = await authService.login(credentials);
    if (response.success && response.data) {
      setUser(response.data.user);
      setIsAuthenticated(true);
    }
    return response;
  };

  const logout = async () => {
    await authService.logout();
    // Your clearAuthData is called inside authService.logout()
    setUser(null);
    setIsAuthenticated(false);
  };

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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};