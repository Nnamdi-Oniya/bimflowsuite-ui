import { apiClient, ApiResponse } from './apiClient';
import { BACKEND_CONFIG } from '../config/api';

// Types
export interface Project {
  id: number;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'archived' | 'completed';
  created_at: string;
  updated_at: string;
  created_by: number;
  thumbnail?: string;
  tags: string[];
  settings?: Record<string, any>;
}

export interface ProjectCreateData {
  name: string;
  description?: string;
  status?: 'draft' | 'active';
  tags?: string[];
  settings?: Record<string, any>;
}

export interface ProjectUpdateData {
  name?: string;
  description?: string;
  status?: 'draft' | 'active' | 'archived' | 'completed';
  tags?: string[];
  settings?: Record<string, any>;
}

export interface TeamMember {
  id: number;
  user: number;
  project: number;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  joined_at: string;
  permissions: string[];
}

export interface ProjectActivity {
  id: number;
  project: number;
  user: number;
  action: string;
  details: Record<string, any>;
  created_at: string;
}

export interface ProjectListParams {
  page?: number;
  page_size?: number;
  search?: string;
  status?: string;
  ordering?: string;
}

export interface ProjectListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Project[];
}

class ProjectService {
  private endpoints = BACKEND_CONFIG.endpoints.projects;

  // Get projects list
  async getProjects(params?: ProjectListParams): Promise<ApiResponse<ProjectListResponse>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.ordering) queryParams.append('ordering', params.ordering);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `${this.endpoints.list}?${queryString}` : this.endpoints.list;
    
    return apiClient.get<ProjectListResponse>(endpoint);
  }

  // Get project by ID
  async getProject(id: number): Promise<ApiResponse<Project>> {
    return apiClient.get<Project>(this.endpoints.detail(id));
  }

  // Create project
  async createProject(data: ProjectCreateData): Promise<ApiResponse<Project>> {
    return apiClient.post<Project>(this.endpoints.create, data);
  }

  // Update project
  async updateProject(id: number, data: ProjectUpdateData): Promise<ApiResponse<Project>> {
    return apiClient.patch<Project>(this.endpoints.update(id), data);
  }

  // Delete project
  async deleteProject(id: number): Promise<ApiResponse> {
    return apiClient.delete(this.endpoints.delete(id));
  }

  // Archive project
  async archiveProject(id: number): Promise<ApiResponse<Project>> {
    return apiClient.post<Project>(this.endpoints.archive(id), {});
  }

  // Restore project
  async restoreProject(id: number): Promise<ApiResponse<Project>> {
    return apiClient.post<Project>(this.endpoints.restore(id), {});
  }

  // Duplicate project
  async duplicateProject(id: number): Promise<ApiResponse<Project>> {
    return apiClient.post<Project>(this.endpoints.duplicate(id), {});
  }

  // Export project
  async exportProject(id: number): Promise<Blob> {
    return apiClient.downloadFile(this.endpoints.export(id));
  }

  // Get team members
  async getTeamMembers(projectId: number): Promise<ApiResponse<TeamMember[]>> {
    return apiClient.get<TeamMember[]>(this.endpoints.teamMembers(projectId));
  }

  // Add team member
  async addTeamMember(projectId: number, userId: number, role: TeamMember['role']): Promise<ApiResponse<TeamMember>> {
    return apiClient.post<TeamMember>(this.endpoints.teamMembers(projectId), {
      user: userId,
      role,
    });
  }

  // Update team member
  async updateTeamMember(projectId: number, userId: number, data: Partial<TeamMember>): Promise<ApiResponse<TeamMember>> {
    return apiClient.patch<TeamMember>(this.endpoints.teamMemberDetail(projectId, userId), data);
  }

  // Remove team member
  async removeTeamMember(projectId: number, userId: number): Promise<ApiResponse> {
    return apiClient.delete(this.endpoints.teamMemberDetail(projectId, userId));
  }

  // Get project files
  async getProjectFiles(projectId: number): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>(this.endpoints.files(projectId));
  }

  // Get project activities
  async getProjectActivities(projectId: number): Promise<ApiResponse<ProjectActivity[]>> {
    return apiClient.get<ProjectActivity[]>(this.endpoints.activities(projectId));
  }
}

export const projectService = new ProjectService();