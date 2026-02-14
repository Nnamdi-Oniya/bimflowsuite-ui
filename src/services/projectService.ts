// src/services/projectService.ts
import { apiClient, type ApiResponse } from './apiClient';

export interface Project {
  id: number;  // Backend generates this - NEVER send from frontend
  name: string;
  project_number: string; // Backend generates this
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
  description: string;
  // REMOVED: project_number - backend generates
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
    const response = await apiClient.get<any>(`${this.base}/`);
    
    // Always return a consistent structure
    const result: ApiResponse<Project[]> = {
      success: false,
      data: [],
      status: response.status,
      message: response.message || 'Unknown error'
    };

    if (response.success) {
      // Case 1: response.data is already an array
      if (Array.isArray(response.data)) {
        result.success = true;
        result.data = response.data as Project[];
        result.message = response.message;
      }
      // Case 2: response.data has a results property (pagination)
      else if (response.data && typeof response.data === 'object' && 'results' in response.data) {
        result.success = true;
        result.data = response.data.results as Project[];
        result.message = response.message;
      }
      // Case 3: response.data is a single object (wrap in array)
      else if (response.data && typeof response.data === 'object' && 'id' in response.data) {
        result.success = true;
        result.data = [response.data] as Project[];
        result.message = response.message;
      }
      // Case 4: response.data is something else
      else {
        result.success = false;
        result.message = 'Unexpected API response structure';
      }
    } else {
      result.message = response.message || 'Failed to fetch projects';
    }
    
    return result;
  }

  async getProject(id: number): Promise<ApiResponse<Project>> {
    return apiClient.get<Project>(`${this.base}/${id}/`);
  }

  async createProject(data: CreateProjectData): Promise<ApiResponse<Project>> {
    // IMPORTANT: Never send 'id' field - backend generates it
    return apiClient.post<Project>(`${this.base}/create/`, data);
  }

  async updateProject(id: number, data: Partial<CreateProjectData>): Promise<ApiResponse<Project>> {
    return apiClient.put<Project>(`${this.base}/${id}/`, data);
  }

  async deleteProject(id: number): Promise<ApiResponse<null>> {
    return apiClient.delete<null>(`${this.base}/${id}/`);
  }
}

export const projectService = new ProjectService();