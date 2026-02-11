import { apiClient, type ApiResponse } from './apiClient';
import { BACKEND_CONFIG } from '../config/api';
import { type UserProfile } from './authService';

// Types
export interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  company?: string;
  phone?: string;
  avatar?: File;
}

export interface UserListParams {
  page?: number;
  page_size?: number;
  search?: string;
  is_active?: boolean;
  ordering?: string;
}

export interface UserListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: UserProfile[];
}

class UserService {
  private endpoints = BACKEND_CONFIG.endpoints.users;

  async getUsers(params?: UserListParams): Promise<ApiResponse<UserListResponse>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());
    if (params?.ordering) queryParams.append('ordering', params.ordering);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `${this.endpoints.list}?${queryString}` : this.endpoints.list;

    return apiClient.get<UserListResponse>(endpoint);
  }

  async getUserById(id: string | number): Promise<ApiResponse<UserProfile>> {
    return apiClient.get<UserProfile>(this.endpoints.detail(id));
  }

  async updateProfile(data: UpdateProfileData): Promise<ApiResponse<UserProfile>> {
    if (data.avatar) {
      const formData = new FormData();
      formData.append('avatar', data.avatar);
      if (data.first_name) formData.append('first_name', data.first_name);
      if (data.last_name) formData.append('last_name', data.last_name);
      if (data.company) formData.append('company', data.company);
      if (data.phone) formData.append('phone', data.phone);

      return apiClient.post<UserProfile>(this.endpoints.uploadAvatar, formData, {}, true);
    }

    return apiClient.patch<UserProfile>(this.endpoints.profile, data);
  }

  async updateUser(id: string | number, data: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    return apiClient.patch<UserProfile>(this.endpoints.update(id), data);
  }

  async deleteUser(id: string | number): Promise<ApiResponse> {
    return apiClient.delete(this.endpoints.delete(id));
  }

  async getUserProfile(): Promise<ApiResponse<UserProfile>> {
    return apiClient.get<UserProfile>(this.endpoints.profile);
  }

  async uploadAvatar(file: File): Promise<ApiResponse<{ avatar: string }>> {
    const formData = new FormData();
    formData.append('avatar', file);
    return apiClient.post<{ avatar: string }>(this.endpoints.uploadAvatar, formData, {}, true);
  }
}

export const userService = new UserService();