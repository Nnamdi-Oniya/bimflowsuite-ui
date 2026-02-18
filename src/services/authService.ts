// src/services/authService.ts
import { apiClient, type ApiResponse } from './apiClient';
import {
  BACKEND_CONFIG,
  type TokenPair,
  setTokens,
  clearTokens,
  getAccessToken,
  refreshTokensFromStorage,
} from '../config/api';

// ────────────────────────────────────────────────
// Type Definitions
// ────────────────────────────────────────────────

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  location?: string;
  company?: string;
  job_title?: string;
  profile_picture?: string;
  date_joined: string;
  last_login?: string;
  is_active: boolean;
  is_staff?: boolean;
}

export interface LoginCredentials {
  username_or_email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  confirm_password: string;
  first_name?: string;
  last_name?: string;
  company?: string;
  phone?: string;
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

// Backend Response Types
type BackendAuthResponse = {
  user: {
    id: number;
    username: string;
    email: string;
    date_joined: string;
  };
  tokens: {
    access: string;
    refresh: string;
  };
};

type ServiceAuthResponse = {
  user: UserProfile;
  tokens: TokenPair;
};

/**
 * Authentication Service
 * Handles all authentication-related operations
 */
class AuthService {
  private endpoints = BACKEND_CONFIG.endpoints;

  constructor() {
    // Ensure tokens are loaded from storage on service initialization
    if (typeof window !== 'undefined') {
      refreshTokensFromStorage();
    }
  }

  // ─── Utility Methods ──────────────────────────────

  private decodeBase64String(encoded: string): string {
    if (!encoded) return '';

    try {
      let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');

      while (base64.length % 4) {
        base64 += '=';
      }

      const decoded = atob(base64);

      try {
        return decodeURIComponent(escape(decoded));
      } catch {
        return decoded;
      }
    } catch {
      return encoded;
    }
  }

  extractEmailFromParam(emailParam: string | null): string {
    if (!emailParam) return 'User account';

    try {
      const decoded = this.decodeBase64String(emailParam);
      if (decoded && decoded.includes('@') && decoded.includes('.')) {
        return decoded;
      }
      return 'User account';
    } catch {
      return 'User account';
    }
  }

  // ─── Authentication Methods ───────────────────────

  /**
   * User login - now with much better error messages
   */
  async login(credentials: LoginCredentials): Promise<ApiResponse<ServiceAuthResponse>> {
    try {
      const raw = await apiClient.post<BackendAuthResponse>(
        this.endpoints.auth.login,
        {
          username_or_email: credentials.username_or_email.trim(),
          password: credentials.password,
        }
      );

      if (!raw.success || !raw.data) {
        // Handle common backend failure cases
        if (raw.status === 401) {
          return {
            success: false,
            status: 401,
            message: raw.message || 'Invalid email or password. Please try again.',
          };
        }

        if (raw.status === 400) {
          return {
            success: false,
            status: 400,
            message: raw.message || 'Please check your details and try again.',
          };
        }

        return {
          success: false,
          status: raw.status || 500,
          message: raw.message || 'Login failed. Please try again later.',
        };
      }

      const { user: backendUser, tokens } = raw.data;

      // Store tokens
      setTokens(tokens);

      // Fetch full profile
      let userProfile: UserProfile;

      try {
        const profileResponse = await this.getCurrentUser();
        if (profileResponse.success && profileResponse.data) {
          userProfile = profileResponse.data;
        } else {
          userProfile = this.createBasicProfile(backendUser);
        }
      } catch {
        userProfile = this.createBasicProfile(backendUser);
      }

      // Store user
      localStorage.setItem('user_data', JSON.stringify(userProfile));

      // Notify app
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('auth-state-changed', {
            detail: { isAuthenticated: true },
          })
        );
      }

