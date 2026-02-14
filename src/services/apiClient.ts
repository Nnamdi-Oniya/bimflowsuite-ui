// src/services/apiClient.ts
import { BACKEND_CONFIG, clearTokens, getAccessToken } from '../config/api';

// Types for API responses
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  status: number;
  success: boolean;
}

export interface ValidationError {
  field: string;
  messages: string[];
}

export interface ApiError {
  message: string;
  status: number;
  errors?: ValidationError[];
  code?: string;
  data?: any;
}

/**
 * API Client - No refresh token logic
 * Handles all HTTP requests to the backend API
 */
class ApiClient {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.baseUrl = BACKEND_CONFIG.baseUrl + BACKEND_CONFIG.apiPrefix;
    this.timeout = BACKEND_CONFIG.timeout;
  }

  /**
   * Helper to detect real network-level failures across browsers
   */
  private isNetworkError(error: unknown): boolean {
    if (!(error instanceof TypeError)) return false;

    const msg = (error.message || '').toLowerCase();

    return (
      msg.includes('failed to fetch') ||
      msg.includes('networkerror') ||
      msg.includes('load failed') ||
      msg.includes('network request failed') ||
      msg.includes('the internet connection appears to be offline')
    );
  }

  /**
   * Core request handler
   */
  private async request<T>(
    endpoint: string,
    method: string = 'GET',
    data?: any,
    headers?: Record<string, string>,
    isFormData: boolean = false
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    const requestHeaders: Record<string, string> = {
      ...headers,
    };

    // Get token - already decoded from memory
    const token = getAccessToken();

    // Add token for all requests except login
    if (token && !endpoint.includes('/auth/login/')) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }

    if (!isFormData && method !== 'GET' && !requestHeaders['Content-Type']) {
      requestHeaders['Content-Type'] = 'application/json';
    }

    const config: RequestInit = {
      method,
      headers: requestHeaders,
      signal: controller.signal,
      credentials: 'include',
    };

    if (data && method !== 'GET') {
      config.body = isFormData ? data : JSON.stringify(data);
    }

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      // Handle 401 Unauthorized - NO REFRESH ATTEMPT
      if (response.status === 401 && !endpoint.includes('/auth/login/')) {
        clearTokens();
        window.dispatchEvent(new CustomEvent('auth-expired'));
        throw {
          message: 'Session expired. Please login again.',
          status: 401,
          code: 'SESSION_EXPIRED'
        } as ApiError;
      }

      return await this.handleResponse<T>(response);
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof DOMException && error.name === 'AbortError') {
        throw {
          message: 'Request timeout. Please try again.',
          status: 408,
          code: 'TIMEOUT'
        } as ApiError;
      }

      // ────────────────────────────────────────────────
      //           Improved network error detection
      // ────────────────────────────────────────────────
      if (this.isNetworkError(error)) {
        throw {
          message: 'Network error occurred. Please check your internet connection or try again later.',
          status: 0,
          code: 'NETWORK_ERROR'
        } as ApiError;
      }

      // Re-throw if already an ApiError (from handleResponse or elsewhere)
      if (error && typeof error === 'object' && 'status' in error) {
        throw error;
      }

      // Fallback for any other unexpected error
      throw {
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        status: 0,
        code: 'UNKNOWN_ERROR'
      } as ApiError;
    }
  }

  /**
   * Process API response
   */
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const responseText = await response.text();

    if (response.status === 204) {
      return {
        data: {} as T,
        status: response.status,
        success: true,
      };
    }

    let responseData: any = {};
    if (responseText) {
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = { detail: responseText };
      }
    }

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      let validationErrors: ValidationError[] = [];

      // Parse Django REST Framework error formats
      if (responseData.detail) {
        errorMessage = responseData.detail;
      } else if (responseData.error) {
        errorMessage = responseData.error;
      } else if (responseData.message) {
        errorMessage = responseData.message;
      } else if (typeof responseData === 'string') {
        errorMessage = responseData;
      } else if (Array.isArray(responseData)) {
        errorMessage = responseData.map(err => typeof err === 'object' ? JSON.stringify(err) : err).join(', ');
      }

      // Parse field-specific validation errors
      if (responseData && typeof responseData === 'object' && !Array.isArray(responseData)) {
        validationErrors = Object.entries(responseData)
          .filter(([key]) => key !== 'detail' && key !== 'error' && key !== 'message')
          .map(([field, messages]) => ({
            field,
            messages: Array.isArray(messages) ? messages : [String(messages)],
          }));

        if (validationErrors.length > 0 && errorMessage === `HTTP ${response.status}: ${response.statusText}`) {
          const firstError = validationErrors[0];
          errorMessage = `${firstError.field}: ${firstError.messages.join(', ')}`;
        }
      }

      const apiError: ApiError = {
        message: errorMessage,
        status: response.status,
        errors: validationErrors.length > 0 ? validationErrors : undefined,
        code: responseData.code || `HTTP_${response.status}`,
        data: responseData
      };

      throw apiError;
    }

    return {
      data: responseData as T,
      message: responseData.message || responseData.detail,
      status: response.status,
      success: response.status >= 200 && response.status < 300,
    };
  }

  // HTTP Methods
  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'GET', undefined, headers);
  }

  async post<T>(endpoint: string, data: any, headers?: Record<string, string>, isFormData: boolean = false): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'POST', data, headers, isFormData);
  }

  async put<T>(endpoint: string, data: any, headers?: Record<string, string>, isFormData: boolean = false): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'PUT', data, headers, isFormData);
  }

  async patch<T>(endpoint: string, data: any, headers?: Record<string, string>, isFormData: boolean = false): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'PATCH', data, headers, isFormData);
  }

  async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'DELETE', undefined, headers);
  }

  /**
   * File upload with progress tracking
   */
  async uploadFile(
    endpoint: string,
    file: File,
    additionalData: Record<string, any> = {},
    onProgress?: (percentage: number) => void
  ): Promise<ApiResponse> {
    if (!onProgress) {
      const formData = new FormData();
      formData.append('file', file);
      Object.keys(additionalData).forEach(key => formData.append(key, additionalData[key]));
      return this.post(endpoint, formData, {}, true);
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const url = `${this.baseUrl}${endpoint}`;

      xhr.open('POST', url);
      const token = getAccessToken();
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve({ data: response, status: xhr.status, success: true });
          } catch {
            resolve({ data: xhr.responseText, status: xhr.status, success: true });
          }
        } else {
          reject({ message: `Upload failed: ${xhr.statusText}`, status: xhr.status } as ApiError);
        }
      };

      xhr.onerror = () => {
        reject({ message: 'Network error during upload', status: 0, code: 'UPLOAD_ERROR' } as ApiError);
      };

      const formData = new FormData();
      formData.append('file', file);
      Object.keys(additionalData).forEach(key => formData.append(key, additionalData[key]));

      xhr.send(formData);
    });
  }

  /**
   * File download
   */
  async downloadFile(endpoint: string): Promise<Blob> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = getAccessToken();
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw { message: `Download failed: ${response.statusText}`, status: response.status } as ApiError;
    }

    return response.blob();
  }
}

export const apiClient = new ApiClient();