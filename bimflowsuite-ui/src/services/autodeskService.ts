// src/services/autodeskService.ts
import { APS_CONFIG, getAuthHeaders, getAccessToken } from '../config/api';

// Map the exports from api.ts to the names used in this service
const AUTODESK_CONFIG = APS_CONFIG;
const getAutodeskAuthHeaders = getAuthHeaders;
const getAutodeskToken = getAccessToken;

export interface AutodeskUploadParams {
  file: File;
  bucketKey: string;
  objectName?: string;
}

export interface AutodeskTranslationParams {
  urn: string;
  rootFilename?: string;
}

export interface TranslationStatus {
  status: 'pending' | 'inprogress' | 'success' | 'failed' | 'timeout';
  progress?: string;
  message?: string;
}

export interface AutodeskViewable {
  urn: string;
  derivatives: unknown[];
}

class AutodeskService {
  private baseUrl = AUTODESK_CONFIG.baseUrl;
  public currentProgress: number = 0;

  // Create a bucket for storing files
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createBucket(bucketKey: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/oss/v2/buckets`, {
        method: 'POST',
        headers: await getAutodeskAuthHeaders(),
        body: JSON.stringify({
          bucketKey,
          policyKey: 'transient' // Files are automatically deleted after 24 hours
        }),
      });

      if (!response.ok && response.status !== 409) { // 409 means bucket already exists
        throw new Error(`Failed to create bucket: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.log('Bucket creation:', error);
      // Continue even if bucket creation fails (it might already exist)
    }
  }

  // Upload file to Autodesk OSS
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async uploadFile(params: AutodeskUploadParams): Promise<any> {
    const { file, bucketKey, objectName } = params;
    
    // Ensure bucket exists
    await this.createBucket(bucketKey);

    const uploadResponse = await fetch(`${this.baseUrl}/oss/v2/buckets/${bucketKey}/objects/${objectName || file.name}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${await getAutodeskToken()}`,
        'Content-Type': 'application/octet-stream',
      },
      body: file,
    });

    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.status}`);
    }

    return await uploadResponse.json();
  }

  // Translate file for viewing
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async translateFile(params: AutodeskTranslationParams): Promise<any> {
    const { urn, rootFilename } = params;

    const translationPayload = {
      input: {
        urn: urn,
        compressedUrn: rootFilename ? true : undefined,
        rootFilename: rootFilename
      },
      output: {
        formats: [
          {
            type: "svf",
            views: ["2d", "3d"]
          }
        ]
      }
    };

    const response = await fetch(`${this.baseUrl}/modelderivative/v2/designdata/job`, {
      method: 'POST',
      headers: await getAutodeskAuthHeaders(),
      body: JSON.stringify(translationPayload),
    });

    if (!response.ok) {
      throw new Error(`Translation failed: ${response.status}`);
    }

    return await response.json();
  }

  // Check translation status
  async getTranslationStatus(urn: string): Promise<TranslationStatus> {
    const encodedUrn = btoa(urn).replace(/=/g, '');
    
    const response = await fetch(`${this.baseUrl}/modelderivative/v2/designdata/${encodedUrn}/manifest`, {
      method: 'GET',
      headers: await getAutodeskAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Status check failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status === 'success') {
      this.currentProgress = 100;
      return {
        status: 'success',
        progress: '100%',
        message: 'Translation completed successfully'
      };
    } else if (data.status === 'inprogress') {
      const progress = data.progress || '0%';
      this.currentProgress = parseInt(progress) || 0;
      return {
        status: 'inprogress',
        progress: progress,
        message: 'Translation in progress'
      };
    } else if (data.status === 'failed') {
      return {
        status: 'failed',
        message: data.message || 'Translation failed'
      };
    } else {
      return {
        status: 'pending',
        message: 'Translation pending'
      };
    }
  }

  // Poll translation status
  async pollTranslationStatus(urn: string, maxAttempts: number = 60, interval: number = 5000): Promise<string> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const status = await this.getTranslationStatus(urn);
        
        if (status.status === 'success') {
          return urn; // Return the URN when translation is complete
        }
        
        if (status.status === 'failed') {
          throw new Error(status.message || 'Translation failed');
        }

        // Update progress
        if (status.progress) {
          this.currentProgress = parseInt(status.progress) || this.currentProgress;
        }

        await new Promise(resolve => setTimeout(resolve, interval));
      } catch (error) {
        console.error('Error checking translation status:', error);
        throw error;
      }
    }

    throw new Error('Translation timed out');
  }

  // Main method to upload and translate a file
  async processModel(file: File, bucketKey: string): Promise<string> {
    this.currentProgress = 0;
    
    try {
      // Step 1: Upload file
      this.currentProgress = 10;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const uploadResult: any = await this.uploadFile({
        file,
        bucketKey,
        objectName: file.name
      });

      // Step 2: Start translation
      this.currentProgress = 30;
      const urn = uploadResult.objectId;
      await this.translateFile({ urn });

      // Step 3: Poll for translation completion
      this.currentProgress = 50;
      const finalUrn = await this.pollTranslationStatus(urn);
      
      this.currentProgress = 100;
      return finalUrn;

    } catch (error) {
      console.error('Model processing failed:', error);
      throw error;
    }
  }

  // Get list of supported file formats
  getSupportedFormats(): Array<{name: string, extension: string, description: string}> {
    return [
      { name: 'Revit', extension: 'RVT', description: 'Autodesk Revit files' },
      { name: 'AutoCAD', extension: 'DWG', description: 'AutoCAD drawing files' },
      { name: 'Industry Foundation Classes', extension: 'IFC', description: 'BIM data exchange format' },
      { name: '3D Studio', extension: '3DS', description: '3D Studio files' },
      { name: 'OBJ Wavefront', extension: 'OBJ', description: '3D geometry format' },
      { name: 'FBX', extension: 'FBX', description: 'Autodesk FBX format' },
      { name: 'STEP', extension: 'STEP', description: '3D manufacturing data' },
      { name: 'IGES', extension: 'IGS', description: '3D engineering data' }
    ];
  }

  // Generate a unique bucket key
  generateBucketKey(prefix: string = 'bimflow'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}-${timestamp}-${random}`.toLowerCase();
  }
}

export const autodeskService = new AutodeskService();