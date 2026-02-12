import { isAuthenticated as checkAuth } from '../config/api';

/**
 * Check if user is authenticated via token
 */
export const isUserAuthenticated = (): boolean => {
  return checkAuth();
};

/**
 * Get user email from localStorage
 */
export const getUserEmailFromStorage = (): string | null => {
  if (typeof window === 'undefined') return null;
 
  try {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      const user = JSON.parse(userData);
      return user.email || null;
    }
  } catch (error) {
    console.warn('Failed to parse user data from storage:', error);
  }
  return null;
};

/**
 * Get full user profile from storage
 */
export const getUserFromStorage = <T = any>(): T | null => {
  if (typeof window === 'undefined') return null;
 
  try {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      return JSON.parse(userData) as T;
    }
  } catch (error) {
    console.warn('Failed to parse user data from storage:', error);
  }
  return null;
};

/**
 * Clear all auth data
 */
export const clearAuthData = (): void => {
  if (typeof window === 'undefined') return;
 
  ['access_token', 'refresh_token', 'user_data', 'auth_token', 'user'].forEach(key => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
};

/**
 * Parse JWT token payload
 */
export const parseJwt = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
   
    let padded = base64;
    while (padded.length % 4) {
      padded += '=';
    }
   
    const jsonPayload = decodeURIComponent(
      atob(padded)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
   
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  const payload = parseJwt(token);
  if (!payload || !payload.exp) return true;
  return payload.exp * 1000 <= Date.now();
};