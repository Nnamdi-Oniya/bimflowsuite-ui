import { apiClient, type ApiResponse } from './apiClient';
import {
  BACKEND_CONFIG,
  type TokenPair,
  setTokens,
  clearTokens,
  getAccessToken,
  getRefreshToken,
} from '../config/api';

// ────────────────────────────────────────────────
// Types – export everything
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

// ────────────────────────────────────────────────
// Backend Response Types
// ────────────────────────────────────────────────
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

// ────────────────────────────────────────────────
// Auth Service Class (consolidated for BIMFlow Suite)
 // ────────────────────────────────────────────────
class AuthService {
  private endpoints = BACKEND_CONFIG.endpoints;
  private refreshPromise: Promise<ApiResponse<TokenPair>> | null = null;

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
    } catch (error) {
      console.error('Base64 decode error in BIMFlow Suite:', error);
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

  // ─── Login ────────────────────────────────────────
  async login(credentials: LoginCredentials): Promise<ApiResponse<ServiceAuthResponse>> {
    try {
      const raw = await apiClient.post<BackendAuthResponse>(
        this.endpoints.auth.login,
        {
          username_or_email: credentials.username_or_email,
          password: credentials.password,
        }
      );
      if (!raw.success || !raw.data) {
        return {
          success: false,
          status: raw.status || 401,
          message: raw.message || 'Login failed in BIMFlow Suite',
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
        first_name: '',
        last_name: '',
        phone_number: '',
        location: '',
        company: '',
        job_title: '',
      };
      localStorage.setItem('user_data', JSON.stringify(userProfile));
     
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth-state-changed', {
          detail: { isAuthenticated: true }
        }));
      }
      return {
        success: true,
        data: {
          user: userProfile,
          tokens,
        },
        status: raw.status,
        message: raw.message || 'Login successful in BIMFlow Suite',
      };
    } catch (error: any) {
      console.error('Login service error in BIMFlow Suite:', error);
      return {
        success: false,
        status: error.status || 401,
        message: error.message || 'Login failed in BIMFlow Suite',
      };
    }
  }

  // ─── Register ─────────────────────────────────────
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
          message: raw.message || 'Registration failed in BIMFlow Suite',
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
      };
      localStorage.setItem('user_data', JSON.stringify(userProfile));
     
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth-state-changed', {
          detail: { isAuthenticated: true }
        }));
      }
      return {
        success: true,
        data: {
          user: userProfile,
          tokens,
        },
        status: raw.status,
        message: raw.message || 'Registration successful in BIMFlow Suite',
      };
    } catch (error: any) {
      return {
        success: false,
        status: error.status || 400,
        message: error.message || 'Registration failed in BIMFlow Suite',
      };
    }
  }

  // ─── Logout ───────────────────────────────────────
  async logout(): Promise<ApiResponse> {
    try {
      await apiClient.post(this.endpoints.auth.logout, {});
    } catch (error) {
      console.warn('Logout API call failed in BIMFlow Suite, clearing tokens locally:', error);
    } finally {
      this.clearAllData();
     
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth-state-changed', {
          detail: { isAuthenticated: false }
        }));
      }
    }
    return {
      data: null,
      message: 'Logged out successfully from BIMFlow Suite',
      status: 200,
      success: true,
    };
  }

  // ─── Get Current User ─────────────────────────────
  async getCurrentUser(): Promise<ApiResponse<UserProfile>> {
    const storedUser = this.getStoredUser();
    if (storedUser && this.isAuthenticated()) {
      return {
        data: storedUser,
        status: 200,
        success: true,
        message: 'User retrieved from storage in BIMFlow Suite',
      };
    }
    if (this.isAuthenticated()) {
      try {
        const resp = await apiClient.get<UserProfile>(this.endpoints.users.profile);
       
        if (resp.success && resp.data) {
          localStorage.setItem('user_data', JSON.stringify(resp.data));
        }
       
        return resp;
      } catch (error) {
        console.error('Failed to fetch user profile in BIMFlow Suite:', error);
        return {
          success: false,
          status: 401,
          message: 'Failed to fetch user profile in BIMFlow Suite',
        };
      }
    }
    return {
      success: false,
      status: 401,
      message: 'Not authenticated in BIMFlow Suite',
    };
  }

  // ─── Token Refresh ────────────────────────────────
  async refreshAccessToken(): Promise<ApiResponse<TokenPair>> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }
    const refresh = getRefreshToken();
    if (!refresh) {
      return {
        success: false,
        status: 401,
        message: 'No refresh token available in BIMFlow Suite',
      };
    }
    this.refreshPromise = apiClient.post<TokenPair>(
      this.endpoints.auth.refresh,
      { refresh }
    ).then(resp => {
      if (resp.success && resp.data) {
        setTokens(resp.data);
      }
      this.refreshPromise = null;
      return resp;
    }).catch(error => {
      this.refreshPromise = null;
      if (error.status === 401) {
        this.clearAllData();
      }
      throw error;
    });
    return this.refreshPromise;
  }

  // ─── Password Reset & Activation ──────────────────
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
    return apiClient.post<SetPasswordResponse>(
      this.endpoints.auth.activateAccount,
      payload
    );
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

  // ─── Auth Check ───────────────────────────────────
  isAuthenticated(): boolean {
    const token = getAccessToken();
    if (!token) return false;
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
     
      const payload = JSON.parse(jsonPayload);
      const exp = payload.exp;
     
      if (typeof exp !== 'number') return false;
     
      // 30 second buffer for BIMFlow Suite network lag
      return exp * 1000 > Date.now() + 30000;
    } catch (err) {
      console.warn('[auth] Failed to parse JWT in BIMFlow Suite', err);
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
      ['access_token', 'refresh_token', 'user_data', 'auth_token', 'user'].forEach(key => {
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

  // ─── BIMFlow Suite Specific: Base64 Encoding/Decoding ─────────────────
  decodeBase64(encoded: string): string {
    return this.decodeBase64String(encoded);
  }

  encodeBase64(text: string): string {
    try {
      const utf8Bytes = unescape(encodeURIComponent(text));
      return btoa(utf8Bytes);
    } catch (error) {
      console.error('Base64 encode error in BIMFlow Suite:', error);
      return btoa(text);
    }
  }
}

// Singleton instance
export const authService = new AuthService();