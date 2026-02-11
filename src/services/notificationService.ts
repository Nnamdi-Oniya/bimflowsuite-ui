import { apiClient, ApiResponse } from './apiClient';
import { BACKEND_CONFIG } from '../config/api';

// Types
export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  data?: Record<string, any>;
  created_at: string;
}

export interface NotificationPreferences {
  email_enabled: boolean;
  push_enabled: boolean;
  desktop_enabled: boolean;
  project_updates: boolean;
  compliance_alerts: boolean;
  file_uploads: boolean;
  collaboration_messages: boolean;
}

export interface NotificationListParams {
  page?: number;
  page_size?: number;
  read?: boolean;
  type?: string;
  ordering?: string;
}

export interface NotificationListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Notification[];
}

class NotificationService {
  private endpoints = BACKEND_CONFIG.endpoints.notifications;

  // Get notifications
  async getNotifications(params?: NotificationListParams): Promise<ApiResponse<NotificationListResponse>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
    if (params?.read !== undefined) queryParams.append('read', params.read.toString());
    if (params?.type) queryParams.append('type', params.type);
    if (params?.ordering) queryParams.append('ordering', params.ordering);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `${this.endpoints.list}?${queryString}` : this.endpoints.list;
    
    return apiClient.get<NotificationListResponse>(endpoint);
  }

  // Mark notification as read
  async markAsRead(id: number): Promise<ApiResponse<Notification>> {
    return apiClient.post<Notification>(this.endpoints.markRead(id), {});
  }

  // Mark all notifications as read
  async markAllAsRead(): Promise<ApiResponse> {
    return apiClient.post(this.endpoints.markAllRead, {});
  }

  // Delete notification
  async deleteNotification(id: number): Promise<ApiResponse> {
    return apiClient.delete(this.endpoints.delete(id));
  }

  // Get notification preferences
  async getPreferences(): Promise<ApiResponse<NotificationPreferences>> {
    return apiClient.get<NotificationPreferences>(this.endpoints.preferences);
  }

  // Update notification preferences
  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<ApiResponse<NotificationPreferences>> {
    return apiClient.patch<NotificationPreferences>(this.endpoints.preferences, preferences);
  }

  // Send test notification
  async sendTestNotification(type: Notification['type'] = 'info'): Promise<ApiResponse> {
    return apiClient.post(this.endpoints.test, { type });
  }

  // Get unread count
  async getUnreadCount(): Promise<number> {
    try {
      const response = await this.getNotifications({ read: false, page_size: 1 });
      if (response.data) {
        return response.data.count;
      }
    } catch (error) {
      console.error('Error getting unread count:', error);
    }
    return 0;
  }

  // Get notification icon
  getNotificationIcon(type: Notification['type']): string {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  }

  // Get notification color
  getNotificationColor(type: Notification['type']): string {
    switch (type) {
      case 'success': return '#28a745';
      case 'warning': return '#ffc107';
      case 'error': return '#dc3545';
      default: return '#17a2b8';
    }
  }

  // Format notification time
  formatNotificationTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    
    return date.toLocaleDateString();
  }
}

export const notificationService = new NotificationService();