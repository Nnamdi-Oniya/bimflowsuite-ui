// src/services/apiClient.ts
import { BACKEND_CONFIG, clearTokens, getAccessToken } from '../config/api';

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

class ApiClient {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.baseUrl = BACKEND_CONFIG.baseUrl + BACKEND_CONFIG.apiPrefix;
    this.timeout = BACKEND_CONFIG.timeout;
  }

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

    const requestHeaders: Record<string, string> = { ...headers };

    const token = getAccessToken();
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

      if (response.status === 401 && !endpoint.includes('/auth/login/')) {
        clearTokens();
        window.dispatchEvent(new CustomEvent('auth-expired'));
        const error: ApiError = {
          message: 'Session expired. Please login again.',
          status: 401,
          code: 'SESSION_EXPIRED'
        };
        throw error;
      }

      return await this.handleResponse<T>(response);
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof DOMException && error.name === 'AbortError') {
        const abortError: ApiError = {
          message: 'Request timeout. Please try again.',
          status: 408,
          code: 'TIMEOUT'
        };
        throw abortError;
      }

      if (this.isNetworkError(error)) {
        const networkError: ApiError = {
          message: 'Network error occurred. Please check your internet connection or try again later.',
          status: 0,
          code: 'NETWORK_ERROR'
        };
        throw networkError;
      }

      // If it's already an ApiError, rethrow it
      if (error && typeof error === 'object' && 'status' in error && 'message' in error) {
        throw error;
      }

      // Convert unknown errors to ApiError
      const unknownError: ApiError = {
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        status: 0,
        code: 'UNKNOWN_ERROR',
        data: error
      };
      throw unknownError;
    }
  }

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

      // Extract error message from various possible formats
      if (responseData.detail) {
        errorMessage = responseData.detail;
      } else if (responseData.error) {
        errorMessage = responseData.error; // This captures "Invalid credentials"
      } else if (responseData.message) {
        errorMessage = responseData.message;
      } else if (typeof responseData === 'string') {
        errorMessage = responseData;
      } else if (Array.isArray(responseData)) {
        errorMessage = responseData
          .map((err) => (typeof err === 'object' ? JSON.stringify(err) : err))
          .join(', ');
      }

      // Build validation errors for field-specific errors
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

      // Create a proper ApiError object
      const apiError: ApiError = {
        message: errorMessage,
        status: response.status,
        errors: validationErrors.length > 0 ? validationErrors : undefined,
        code: responseData.code || `HTTP_${response.status}`,
        data: responseData, // Include the full response data for debugging
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

  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'GET', undefined, headers);
  }

  async post<T>(
    endpoint: string,
    data: any,
    headers?: Record<string, string>,
    isFormData = false
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'POST', data, headers, isFormData);
  }

  async put<T>(
    endpoint: string,
    data: any,
    headers?: Record<string, string>,
    isFormData = false
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'PUT', data, headers, isFormData);
  }

  async patch<T>(
    endpoint: string,
    data: any,
    headers?: Record<string, string>,
    isFormData = false
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'PATCH', data, headers, isFormData);
  }

  async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'DELETE', undefined, headers);
  }

  async uploadFile(
    endpoint: string,
    file: File,
    additionalData: Record<string, any> = {},
    onProgress?: (percentage: number) => void
  ): Promise<ApiResponse> {
    if (!onProgress) {
      const formData = new FormData();
      formData.append('file', file);
      Object.entries(additionalData).forEach(([key, value]) => formData.append(key, value));
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
          const error: ApiError = {
            message: `Upload failed: ${xhr.statusText}`,
            status: xhr.status,
            code: 'UPLOAD_ERROR'
          };
          reject(error);
        }
      };

      xhr.onerror = () => {
        const error: ApiError = {
          message: 'Network error during upload',
          status: 0,
          code: 'UPLOAD_ERROR'
        };
        reject(error);
      };

      const formData = new FormData();
      formData.append('file', file);
      Object.entries(additionalData).forEach(([key, value]) => formData.append(key, value));

      xhr.send(formData);
    });
  }

  async downloadFile(endpoint: string): Promise<Blob> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = getAccessToken();
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await fetch(url, { headers });

    if (!response.ok) {
      const error: ApiError = {
        message: `Download failed: ${response.statusText}`,
        status: response.status,
        code: 'DOWNLOAD_ERROR'
      };
      throw error;
    }

    return response.blob();
  }
}

export const apiClient = new ApiClient();