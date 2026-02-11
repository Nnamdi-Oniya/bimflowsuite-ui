import { apiClient, ApiResponse } from './apiClient';
import { BACKEND_CONFIG } from '../config/api';

// Types
export interface DashboardMetrics {
  total_projects: number;
  active_projects: number;
  total_files: number;
  total_users: number;
  storage_used: number;
  compliance_checks: number;
  parametric_generations: number;
  recent_activity: Array<{
    id: number;
    type: string;
    description: string;
    timestamp: string;
    user: string;
  }>;
}

export interface ProjectAnalytics {
  project_id: number;
  project_name: string;
  file_count: number;
  total_file_size: number;
  compliance_score: number;
  team_members: number;
  last_activity: string;
  activity_timeline: Array<{
    date: string;
    count: number;
    type: string;
  }>;
}

export interface AnalyticsReport {
  id: number;
  name: string;
  type: string;
  data: any;
  generated_at: string;
  period_start: string;
  period_end: string;
}

export interface ExportParams {
  format: 'csv' | 'json' | 'pdf' | 'xlsx';
  data_type: string;
  filters?: Record<string, any>;
}

class AnalyticsService {
  private endpoints = BACKEND_CONFIG.endpoints.analytics;

  // Get dashboard metrics
  async getDashboardMetrics(): Promise<ApiResponse<DashboardMetrics>> {
    return apiClient.get<DashboardMetrics>(this.endpoints.dashboard);
  }

  // Get metrics
  async getMetrics(): Promise<ApiResponse<any>> {
    return apiClient.get<any>(this.endpoints.metrics);
  }

  // Get reports
  async getReports(): Promise<ApiResponse<AnalyticsReport[]>> {
    return apiClient.get<AnalyticsReport[]>(this.endpoints.reports);
  }

  // Get project analytics
  async getProjectAnalytics(projectId: number): Promise<ApiResponse<ProjectAnalytics>> {
    return apiClient.get<ProjectAnalytics>(this.endpoints.projectAnalytics(projectId));
  }

  // Export analytics data
  async exportData(params: ExportParams): Promise<Blob> {
    return apiClient.downloadFile(`${this.endpoints.export}?${new URLSearchParams(params as any)}`);
  }

  // Get storage usage
  async getStorageUsage(): Promise<ApiResponse<{ used: number; total: number; by_type: Record<string, number> }>> {
    const metrics = await this.getMetrics();
    
    if (metrics.data && metrics.data.storage) {
      return {
        ...metrics,
        data: metrics.data.storage,
      };
    }
    
    return {
      data: { used: 0, total: 0, by_type: {} },
      status: 200,
      success: true,
    };
  }

  // Get activity timeline
  async getActivityTimeline(days: number = 30): Promise<ApiResponse<Array<{ date: string; count: number; type: string }>>> {
    const metrics = await this.getMetrics();
    
    if (metrics.data && metrics.data.activity_timeline) {
      return {
        ...metrics,
        data: metrics.data.activity_timeline.slice(-days),
      };
    }
    
    return {
      data: [],
      status: 200,
      success: true,
    };
  }

  // Format storage size
  formatStorageSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Get percentage used
  getPercentageUsed(used: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((used / total) * 100);
  }
}

export const analyticsService = new AnalyticsService();