      return {
        success: true,
        data: {
          user: userProfile,
          tokens,
        },
        status: raw.status,
        message: 'Login successful',
      };
    } catch (error: any) {
      console.error('Login error caught in authService:', error);
      
      // If it's an ApiError from apiClient, it already has the structure we need
      if (error && typeof error === 'object') {
        return {
          success: false,
          status: error.status || 500,
          message: error.message || 'An error occurred during login',
          data: error.data,
        };
      }

      // Network / connection errors
      if (!error.response && (error.message?.includes('Network') || error.code === 'ECONNABORTED')) {
        return {
          success: false,
          status: 0,
          message: 'Cannot connect to the server. Please check your internet connection.',
        };
      }

      // Fallback
      return {
        success: false,
        status: 500,
        message: 'An unexpected error occurred. Please try again later.',
      };
    }
  }

  /**
   * User registration
   */
  async register(data: RegisterData): Promise<ApiResponse<ServiceAuthResponse>> {
    try {
      const raw = await apiClient.post<BackendAuthResponse>(
        this.endpoints.auth.register,
        {
          username: data.email.split('@')[0],
          email: data.email,
          password: data.password,
        }
      );

      if (!raw.success || !raw.data) {
        return {
          success: false,
          status: raw.status || 400,
          message: raw.message || 'Registration failed. Please try again.',
        };
      }

      const { user: backendUser, tokens } = raw.data;

      setTokens(tokens);

      const userProfile: UserProfile = {
        id: backendUser.id,
        username: backendUser.username,
        email: backendUser.email,
        date_joined: backendUser.date_joined,
        is_active: true,
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        company: data.company || '',
        phone_number: data.phone || '',
        location: '',
        job_title: '',
      };

      localStorage.setItem('user_data', JSON.stringify(userProfile));

      try {
        const profileResponse = await this.getCurrentUser();
        if (profileResponse.success && profileResponse.data) {
          localStorage.setItem('user_data', JSON.stringify(profileResponse.data));
        }
      } catch {
        // silent fail
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('auth-state-changed', {
            detail: { isAuthenticated: true },
          })
        );
      }

      return {
        success: true,
        data: {
          user: userProfile,
          tokens,
        },
        status: raw.status,
        message: 'Registration successful',
      };
    } catch (error: any) {
      return {
        success: false,
        status: error.status || 400,
        message: error.message || 'Registration failed. Please check your details and try again.',
      };
    }
  }

  /**
   * User logout
   */
  async logout(): Promise<ApiResponse> {
    try {
      await apiClient.post(this.endpoints.auth.logout, {}).catch(() => {
        // silent fail
      });
    } finally {
      this.clearAllData();

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('auth-state-changed', {
            detail: { isAuthenticated: false },
          })
        );
      }
    }

    return {
      data: null,
      message: 'Logged out successfully',
      status: 200,
      success: true,
    };
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<ApiResponse<UserProfile>> {
    const storedUser = this.getStoredUser();

    if (this.isAuthenticated()) {
      try {
        const resp = await apiClient.get<UserProfile>(this.endpoints.users.profile);

        if (resp.success && resp.data) {
          localStorage.setItem('user_data', JSON.stringify(resp.data));
          return resp;
        }
      } catch (err: any) {
        if (storedUser) {
          return {
            data: storedUser,
            status: 200,
            success: true,
            message: 'Retrieved from storage (API unavailable)',
          };
        }
      }
    }

    if (storedUser) {
      return {
        data: storedUser,
        status: 200,
        success: true,
        message: 'Retrieved from storage',
      };
    }

    return {
      success: false,
      status: 401,
      message: 'Not authenticated',
    };
  }

  // ─── Password Management ──────────────────────────

  async requestPasswordReset(data: PasswordResetRequest): Promise<ApiResponse> {
    return apiClient.post(this.endpoints.auth.requestReset, data);
  }

  async confirmPasswordReset(data: PasswordResetConfirm): Promise<ApiResponse> {
    return apiClient.post(this.endpoints.auth.confirmReset, {
      token: data.token,
      password: data.new_password,
      password_confirm: data.confirm_new_password,
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
    return apiClient.post<SetPasswordResponse>(this.endpoints.auth.activateAccount, payload);
  }

  async verifyActivationToken(data: VerifyTokenData): Promise<ApiResponse<VerifyTokenResponse>> {
    const payload = {
      email: data.email,
      uid: data.uid,
      token: data.token,
    };
    return apiClient.post<VerifyTokenResponse>(
      this.endpoints.auth.verifyActivationToken,
      payload
    );
  }

  // ─── Token & Session Management ───────────────────

  isAuthenticated(): boolean {
    const token = getAccessToken();
    if (!token) return false;

    try {
      const payload = this.decodeToken(token);
      if (!payload || typeof payload.exp !== 'number') return false;

      // 5-minute buffer
      return payload.exp * 1000 > Date.now() + 300000;
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

  clearAllData(): void {
    clearTokens();
    localStorage.removeItem('user_data');

    if (typeof window !== 'undefined') {
      ['access_token', 'refresh_token', 'user_data', 'auth_token', 'user'].forEach((key) => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
    }
  }

  hasActivationParams(): boolean {
    if (typeof window === 'undefined') return false;
    const urlParams = new URLSearchParams(window.location.search);
    return !!(urlParams.get('email') && urlParams.get('uid') && urlParams.get('token'));
  }

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

  decodeToken(token: string): any {
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
  }

  decodeBase64(encoded: string): string {
    return this.decodeBase64String(encoded);
  }

  encodeBase64(text: string): string {
    try {
      const utf8Bytes = unescape(encodeURIComponent(text));
      return btoa(utf8Bytes);
    } catch {
      return btoa(text);
    }
  }

  // ─── Private Helpers ──────────────────────────────

  private createBasicProfile(backendUser: any): UserProfile {
    return {
      id: backendUser.id,
      username: backendUser.username,
      email: backendUser.email,
      date_joined: backendUser.date_joined,
      is_active: true,
      first_name: '',
      last_name: '',
      phone_number: '',
      location: '',
      company: '',
      job_title: '',
    };
  }
}

// Singleton
export const authService = new AuthService();