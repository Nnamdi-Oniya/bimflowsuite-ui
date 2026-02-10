import { apiClient, ApiResponse } from './apiClient';
import { BACKEND_CONFIG } from '../config/api';

// Types
export interface ParametricTemplate {
  id: number;
  name: string;
  description: string;
  category: string;
  thumbnail?: string;
  parameters: ParametricParameter[];
  created_at: string;
  updated_at: string;
}

export interface ParametricParameter {
  name: string;
  type: 'number' | 'string' | 'boolean' | 'select' | 'color';
  label: string;
  description?: string;
  default: any;
  min?: number;
  max?: number;
  step?: number;
  options?: { label: string; value: any }[];
  required: boolean;
}

export interface GenerationParams {
  template_id: number;
  parameters: Record<string, any>;
  output_format?: 'ifc' | 'obj' | 'gltf' | 'dwg';
  quality?: 'low' | 'medium' | 'high';
}

export interface GenerationJob {
  id: string;
  template_id: number;
  parameters: Record<string, any>;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  result_file_id?: number;
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

export interface Configuration {
  id: number;
  name: string;
  description?: string;
  template_id: number;
  parameters: Record<string, any>;
  thumbnail?: string;
  created_at: string;
  updated_at: string;
}

export interface GenerationHistory {
  id: string;
  template_name: string;
  status: string;
  created_at: string;
  completed_at?: string;
}

class ParametricService {
  private endpoints = BACKEND_CONFIG.endpoints.parametric;

  // Get templates
  async getTemplates(): Promise<ApiResponse<ParametricTemplate[]>> {
    return apiClient.get<ParametricTemplate[]>(this.endpoints.templates);
  }

  // Get template by ID
  async getTemplate(id: number): Promise<ApiResponse<ParametricTemplate>> {
    return apiClient.get<ParametricTemplate>(this.endpoints.templateDetail(id));
  }

  // Generate model
  async generateModel(params: GenerationParams): Promise<ApiResponse<GenerationJob>> {
    return apiClient.post<GenerationJob>(this.endpoints.generate, params);
  }

  // Get generation status
  async getGenerationStatus(jobId: string): Promise<ApiResponse<GenerationJob>> {
    return apiClient.get<GenerationJob>(this.endpoints.generationStatus(jobId));
  }

  // Cancel generation
  async cancelGeneration(jobId: string): Promise<ApiResponse> {
    return apiClient.post(this.endpoints.generationCancel(jobId), {});
  }

  // Save configuration
  async saveConfiguration(name: string, templateId: number, parameters: Record<string, any>, description?: string): Promise<ApiResponse<Configuration>> {
    return apiClient.post<Configuration>(this.endpoints.saveConfiguration, {
      name,
      description,
      template_id: templateId,
      parameters,
    });
  }

  // Get configurations
  async getConfigurations(): Promise<ApiResponse<Configuration[]>> {
    return apiClient.get<Configuration[]>(this.endpoints.configurations);
  }

  // Export generated model
  async exportModel(fileId: number, format: string = 'ifc'): Promise<Blob> {
    const endpoint = `${this.endpoints.export}?file_id=${fileId}&format=${format}`;
    return apiClient.downloadFile(endpoint);
  }

  // Get generation history
  async getHistory(): Promise<ApiResponse<GenerationHistory[]>> {
    return apiClient.get<GenerationHistory[]>(this.endpoints.history);
  }

  // Poll generation status
  async pollGenerationStatus(jobId: string, interval: number = 3000, maxAttempts: number = 40): Promise<GenerationJob> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await this.getGenerationStatus(jobId);
        
        if (response.data) {
          if (response.data.status === 'completed' || response.data.status === 'failed' || response.data.status === 'cancelled') {
            return response.data;
          }
          
          // Wait before next attempt
          await new Promise(resolve => setTimeout(resolve, interval));
        }
      } catch (error) {
        console.error('Error polling generation status:', error);
        throw error;
      }
    }
    
    throw new Error('Generation status polling timed out');
  }

  // Get available output formats
  getOutputFormats(): Array<{ value: string; label: string; description: string }> {
    return [
      { value: 'ifc', label: 'IFC', description: 'Industry Foundation Classes' },
      { value: 'obj', label: 'OBJ', description: 'Wavefront 3D Object' },
      { value: 'gltf', label: 'GLTF', description: 'GL Transmission Format' },
      { value: 'dwg', label: 'DWG', description: 'AutoCAD Drawing' },
    ];
  }

  // Get available quality levels
  getQualityLevels(): Array<{ value: string; label: string; description: string }> {
    return [
      { value: 'low', label: 'Low', description: 'Fast generation, lower detail' },
      { value: 'medium', label: 'Medium', description: 'Balanced speed and detail' },
      { value: 'high', label: 'High', description: 'Slower generation, highest detail' },
    ];
  }
}

export const parametricService = new ParametricService();