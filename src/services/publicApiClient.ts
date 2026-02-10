// ==============================================
// PUBLIC API CLIENT - No authentication required
// ==============================================

import { BASE_URL, getBackendUrl, getApiPrefix } from '../config/api';

export interface PublicApiResponse<T = any> {
  data?: T;
  message?: string;
  status: number;
  success: boolean;
}

export interface PublicApiError {
  message: string;
  status: number;
  code?: string;
  details?: any;
}

const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  let cookieValue: string | null = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === `${name}=`) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
};

class PublicApiClient {
  private baseUrl: string = BASE_URL;
  private timeout: number = 30000;

  constructor() {
    if (typeof window !== 'undefined') {
      console.log("🔧 Public API Client Initialized:", this.baseUrl);
      console.log("🔧 Backend URL:", getBackendUrl());
      console.log("🔧 API Prefix:", getApiPrefix());
      console.log("🔧 Environment:", import.meta.env ? 'Vite' : 'React');
    }
  }

  private mapRequestTypes(data: any): any {
    if (!data?.request_type) return data;

    const typeMap: Record<string, string> = {
      'general_inquiry': 'general_enquiries',
      'others': 'other',
    };

    const mappedType = typeMap[data.request_type];
    return mappedType ? { ...data, request_type: mappedType } : data;
  }

  private async request<T>(
    endpoint: string,
    method: string = 'POST',
    data?: any
  ): Promise<PublicApiResponse<T>> {
    const mappedData = endpoint.includes('request-submission')
      ? this.mapRequestTypes(data)
      : data;

    const url = `${this.baseUrl}${endpoint}`;

    if (typeof window !== 'undefined') {
      console.log(`🌐 Public API Call: ${method} ${url}`);
      console.log(`📤 Data being sent:`, mappedData ? {
        ...mappedData,
        phone_number: mappedData.phone_number ? '***' : undefined
      } : 'No data');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      signal: controller.signal,
      credentials: 'include',
    };

    const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
    if (!safeMethods.includes(method)) {
      let csrftoken = getCookie('csrftoken');
      if (!csrftoken) {
        console.log('🔑 No CSRF token found, fetching OPTIONS to get cookie');
        try {
          await fetch(url, { method: 'OPTIONS', credentials: 'include' });
          csrftoken = getCookie('csrftoken');
          if (!csrftoken) {
            console.warn('⚠️ Could not get CSRF token after OPTIONS request.');
          }
        } catch (optionsError) {
          console.error('❌ Failed to fetch OPTIONS for CSRF:', optionsError);
        }
      }
      if (csrftoken) {
        (config.headers as Record<string, string>)['X-CSRFToken'] = csrftoken;
        console.log('🔑 Added CSRF token to headers');
      }
    }

    if (mappedData && method !== 'GET') {
      config.body = JSON.stringify(mappedData);
    }

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      if (typeof window !== 'undefined') {
        console.log(`📡 Public API Response: ${response.status} ${response.statusText}`);
        console.log(`📡 Response URL: ${response.url}`);
      }

      return await this.handleResponse<T>(response);
    } catch (error) {
      clearTimeout(timeoutId);

      if (typeof window !== 'undefined') {
        console.error(`❌ Public API Error:`, error);
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw { message: 'Request timeout. Please try again.', status: 408, code: 'TIMEOUT' } as PublicApiError;
      }

      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw {
          message: 'Network error. Please check: 1) Backend is running 2) CORS is enabled 3) URL is correct',
          status: 0,
          code: 'NETWORK_ERROR',
          details: {
            url,
            backendUrl: getBackendUrl(),
            apiPrefix: getApiPrefix(),
            suggestion: 'Make sure Django server is running on http://localhost:8000'
          }
        } as PublicApiError;
      }

      throw {
        message: error instanceof Error ? error.message : 'Network error occurred',
        status: 0,
        code: 'NETWORK_ERROR'
      } as PublicApiError;
    }
  }

  private async handleResponse<T>(response: Response): Promise<PublicApiResponse<T>> {
    const responseText = await response.text();

    if (typeof window !== 'undefined') {
      console.log(`📄 Raw Response:`, responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''));
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

      if (responseData.detail) errorMessage = responseData.detail;
      else if (responseData.message) errorMessage = responseData.message;
      else if (responseData.error) errorMessage = responseData.error;
      else if (typeof responseData === 'string') errorMessage = responseData;

      if (responseData.errors) {
        const validationErrors = Object.entries(responseData.errors)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? (messages as string[]).join(', ') : messages}`)
          .join('; ');
        errorMessage = validationErrors;
      }

      if (typeof responseData === 'object') {
        const fieldErrors = Object.entries(responseData)
          .filter(([key]) => !['detail', 'message', 'error'].includes(key))
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? (messages as string[]).join(', ') : messages}`)
          .join('; ');
        if (fieldErrors) errorMessage = fieldErrors;
      }

      throw {
        message: errorMessage,
        status: response.status,
        code: responseData.code || `HTTP_${response.status}`,
        data: responseData
      } as PublicApiError;
    }

    return {
      data: responseData as T,
      message: responseData.message || responseData.detail,
      status: response.status,
      success: response.status >= 200 && response.status < 300,
    };
  }

  async post<T>(endpoint: string, data: any): Promise<PublicApiResponse<T>> {
    return this.request<T>(endpoint, 'POST', data);
  }

  async get<T>(endpoint: string): Promise<PublicApiResponse<T>> {
    return this.request<T>(endpoint, 'GET');
  }

  getFullUrl(endpoint: string): string {
    return `${this.baseUrl}${endpoint}`;
  }
}

export const publicApiClient = new PublicApiClient();

export type ApiResponse<T = any> = PublicApiResponse<T>;
export type ApiError = PublicApiError;

export { getBackendUrl, getApiPrefix, BASE_URL };