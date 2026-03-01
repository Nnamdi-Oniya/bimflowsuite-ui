import { apiClient, type ApiResponse, type ApiError } from './apiClient';

export interface Project {
  id: number;  
  name: string;
  project_number: string; 
  description: string;
  phase: string;
  project_type: string;
  client_name?: string;
  client_type?: string;
  project_scale?: string;
  risk_classification?: string;
  project_address?: string;
  project_start_date?: string;
  construction_start_date?: string | null;
  expected_completion_date?: string | null;
  approval_status?: string;
  organization: number;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectData {
  name: string;
  project_number: string; 
  description: string;
  phase: string;
  project_type: string;
  client_name?: string;
  client_type?: string;
  project_scale?: string;
  risk_classification?: string;
  project_address?: string;
  project_start_date?: string | null;
  construction_start_date?: string | null;
  expected_completion_date?: string | null;
  approval_status?: string;
}

class ProjectService {
  private base = '/projects';

  async getProjects(): Promise<ApiResponse<Project[]>> {
    try {
      const response = await apiClient.get<any>(`${this.base}/`);
      
      // Always return a consistent structure
      const result: ApiResponse<Project[]> = {
        success: false,
        data: [],
        status: response.status,
        message: response.message || 'Unknown error'
      };

      if (response.success) {
      
        if (Array.isArray(response.data)) {
          result.success = true;
          result.data = response.data as Project[];
          result.message = response.message;
        }
        
        else if (response.data && typeof response.data === 'object' && 'results' in response.data) {
          result.success = true;
          result.data = response.data.results as Project[];
          result.message = response.message;
        }
       
        else if (response.data && typeof response.data === 'object' && 'id' in response.data) {
          result.success = true;
          result.data = [response.data] as Project[];
          result.message = response.message;
        }
        
        else {
          result.success = false;
          result.message = 'Unexpected API response structure';
        }
      } else {
        result.message = response.message || 'Failed to fetch projects';
      }
      
      return result;
    } catch (error) {
    
      if (error && typeof error === 'object' && 'status' in error) {
        const apiError = error as ApiError;
        return {
          success: false,
          data: [],
          message: apiError.message || 'Failed to fetch projects',
          status: apiError.status
        };
      }
      
      return {
        success: false,
        data: [],
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        status: 500
      };
    }
  }

  async getProject(id: number): Promise<ApiResponse<Project>> {
    try {
      const response = await apiClient.get<Project>(`${this.base}/${id}/`);
      return response;
    } catch (error) {
      if (error && typeof error === 'object' && 'status' in error) {
        const apiError = error as ApiError;
        return {
          success: false,
          data: undefined,
          message: apiError.message || 'Failed to fetch project',
          status: apiError.status
        };
      }
      
      return {
        success: false,
        data: undefined,
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        status: 500
      };
    }
  }

  async createProject(data: CreateProjectData): Promise<ApiResponse<Project>> {
    try {
  
      const response = await apiClient.post<Project>(`${this.base}/create/`, data);
      return response;
    } catch (error) {
     
      if (error && typeof error === 'object' && 'status' in error) {
        const apiError = error as ApiError;
        if (apiError.errors && apiError.errors.length > 0) {
          const errorMessages = apiError.errors.map(e => `${e.field}: ${e.messages.join(', ')}`).join('; ');
          return {
            success: false,
            data: undefined, 
            message: errorMessages || apiError.message || 'Validation failed',
            status: apiError.status
          };
        }
        
        // If there's data in the error, it might contain field errors
        if (apiError.data && typeof apiError.data === 'object') {
          return {
            success: false,
            data: apiError.data as Project, // Cast to Project type
            message: apiError.message || 'Failed to create project',
            status: apiError.status
          };
        }
        
        return {
          success: false,
          data: undefined, // Changed from null to undefined
          message: apiError.message || 'Failed to create project',
          status: apiError.status
        };
      }
      
      // Handle network or other errors
      return {
        success: false,
        data: undefined, // Changed from null to undefined
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        status: 500
      };
    }
  }

  async updateProject(id: number, data: Partial<CreateProjectData>): Promise<ApiResponse<Project>> {
    try {
      const response = await apiClient.put<Project>(`${this.base}/${id}/`, data);
      return response;
    } catch (error) {
      if (error && typeof error === 'object' && 'status' in error) {
        const apiError = error as ApiError;
        return {
          success: false,
          data: undefined,
          message: apiError.message || 'Failed to update project',
          status: apiError.status
        };
      }
      
      return {
        success: false,
        data: undefined,
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        status: 500
      };
    }
  }

  async deleteProject(id: number): Promise<ApiResponse<null>> {
    try {
      const response = await apiClient.delete<null>(`${this.base}/${id}/`);
      return response;
    } catch (error) {
      if (error && typeof error === 'object' && 'status' in error) {
        const apiError = error as ApiError;
        return {
          success: false,
          data: null, // null is allowed for delete operations
          message: apiError.message || 'Failed to delete project',
          status: apiError.status
        };
      }
      
      return {
        success: false,
        data: null, // null is allowed for delete operations
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        status: 500
      };
    }
  }
}

export const projectService = new ProjectService();