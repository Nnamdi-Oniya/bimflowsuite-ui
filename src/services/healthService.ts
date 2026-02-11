import { apiClient, ApiResponse } from './apiClient';
import { BACKEND_CONFIG } from '../config/api';

// Types
export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  services: {
    database: ServiceStatus;
    cache: ServiceStatus;
    storage: ServiceStatus;
    celery: ServiceStatus;
    email: ServiceStatus;
  };
  metrics: {
    uptime: number;
    memory_usage: number;
    cpu_usage: number;
    active_users: number;
    requests_per_minute: number;
  };
}

export interface ServiceStatus {
  status: 'up' | 'down' | 'degraded';
  response_time?: number;
  message?: string;
}

export interface VersionInfo {
  version: string;
  build_date: string;
  commit_hash: string;
  environment: 'development' | 'staging' | 'production';
  dependencies: Record<string, string>;
}

class HealthService {
  private endpoints = BACKEND_CONFIG.endpoints;

  // Check health status
  async checkHealth(): Promise<ApiResponse<HealthStatus>> {
    return apiClient.get<HealthStatus>(this.endpoints.health);
  }

  // Get version info
  async getVersion(): Promise<ApiResponse<VersionInfo>> {
    return apiClient.get<VersionInfo>(this.endpoints.version);
  }

  // Check if backend is reachable
  async isBackendReachable(): Promise<boolean> {
    try {
      const response = await apiClient.get(this.endpoints.health);
      return response.success;
    } catch {
      return false;
    }
  }

  // Get database status
  async getDatabaseStatus(): Promise<ServiceStatus> {
    try {
      const response = await this.checkHealth();
      if (response.data) {
        return response.data.services.database;
      }
    } catch (error) {
      console.error('Error getting database status:', error);
    }
    
    return { status: 'down', message: 'Unable to check status' };
  }

  // Get overall system health
  async getSystemHealth(): Promise<'healthy' | 'degraded' | 'unhealthy'> {
    try {
      const response = await this.checkHealth();
      if (response.data) {
        return response.data.status;
      }
    } catch (error) {
      console.error('Error getting system health:', error);
    }
    
    return 'unhealthy';
  }

  // Format uptime
  formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    
    return parts.join(' ') || '0m';
  }

  // Get status color
  getStatusColor(status: string): string {
    switch (status) {
      case 'healthy':
      case 'up':
        return '#28a745';
      case 'degraded':
        return '#ffc107';
      case 'unhealthy':
      case 'down':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  }

  // Get status icon
  getStatusIcon(status: string): string {
    switch (status) {
      case 'healthy':
      case 'up':
        return '✅';
      case 'degraded':
        return '⚠️';
      case 'unhealthy':
      case 'down':
        return '❌';
      default:
        return '❓';
    }
  }
}

export const healthService = new HealthService();