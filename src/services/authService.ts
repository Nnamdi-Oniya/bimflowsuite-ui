// src/services/authService.ts
import { apiClient, type ApiResponse } from './apiClient';
import {
  BACKEND_CONFIG,
  type TokenPair,
  setTokens,
  clearTokens,
  getAccessToken,
  getRefreshToken,
} from '../config/api';

export interface LoginCredentials {
  username_or_email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  confirm_password: string;
  first_name: string;
  last_name: string;
  company?: string;
  phone?: string;
}

export interface UserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  company?: string;
  phone?: string;
  avatar?: string;
  is_active: boolean;
  is_staff: boolean;
  date_joined: string;
  last_login: string;
}

export interface PasswordChangeData {
  old_password: string;
  new_password: string;
  confirm_new_password: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  uid: string;
  new_password: string;
  confirm_new_password: string;
}

export interface SetPasswordData {
  email: string;
  uid: string;
  token: string;
  password: string;
  password_confirm: string;
}

export interface VerifyTokenData {
  email: string;
  uid: string;
  token: string;
}

// Updated SetPasswordResponse interface
export interface SetPasswordResponse {
  success: boolean;
  message: string;
  already_active?: boolean;
}

export interface VerifyTokenResponse {
  success: boolean;
  valid: boolean;
  message: string;
  email?: string;
}

type BackendAuthResponse = {
  user: UserProfile;
  access: string;
  refresh: string;
};

type ServiceAuthResponse = {
  user: UserProfile;
  tokens: TokenPair;
};

class AuthService {
  private endpoints = BACKEND_CONFIG.endpoints.auth;

  async login(credentials: LoginCredentials): Promise<ApiResponse<ServiceAuthResponse>> {
    const raw = await apiClient.post<BackendAuthResponse>(
      this.endpoints.login,
      {
        username_or_email: credentials.username_or_email,
        password: credentials.password,
      }
    );

    if (!raw.success || !raw.data) {
      return raw as unknown as ApiResponse<ServiceAuthResponse>;
    }

    const { user, access, refresh } = raw.data;
    setTokens({ access, refresh });
    localStorage.setItem('user_data', JSON.stringify(user));

    const transformed: ApiResponse<ServiceAuthResponse> = {
      data: {
        user,
        tokens: { access, refresh },
      },
      status: raw.status,
      success: raw.success,
      message: raw.message,
    };

    return transformed;
  }

  async register(data: RegisterData): Promise<ApiResponse<ServiceAuthResponse>> {
    const raw = await apiClient.post<BackendAuthResponse>(
      this.endpoints.register,
      data
    );

    if (!raw.success || !raw.data) {
      return raw as unknown as ApiResponse<ServiceAuthResponse>;
    }

    const { user, access, refresh } = raw.data;
    setTokens({ access, refresh });
    localStorage.setItem('user_data', JSON.stringify(user));

    const transformed: ApiResponse<ServiceAuthResponse> = {
      data: {
        user,
        tokens: { access, refresh },
      },
      status: raw.status,
      success: raw.success,
      message: raw.message,
    };

    return transformed;
  }

  async logout(): Promise<ApiResponse> {
    try {
      await apiClient.post(this.endpoints.logout, {});
    } catch (error) {
      console.warn('Logout API call failed, clearing tokens locally:', error);
    } finally {
      clearTokens();
      localStorage.removeItem('user_data');
    }

    return {
      data: null,
      message: 'Logged out successfully',
      status: 200,
      success: true,
    };
  }

  async getCurrentUser(): Promise<ApiResponse<UserProfile>> {
    const storedUser = localStorage.getItem('user_data');
    if (storedUser && getAccessToken()) {
      try {
        const user = JSON.parse(storedUser) as UserProfile;
        return {
          data: user,
          status: 200,
          success: true,
          message: 'User retrieved from storage',
        };
      } catch (err) {
        console.warn('Invalid stored user data, falling back to API');
      }
    }

    const resp = await apiClient.get<UserProfile>(this.endpoints.me);
    if (resp.success && resp.data) {
      localStorage.setItem('user_data', JSON.stringify(resp.data));
    }

    return resp;
  }

  async verifyToken(token: string): Promise<ApiResponse> {
    return apiClient.post(this.endpoints.verify, { token });
  }

  async refreshAccessToken(): Promise<ApiResponse<TokenPair>> {
    const refresh = getRefreshToken();
    if (!refresh) {
      throw Object.assign(new Error('No refresh token available'), {
        status: 401,
        code: 'NO_REFRESH_TOKEN',
      });
    }

    const resp = await apiClient.post<TokenPair>(this.endpoints.refresh, { refresh });
    if (resp.success && resp.data) {
      setTokens(resp.data);
    }

    return resp;
  }

