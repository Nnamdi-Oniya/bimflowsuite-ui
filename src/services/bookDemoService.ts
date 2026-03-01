// src/services/bookDemoService.ts
import { publicApiClient } from './publicApiClient';

// Types matching your backend serializer
export interface BookDemoRequest {
  request_type: 'request_demo' | 'compliance_validation' | 'request_a_trial' | 'general_inquiry' | 'others';
  firstname: string;
  lastname: string;
  email: string;
  company_name: string;
  company_address: string;
  country: string;
  sector: string;
  job_title: string;
  company_position: string;
  phone_number: string;
  additional_details?: string;
  consent_marketing: boolean;
  consent_privacy: boolean;
  project_params?: any;
}

export interface BookDemoResponse {
  message: string;
  submission: {
    id: number;
    request_type: string;
    firstname: string;
    lastname: string;
    email: string;
    company_name: string;
    created_at: string;
    project_params?: any;
  };
}

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  status: number;
  success: boolean;
}

class BookDemoService {
  private baseEndpoint = '/user/request-submission/';

  async submitDemoRequest(
    data: BookDemoRequest, 
    projectParams?: any
  ): Promise<ApiResponse<BookDemoResponse>> {
    try {
      const requestData: any = {
        ...data,
        request_type: data.request_type === 'general_inquiry' ? 'general_enquiries' : 
                      data.request_type === 'others' ? 'other' : data.request_type,
      };

      // Remove project_params from the main request body if it exists
      if ('project_params' in requestData) {
        delete requestData.project_params;
      }

      // If we have projectParams, send them separately or as a nested object
      if (projectParams) {
        requestData.project_params = projectParams;
      }

      const response = await publicApiClient.post<BookDemoResponse>(this.baseEndpoint, requestData);
      return response;
    } catch (error: any) {
      throw error;
    }
  }

  // Store project form data from generate page
  storeProjectFormData(data: any): void {
    try {
      // Ensure we're not storing additional_details
      const cleanData = { ...data };
      delete cleanData.additional_details;
      sessionStorage.setItem('pending_project_data', JSON.stringify(cleanData));
    } catch (error) {
      // Silently handle storage error
    }
  }

  getStoredProjectFormData(): any | null {
    try {
      const data = sessionStorage.getItem('pending_project_data');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      return null;
    }
  }

  clearStoredProjectFormData(): void {
    try {
      sessionStorage.removeItem('pending_project_data');
    } catch (error) {
      // Silently handle storage error
    }
  }

  // Check if email exists
  async checkEmailExists(email: string): Promise<{ exists: boolean; message?: string }> {
    try {
      const response = await publicApiClient.post<{ exists: boolean }>('/user/check-email/', {
        email
      });
      
      if (response.data) {
        return { exists: response.data.exists };
      }
      return { exists: false };
    } catch (error: any) {
      return { exists: false };
    }
  }

  // Get available sectors
  getAvailableSectors(): Array<{ value: string; label: string }> {
    return [
      { value: 'architecture', label: 'Architecture' },
      { value: 'engineering', label: 'Engineering' },
      { value: 'construction', label: 'Construction' },
      { value: 'real_estate', label: 'Real Estate' },
      { value: 'facility_management', label: 'Facility Management' },
      { value: 'government', label: 'Government' },
      { value: 'education', label: 'Education' },
      { value: 'healthcare', label: 'Healthcare' },
      { value: 'manufacturing', label: 'Manufacturing' },
      { value: 'energy', label: 'Energy' },
      { value: 'telecom', label: 'Telecommunications' },
      { value: 'transportation', label: 'Transportation' },
      { value: 'other', label: 'Other' },
    ];
  }

  // Get request types
  getRequestTypes(): Array<{ value: BookDemoRequest['request_type']; label: string }> {
    return [
      { value: 'request_demo', label: 'Request a Demo' },
      { value: 'compliance_validation', label: 'Compliance Validation' },
      { value: 'request_a_trial', label: 'Request a Trial' },
      { value: 'general_inquiry', label: 'General Inquiry' },
      { value: 'others', label: 'Others' },
    ];
  }
}

export const bookDemoService = new BookDemoService();