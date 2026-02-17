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
    // Keep minimal initialization without console logs
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
        try {
          await fetch(url, { method: 'OPTIONS', credentials: 'include' });
          csrftoken = getCookie('csrftoken');
        } catch (optionsError) {
          // Silently handle OPTIONS error
        }
      }
      if (csrftoken) {
        (config.headers as Record<string, string>)['X-CSRFToken'] = csrftoken;
      }
    }

    if (mappedData && method !== 'GET') {
      config.body = JSON.stringify(mappedData);
    }

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);
      return await this.handleResponse<T>(response);
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        throw { message: 'Request timeout. Please try again.', status: 408, code: 'TIMEOUT' } as PublicApiError;
      }

      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw {
          message: 'Network error. Please check your connection and try again.',
          status: 0,
          code: 'NETWORK_ERROR',
          details: {
            url,
            suggestion: 'Make sure the backend server is running'
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