  async changePassword(data: PasswordChangeData): Promise<ApiResponse> {
    return apiClient.post(this.endpoints.changePassword, data);
  }

  async requestPasswordReset(data: PasswordResetRequest): Promise<ApiResponse> {
    return apiClient.post(this.endpoints.requestReset, data);
  }

  async confirmPasswordReset(data: PasswordResetConfirm): Promise<ApiResponse> {
    return apiClient.post(this.endpoints.confirmReset, {
      token: data.token,
      uid: data.uid,
      new_password: data.new_password,
      confirm_new_password: data.confirm_new_password,
    });
  }

  async activateAccount(data: SetPasswordData): Promise<ApiResponse<SetPasswordResponse>> {
    const payload = {
      email: data.email,
      uid: data.uid,
      token: data.token,
      password: data.password,
      password_confirm: data.password_confirm,
    };

    const response = await apiClient.post<SetPasswordResponse>(
      this.endpoints.activateAccount,
      payload
    );

    return response;
  }

  async verifyActivationToken(data: VerifyTokenData): Promise<ApiResponse<VerifyTokenResponse>> {
    const payload = {
      email: data.email,
      uid: data.uid,
      token: data.token,
    };

    const response = await apiClient.post<VerifyTokenResponse>(
      this.endpoints.verifyActivationToken,
      payload
    );

    return response;
  }

  isAuthenticated(): boolean {
    const token = getAccessToken();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  getStoredUser(): UserProfile | null {
    const stored = localStorage.getItem('user_data');
    if (!stored) return null;
    try {
      return JSON.parse(stored) as UserProfile;
    } catch {
      return null;
    }
  }

  updateStoredUser(partial: Partial<UserProfile>): void {
    const current = this.getStoredUser();
    if (!current) return;
    const updated = { ...current, ...partial };
    localStorage.setItem('user_data', JSON.stringify(updated));
  }

  decodeBase64(str: string): string {
    try {
      // Handle URL-safe base64
      let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
      
      // Add padding if needed
      while (base64.length % 4) {
        base64 += '=';
      }
      
      // Decode base64
      const decoded = atob(base64);
      
      // Try to decode as UTF-8 (URL encoded)
      try {
        return decodeURIComponent(decoded);
      } catch {
        // If not URL encoded, return as-is
        return decoded;
      }
    } catch (error) {
      console.error('Failed to decode base64:', error, 'String:', str);
      throw new Error('Invalid base64 encoding');
    }
  }

  encodeBase64(str: string): string {
    try {
      // Encode to base64
      const base64 = btoa(encodeURIComponent(str));
      
      // Make it URL-safe
      return base64
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    } catch (error) {
      console.error('Failed to encode to base64:', error);
      throw new Error('Failed to encode string');
    }
  }

  // Simple email validation
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Password strength validation (optional)
  validatePasswordStrength(password: string): { valid: boolean; message: string } {
    if (password.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters long' };
    }
    
    // Optional: Add more strength checks if needed
    // if (!/(?=.*[a-z])/.test(password)) {
    //   return { valid: false, message: 'Password must contain at least one lowercase letter' };
    // }
    // if (!/(?=.*[A-Z])/.test(password)) {
    //   return { valid: false, message: 'Password must contain at least one uppercase letter' };
    // }
    // if (!/(?=.*\d)/.test(password)) {
    //   return { valid: false, message: 'Password must contain at least one number' };
    // }
    
    return { valid: true, message: 'Password is strong enough' };
  }

  // Clear all stored data
  clearAllData(): void {
    clearTokens();
    localStorage.removeItem('user_data');
    // Clear any other auth-related storage
    if (typeof window !== 'undefined') {
      ['access_token', 'refresh_token', 'user_data', 'auth_token', 'user'].forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
    }
  }

  // Check if activation parameters are present
  hasActivationParams(): boolean {
    if (typeof window === 'undefined') return false;
    
    const urlParams = new URLSearchParams(window.location.search);
    return !!(urlParams.get('email') && urlParams.get('uid') && urlParams.get('token'));
  }

  // Extract activation parameters from URL
  getActivationParams(): { email: string; uid: string; token: string } | null {
    if (typeof window === 'undefined') return null;
    
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');
    const uid = urlParams.get('uid');
    const token = urlParams.get('token');
    
    if (email && uid && token) {
      return { email, uid, token };
    }
    
    return null;
  }
}

export const authService = new AuthService();