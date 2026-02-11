// src/utils/authUtils.ts
import { getAccessToken } from '../config/api';

export const isUserAuthenticated = (): boolean => {
  const token = getAccessToken();
  if (!token) return false;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

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