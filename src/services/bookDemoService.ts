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

      if (projectParams) {
        requestData.project_params = projectParams;
      }

      const response = await publicApiClient.post<BookDemoResponse>(this.baseEndpoint, requestData);
      
      if (projectParams) {
        this.clearStoredProjectParams();
      }
      
      return response;
    } catch (error: any) {
      throw error;
    }
  }

  async submitModelGenerationRequest(
    userData: {
      firstname: string;
      lastname: string;
      email: string;
      company_name?: string;
      company_address?: string;
      country?: string;
      sector?: string;
      job_title?: string;
      company_position?: string;
      phone_number?: string;
    },
    projectParams: any,
    isDemoRequest: boolean = false
  ): Promise<ApiResponse> {
    try {
      const requestData: any = {
        request_type: isDemoRequest ? 'request_demo' : 'generate_model',
        firstname: userData.firstname || "Model",
        lastname: userData.lastname || "Generator",
        email: userData.email,
        company_name: userData.company_name || "BIMFlow User",
        company_address: userData.company_address || "Not specified",
        country: userData.country || "Global",
        sector: userData.sector || "Construction",
        job_title: userData.job_title || "BIM User",
        company_position: userData.company_position || "User",
        phone_number: userData.phone_number || "+1234567890",
        additional_details: isDemoRequest 
          ? `Demo request with model generation for project: ${projectParams.project_name || 'Unnamed Project'}`
          : `Model generation request from ${userData.firstname} ${userData.lastname}`,
        consent_marketing: true,
        consent_privacy: true,
        project_params: projectParams
      };

      if (isDemoRequest) {
        requestData.request_type = 'request_demo';
      }

      const response = await publicApiClient.post<BookDemoResponse>(this.baseEndpoint, requestData);
      return response;
    } catch (error: any) {
      throw error;
    }
  }

  storeProjectParams(params: any): void {
    try {
      sessionStorage.setItem('pending_project_params', JSON.stringify(params));
    } catch (error) {
      // Silently handle storage error
    }
  }

  getStoredProjectParams(): any | null {
    try {
      const params = sessionStorage.getItem('pending_project_params');
      return params ? JSON.parse(params) : null;
    } catch (error) {
      return null;
    }
  }

  clearStoredProjectParams(): void {
    try {
      sessionStorage.removeItem('pending_project_params');
      sessionStorage.removeItem('pending_model_data');
    } catch (error) {
      // Silently handle storage error
    }
  }

  storeModelFormData(formData: any): void {
    try {
      sessionStorage.setItem('pending_model_data', JSON.stringify(formData));
    } catch (error) {
      // Silently handle storage error
    }
  }

  getStoredModelFormData(): any | null {
    try {
      const data = sessionStorage.getItem('pending_model_data');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      return null;
    }
  }

  hasPendingModelRequest(): boolean {
    return !!sessionStorage.getItem('pending_project_params') || 
           !!sessionStorage.getItem('pending_model_data');
  }

  formatProjectDetails(projectData: any): string {
    if (!projectData) return '';
    
    const details = [
      "=== MODEL GENERATION REQUEST ===",
      `Project: ${projectData.projectName || 'Unnamed Project'}`,
      `Type: ${projectData.projectType || 'Not specified'}`,
      `Description: ${projectData.description || 'No description provided'}`,
      "",
      "=== PROJECT SPECIFICATIONS ==="
    ];

    if (projectData.floors) details.push(`Floors/Levels: ${projectData.floors}`);
    if (projectData.area) details.push(`Area: ${projectData.area} m²`);
    if (projectData.location) details.push(`Location: ${projectData.location}`);
    if (projectData.budget) details.push(`Budget: $${projectData.budget}`);
    if (projectData.timeline) details.push(`Timeline: ${projectData.timeline}`);
    
    if (projectData.mainSpanLength) details.push(`Main Span Length: ${projectData.mainSpanLength}m`);
    if (projectData.roadLength) details.push(`Road Length: ${projectData.roadLength}km`);
    if (projectData.numberOfLanes) details.push(`Number of Lanes: ${projectData.numberOfLanes}`);
    
    if (projectData.specialRequirements) {
      details.push("");
      details.push("=== SPECIAL REQUIREMENTS ===");
      details.push(projectData.specialRequirements);
    }

    return details.join('\n');
  }

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