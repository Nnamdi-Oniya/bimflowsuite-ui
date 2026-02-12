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
    return apiClient.put<UserProfile>(this.base, data);
  }

  async uploadAvatar(file: File): Promise<ApiResponse<UserProfile>> {
    const formData = new FormData();
    formData.append('profile_picture', file);

    // ✅ Profile picture is updated via PUT to same endpoint with profile_picture field
    return apiClient.put<UserProfile>(
      this.base,
      formData,
      undefined,
      true
    );
  }

  async removeAvatar(): Promise<ApiResponse<UserProfile>> {
    // ✅ Send empty string to clear profile picture
    const formData = new FormData();
    formData.append('profile_picture', '');
    
    return apiClient.put<UserProfile>(
      this.base,
      formData,
      undefined,
      true
    );
  }
}

export const profileService = new ProfileService();