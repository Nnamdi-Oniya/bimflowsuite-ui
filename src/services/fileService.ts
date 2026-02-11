import { apiClient, ApiResponse } from './apiClient';
import { BACKEND_CONFIG } from '../config/api';

// Types
export interface FileItem {
  id: number;
  name: string;
  size: number;
  file_type: string;
  url: string;
  thumbnail?: string;
  uploaded_at: string;
  uploaded_by: number;
  project?: number;
  metadata?: Record<string, any>;
}

export interface UploadFileParams {
  file: File;
  project_id?: number;
  metadata?: Record<string, any>;
  onProgress?: (percentage: number) => void;
}

export interface FileListParams {
  page?: number;
  page_size?: number;
  search?: string;
  file_type?: string;
  project_id?: number;
  ordering?: string;
}

export interface FileListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: FileItem[];
}

class FileService {
  private endpoints = BACKEND_CONFIG.endpoints.files;

  // Upload file
  async uploadFile(params: UploadFileParams): Promise<ApiResponse<FileItem>> {
    const { file, project_id, metadata, onProgress } = params;
    
    const formData = new FormData();
    formData.append('file', file);
    
    if (project_id) {
      formData.append('project_id', project_id.toString());
    }
    
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    if (onProgress) {
      return apiClient.uploadFile(this.endpoints.upload, file, { project_id, metadata }, onProgress);
    } else {
      return apiClient.post<FileItem>(this.endpoints.upload, formData, {}, true);
    }
  }

  // Get files list
  async getFiles(params?: FileListParams): Promise<ApiResponse<FileListResponse>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.file_type) queryParams.append('file_type', params.file_type);
    if (params?.project_id) queryParams.append('project_id', params.project_id.toString());
    if (params?.ordering) queryParams.append('ordering', params.ordering);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `${this.endpoints.list}?${queryString}` : this.endpoints.list;
    
    return apiClient.get<FileListResponse>(endpoint);
  }

  // Get file by ID
  async getFile(id: string | number): Promise<ApiResponse<FileItem>> {
    return apiClient.get<FileItem>(this.endpoints.detail(id));
  }

  // Update file metadata
  async updateFile(id: string | number, metadata: Record<string, any>): Promise<ApiResponse<FileItem>> {
    return apiClient.patch<FileItem>(this.endpoints.update(id), { metadata });
  }

  // Delete file
  async deleteFile(id: string | number): Promise<ApiResponse> {
    return apiClient.delete(this.endpoints.delete(id));
  }

  // Download file
  async downloadFile(id: string | number): Promise<Blob> {
    return apiClient.downloadFile(this.endpoints.download(id));
  }

  // Get file URL
  getFileUrl(id: string | number): string {
    return `${BACKEND_CONFIG.baseUrl}${BACKEND_CONFIG.apiPrefix}${this.endpoints.download(id)}`;
  }

  // Get thumbnail URL
  getThumbnailUrl(file: FileItem): string | undefined {
    if (file.thumbnail) {
      return file.thumbnail.startsWith('http') 
        ? file.thumbnail 
        : `${BACKEND_CONFIG.baseUrl}${file.thumbnail}`;
    }
    return undefined;
  }

  // Format file size
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export const fileService = new FileService();