// src/services/profileService.ts
import { apiClient, type ApiResponse } from './apiClient';
import { BACKEND_CONFIG } from '../config/api';
import type { UserProfile } from './authService';

class ProfileService {
  private base = BACKEND_CONFIG.endpoints.users.profile;

  async getProfile(): Promise<ApiResponse<UserProfile>> {
    return apiClient.get<UserProfile>(this.base);
  }

  async updateProfile(data: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    return apiClient.patch<UserProfile>(this.base, data);
  }

  async uploadAvatar(file: File): Promise<ApiResponse<{ profile_picture: string }>> {
    const formData = new FormData();
    formData.append('profile_picture', file);

    return apiClient.post<{ profile_picture: string }>(
      `${this.base}upload-avatar/`,
      formData,
      undefined,
      true
    );
  }

  async removeAvatar(): Promise<ApiResponse> {
    return apiClient.delete(`${this.base}avatar/`);
  }
}

export const profileService = new ProfileService();