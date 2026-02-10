// src/config/apiClient.ts
import { BACKEND_CONFIG, type TokenPair, setTokens, clearTokens, getAccessToken, getRefreshToken } from '../config/api';

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

// API Client Class
class ApiClient {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.baseUrl = BACKEND_CONFIG.baseUrl + BACKEND_CONFIG.apiPrefix;
    this.timeout = BACKEND_CONFIG.timeout;
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

    const requestHeaders: Record<string, string> = {
      ...headers,
    };

    const token = getAccessToken();
    if (token && !endpoint.includes('/auth/') && !endpoint.includes('/token/')) {
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

      // Handle 401 Unauthorized (login/refresh logic)
      if (response.status === 401 && getRefreshToken() && !endpoint.includes('/token/refresh/')) {
        try {
          const newTokens = await this.refreshToken();
          if (newTokens) {
            requestHeaders['Authorization'] = `Bearer ${getAccessToken()}`;
            const retryResponse = await fetch(url, { ...config, headers: requestHeaders });
            return await this.handleResponse<T>(retryResponse);
          }
        } catch (refreshError) {
          clearTokens();
          window.dispatchEvent(new CustomEvent('auth-expired'));
          throw new Error('Session expired. Please login again.');
        }
      }

      return await this.handleResponse<T>(response);
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        throw {
          message: 'Request timeout. Please try again.',
          status: 408,
          code: 'TIMEOUT'
        } as ApiError;
      }

      // If error is already an ApiError, re-throw it
      if (error && typeof error === 'object' && 'status' in error) {
        throw error;
      }

      // Only throw network error for actual network failures
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw {
          message: 'Network error occurred. Please check your internet connection.',
          status: 0,
          code: 'NETWORK_ERROR'
        } as ApiError;
      }

      throw {
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        status: 0,
        code: 'UNKNOWN_ERROR'
      } as ApiError;
    }
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const responseText = await response.text();

    // Debug: Log the response for troubleshooting
    console.log(`API Response [${response.status}]:`, {
      url: response.url,
      status: response.status,
      statusText: response.statusText,
      body: responseText
    });

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
        // If not JSON, treat as plain text
        responseData = { detail: responseText };
      }
    }

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      let validationErrors: ValidationError[] = [];

      // Handle Django REST Framework error formats
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

      // Handle field-specific errors (like {"username": ["This field is required."]})
      if (responseData && typeof responseData === 'object' && !Array.isArray(responseData)) {
        validationErrors = Object.entries(responseData)
          .filter(([key]) => key !== 'detail' && key !== 'error' && key !== 'message')
          .map(([field, messages]) => ({
            field,
            messages: Array.isArray(messages) ? messages : [String(messages)],
          }));
        
        // If we have field errors but no general error message, create one
        if (validationErrors.length > 0 && !errorMessage.includes('Validation')) {
          errorMessage = 'Validation failed. Please check your input.';
        }
        
        // Format error message to be more user-friendly for the first error
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

      console.error('API Error:', apiError);
      throw apiError;
    }

    return {
      data: responseData as T,
      message: responseData.message || responseData.detail,
      status: response.status,
      success: response.status >= 200 && response.status < 300,
    };
  }

  private async refreshToken(): Promise<TokenPair | null> {
    const currentRefreshToken = getRefreshToken();
    if (!currentRefreshToken) return null;

    try {
      const response = await fetch(`${this.baseUrl}/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: currentRefreshToken }),
      });

      if (response.ok) {
        const tokens: TokenPair = await response.json();
        setTokens(tokens);
        return tokens;
      }
      return null;
    } catch {
      return null;
    }
  }

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