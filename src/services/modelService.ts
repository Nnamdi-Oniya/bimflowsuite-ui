import { apiClient } from '../config/api';
import { BACKEND_CONFIG } from '../config/api';

export interface ModelTemplate {
  id: number;
  name: string;
  description: string;
  category: 'residential' | 'commercial' | 'industrial' | 'educational' | 'healthcare';
  thumbnail_url: string;
  parameters: ModelParameter[];
  created_at: string;
  updated_at: string;
}

export interface ModelParameter {
  name: string;
  type: 'number' | 'string' | 'boolean' | 'select';
  label: string;
  description: string;
  default: any;
  min?: number;
  max?: number;
  step?: number;
  options?: Array<{ label: string; value: any }>;
  required: boolean;
}

export interface ModelGenerationRequest {
  template_id?: number;
  parameters: Record<string, any>;
  name: string;
  description?: string;
  project_id?: number;
}

export interface GeneratedModel {
  id: number;
  name: string;
  description: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  template: ModelTemplate | null;
  parameters: Record<string, any>;
  ifc_file_url: string | null;
  preview_image_url: string | null;
  file_size: number | null;
  generation_time: number | null;
  created_by: number;
  created_at: string;
  updated_at: string;
  error_message: string | null;
}

export interface ModelExportOptions {
  format: 'ifc' | 'dwg' | 'dxf' | 'pdf' | 'obj';
  include_metadata: boolean;
  compression: boolean;
  version: string;
}

class ModelService {
  // Get all model templates
  async getTemplates(category?: string): Promise<ModelTemplate[]> {
    try {
      const url = category 
        ? `${BACKEND_CONFIG.endpoints.models.templates}?category=${category}`
        : BACKEND_CONFIG.endpoints.models.templates;
      return await apiClient.get<ModelTemplate[]>(url);
    } catch (error) {
      console.error('Get templates error:', error);
      throw error;
    }
  }

  // Get template by ID
  async getTemplate(id: number): Promise<ModelTemplate> {
    try {
      return await apiClient.get<ModelTemplate>(`${BACKEND_CONFIG.endpoints.models.templates}${id}/`);
    } catch (error) {
      console.error('Get template error:', error);
      throw error;
    }
  }

  // Generate model
  async generateModel(data: ModelGenerationRequest): Promise<GeneratedModel> {
    try {
      return await apiClient.post<GeneratedModel>(BACKEND_CONFIG.endpoints.models.generate, data);
    } catch (error) {
      console.error('Generate model error:', error);
      throw error;
    }
  }

  // Generate parametric model
  async generateParametricModel(parameters: Record<string, any>): Promise<GeneratedModel> {
    try {
      return await apiClient.post<GeneratedModel>(BACKEND_CONFIG.endpoints.models.parametric, parameters);
    } catch (error) {
      console.error('Generate parametric model error:', error);
      throw error;
    }
  }

  // Get generated model by ID
  async getGeneratedModel(id: number): Promise<GeneratedModel> {
    try {
      const endpoint = BACKEND_CONFIG.endpoints.models.detail.replace('{id}', id.toString());
      return await apiClient.get<GeneratedModel>(endpoint);
    } catch (error) {
      console.error('Get generated model error:', error);
      throw error;
    }
  }

  // Poll model generation status
  async pollModelStatus(id: number, interval: number = 2000, maxAttempts: number = 60): Promise<GeneratedModel> {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      
      const checkStatus = async () => {
        try {
          const model = await this.getGeneratedModel(id);
          
          if (model.status === 'completed') {
            resolve(model);
          } else if (model.status === 'failed') {
            reject(new Error(model.error_message || 'Model generation failed'));
          } else if (attempts >= maxAttempts) {
            reject(new Error('Model generation timeout'));
          } else {
            attempts++;
            setTimeout(checkStatus, interval);
          }
        } catch (error) {
          reject(error);
        }
      };
      
      checkStatus();
    });
  }

  // Export model
  async exportModel(id: number, options: ModelExportOptions): Promise<{ download_url: string }> {
    try {
      const endpoint = BACKEND_CONFIG.endpoints.models.export.replace('{id}', id.toString());
      return await apiClient.post<{ download_url: string }>(endpoint, options);
    } catch (error) {
      console.error('Export model error:', error);
      throw error;
    }
  }

  // Get user's generated models
  async getMyModels(page: number = 1, pageSize: number = 10): Promise<{ models: GeneratedModel[]; total: number }> {
    try {
      const response = await apiClient.get<{ results: GeneratedModel[]; count: number }>(
        `${BACKEND_CONFIG.endpoints.models.generate}?page=${page}&page_size=${pageSize}`
      );
      return {
        models: response.results,
        total: response.count
      };
    } catch (error) {
      console.error('Get my models error:', error);
      throw error;
    }
  }

  // Delete generated model
  async deleteModel(id: number): Promise<{ message: string }> {
    try {
      const endpoint = BACKEND_CONFIG.endpoints.models.detail.replace('{id}', id.toString());
      return await apiClient.delete<{ message: string }>(endpoint);
    } catch (error) {
      console.error('Delete model error:', error);
      throw error;
    }
  }
}

export const modelService = new ModelService();