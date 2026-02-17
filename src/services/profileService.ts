// src/services/profileService.ts
import { apiClient, type ApiResponse } from './apiClient';
import { BACKEND_CONFIG, resolveMediaUrl } from '../config/api';
import type { UserProfile } from './authService';

class ProfileService {
  private base = BACKEND_CONFIG.endpoints.users.profile;

  async getProfile(): Promise<ApiResponse<UserProfile>> {
    const response = await apiClient.get<UserProfile>(this.base);
    
    if (response.success && response.data?.profile_picture) {
      response.data.profile_picture = resolveMediaUrl(response.data.profile_picture);
    }
    
    return response;
  }

  async updateProfile(data: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    const response = await apiClient.put<UserProfile>(this.base, data);
    
    if (response.success && response.data?.profile_picture) {
      response.data.profile_picture = resolveMediaUrl(response.data.profile_picture);
    }
    
    return response;
  }

  async uploadAvatar(file: File): Promise<ApiResponse<UserProfile>> {
    const formData = new FormData();
    formData.append('profile_picture', file);

    const response = await apiClient.put<UserProfile>(
      this.base,
      formData,
      undefined,
      true
    );
    
    if (response.success && response.data?.profile_picture) {
      response.data.profile_picture = resolveMediaUrl(response.data.profile_picture);
    }
    
    return response;
  }

  async removeAvatar(): Promise<ApiResponse<UserProfile>> {
    const formData = new FormData();
    formData.append('profile_picture', '');
    
    const response = await apiClient.put<UserProfile>(
      this.base,
      formData,
      undefined,
      true
    );
    
    if (response.success && response.data?.profile_picture) {
      response.data.profile_picture = resolveMediaUrl(response.data.profile_picture);
    }
    
    return response;
  }

  getAvatarUrl(profilePicture?: string | null): string {
    return resolveMediaUrl(profilePicture);
  }
}

export const profileService = new ProfileService();