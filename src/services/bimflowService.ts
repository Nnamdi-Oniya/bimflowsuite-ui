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
}

export interface BookDemoResponse {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  company_name: string;
  created_at: string;
}

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  status: number;
  success: boolean;
}

class BookDemoService {
  // FIX: Use full endpoint path including api/v1 prefix
  private baseEndpoint = '/user/request-submission/';

  // Submit demo request - PUBLIC endpoint, no auth required
  async submitDemoRequest(data: BookDemoRequest): Promise<ApiResponse<BookDemoResponse>> {
    try {
      console.log("🚀 ============ SUBMIT DEMO REQUEST START ============");
      console.log("📤 Submitting to endpoint:", this.baseEndpoint);
      console.log("📤 Full data being sent:", { 
        ...data, 
        phone_number: data.phone_number ? '***' : 'No phone',
        consent_marketing: data.consent_marketing,
        consent_privacy: data.consent_privacy
      });
      
      // ✅ FIXED: Map frontend request types to backend's expected values
      const backendData = {
        ...data,
        // Map request types
        request_type: this.mapRequestType(data.request_type)
      };
      
      console.log("🔄 Mapped data for backend:", {
        original_type: data.request_type,
        mapped_type: backendData.request_type
      });
      
      const response = await publicApiClient.post<BookDemoResponse>(this.baseEndpoint, backendData);
      
      console.log("✅ Service response:", response);
      console.log("✅ Response status:", response.status);
      console.log("✅ Response success:", response.success);
      console.log("✅ Response data:", response.data);
      
      console.log("🏁 ============ SUBMIT DEMO REQUEST END ============");
      
      return response;
    } catch (error: any) {
      console.error("❌ ============ DEMO REQUEST FAILED ============");
      console.error("❌ Error details:", error);
      console.error("❌ Error message:", error.message);
      console.error("❌ Error status:", error.status);
      console.error("❌ Error code:", error.code);
      console.error("❌ =============================================");
      
      // Re-throw the error so the component can handle it
      throw error;
    }
  }

  // Helper method to map request types
  private mapRequestType(requestType: string): string {
    const typeMap: Record<string, string> = {
      'general_inquiry': 'general_enquiries',
      'others': 'other',
      // Add other mappings if needed
    };
    
    console.log(`🔄 Mapping request type: ${requestType} -> ${typeMap[requestType] || requestType}`);
    return typeMap[requestType] || requestType;
  }

  // Check if email already exists (optional)
  async checkEmailExists(email: string): Promise<{ exists: boolean; message?: string }> {
    try {
      console.log("🔍 Checking email existence:", email);
      
      // Note: You don't have this endpoint yet, so this will fail
      const response = await publicApiClient.post<{ exists: boolean }>('/user/check-email/', {
        email
      });
      
      if (response.data) {
        console.log("📧 Email check result:", response.data.exists);
        return { exists: response.data.exists };
      }
      return { exists: false };
    } catch (error: any) {
      console.log("ℹ️ Email check not available, continuing without check");
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

  // Get request types - updated to match backend
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