import { apiClient, ApiResponse } from './apiClient';
import { BACKEND_CONFIG } from '../config/api';

// Types
export interface ComplianceRule {
  id: number;
  name: string;
  description: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  parameters: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ComplianceCheck {
  id: string;
  file_id: number;
  rules: number[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  results?: ComplianceResult[];
  created_at: string;
  completed_at?: string;
}

export interface ComplianceResult {
  rule_id: number;
  rule_name: string;
  passed: boolean;
  severity: string;
  message: string;
  details: Record<string, any>;
  suggestions?: string[];
}

export interface ComplianceReport {
  id: number;
  check_id: string;
  file_id: number;
  summary: {
    total_checks: number;
    passed: number;
    failed: number;
    warnings: number;
    score: number;
  };
  results: ComplianceResult[];
  generated_at: string;
}

export interface ValidateFileParams {
  file: File;
  rule_ids?: number[];
  onProgress?: (percentage: number) => void;
}

export interface UploadRulePackParams {
  file: File;
  name: string;
  description?: string;
  onProgress?: (percentage: number) => void;
}

class ComplianceService {
  private endpoints = BACKEND_CONFIG.endpoints.compliance;

  // Get compliance rules
  async getRules(): Promise<ApiResponse<ComplianceRule[]>> {
    return apiClient.get<ComplianceRule[]>(this.endpoints.rules);
  }

  // Get rule by ID
  async getRule(id: number): Promise<ApiResponse<ComplianceRule>> {
    return apiClient.get<ComplianceRule>(this.endpoints.ruleDetail(id));
  }

  // Create compliance check
  async createCheck(fileId: number, ruleIds?: number[]): Promise<ApiResponse<ComplianceCheck>> {
    return apiClient.post<ComplianceCheck>(this.endpoints.checks, {
      file_id: fileId,
      rules: ruleIds,
    });
  }

  // Get check status
  async getCheckStatus(jobId: string): Promise<ApiResponse<ComplianceCheck>> {
    return apiClient.get<ComplianceCheck>(this.endpoints.checkStatus(jobId));
  }

  // Validate file (upload and check)
  async validateFile(params: ValidateFileParams): Promise<ApiResponse<ComplianceCheck>> {
    const { file, rule_ids, onProgress } = params;
    
    const formData = new FormData();
    formData.append('file', file);
    
    if (rule_ids && rule_ids.length > 0) {
      formData.append('rule_ids', JSON.stringify(rule_ids));
    }

    if (onProgress) {
      return apiClient.uploadFile(this.endpoints.validate, file, { rule_ids }, onProgress);
    } else {
      return apiClient.post<ComplianceCheck>(this.endpoints.validate, formData, {}, true);
    }
  }

  // Get compliance reports
  async getReports(): Promise<ApiResponse<ComplianceReport[]>> {
    return apiClient.get<ComplianceReport[]>(this.endpoints.reports);
  }

  // Get report by ID
  async getReport(id: number): Promise<ApiResponse<ComplianceReport>> {
    return apiClient.get<ComplianceReport>(this.endpoints.reportDetail(id));
  }

  // Download report
  async downloadReport(id: number): Promise<Blob> {
    return apiClient.downloadFile(this.endpoints.reportDownload(id));
  }

  // Upload rule pack
  async uploadRulePack(params: UploadRulePackParams): Promise<ApiResponse<ComplianceRule[]>> {
    const { file, name, description, onProgress } = params;
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    
    if (description) {
      formData.append('description', description);
    }

    if (onProgress) {
      return apiClient.uploadFile(this.endpoints.upload, file, { name, description }, onProgress);
    } else {
      return apiClient.post<ComplianceRule[]>(this.endpoints.upload, formData, {}, true);
    }
  }

  // Poll check status
  async pollCheckStatus(jobId: string, interval: number = 2000, maxAttempts: number = 60): Promise<ComplianceCheck> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await this.getCheckStatus(jobId);
        
        if (response.data) {
          if (response.data.status === 'completed' || response.data.status === 'failed') {
            return response.data;
          }
          
          // Wait before next attempt
          await new Promise(resolve => setTimeout(resolve, interval));
        }
      } catch (error) {
        console.error('Error polling check status:', error);
        throw error;
      }
    }
    
    throw new Error('Check status polling timed out');
  }

  // Get severity color
  getSeverityColor(severity: string): string {
    switch (severity.toLowerCase()) {
      case 'critical': return '#dc3545';
      case 'high': return '#fd7e14';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  }

  // Get severity icon
  getSeverityIcon(severity: string): string {
    switch (severity.toLowerCase()) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '🔶';
      case 'low': return '✅';
      default: return 'ℹ️';
    }
  }
}

export const complianceService = new ComplianceService();