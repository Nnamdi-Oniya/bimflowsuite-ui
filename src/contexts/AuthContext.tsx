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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(authService.getStoredUser());
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    refreshTokensFromStorage();
    return checkIsAuthenticated() && !!getAccessToken();
  });

  useEffect(() => {
    const initAuth = async () => {
      try {
        refreshTokensFromStorage();
        
        const hasValidToken = checkIsAuthenticated() && !!getAccessToken();
        setIsAuthenticated(hasValidToken);
        
        if (hasValidToken) {
          const response = await authService.getCurrentUser();
          if (response.success && response.data) {
            setUser(response.data);
          } else {
            const storedUser = authService.getStoredUser();
            if (storedUser) {
              setUser(storedUser);
            } else {
              authService.clearAllData();
              setIsAuthenticated(false);
              setUser(null);
            }
          }
        }
      } catch {
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

    const handleAuthChange = (event: CustomEvent) => {
      const isAuth = event.detail.isAuthenticated;
      setIsAuthenticated(isAuth);
      
      if (!isAuth) {
        setUser(null);
      } else {
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
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};