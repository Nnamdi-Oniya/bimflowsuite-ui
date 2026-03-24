// src/services/generateModelService.ts
import { apiClient } from './apiClient';
import type { ApiResponse } from './apiClient';

// EXACTLY matching Django backend Project.PROJECT_TYPE_CHOICES
export const PROJECT_TYPE_CHOICES = [
  { value: "BUILDING", label: "🏢 Building", description: "Residential, commercial, institutional buildings" },
  { value: "INFRA_ROAD", label: "🛣️ Road", description: "Highways, streets, urban roads" },
  { value: "INFRA_RAILWAY", label: "🚂 Railway", description: "Rail lines, tracks, railway infrastructure" },
  { value: "INFRA_BRIDGE", label: "🌉 Bridge", description: "Vehicular, pedestrian, railway bridges" },
  { value: "INFRA_TUNNEL", label: "🚇 Tunnel", description: "Road, rail, utility tunnels" },
  { value: "INFRA_MARINE", label: "⚓ Marine Facility", description: "Ports, docks, marinas, offshore structures" },
  { value: "INDUSTRIAL_FACTORY", label: "🏭 Factory", description: "Manufacturing plants, assembly facilities" },
  { value: "INDUSTRIAL_PLANT", label: "🏗️ Process Plant", description: "Chemical, power, water treatment plants" },
  { value: "INFRA_DISTRIBUTION", label: "📡 Distribution System", description: "Utilities, pipelines, power lines" },
  { value: "SITE", label: "🗺️ Site / Land Project", description: "Land development, parks, campuses" },
  { value: "OTHER", label: "🔧 Other", description: "Custom project types" }
];

// Mapping from project type to schema key for backend validation
export const PROJECT_TYPE_TO_SCHEMA_MAP: Record<string, string> = {
  "BUILDING": "IFC_BUILDING",
  "INFRA_ROAD": "IFC_ROAD",
  "INFRA_RAILWAY": "IFC_RAILWAY",
  "INFRA_BRIDGE": "IFC_BRIDGE",
  "INFRA_TUNNEL": "IFC_TUNNEL",
  "INFRA_MARINE": "IFC_MARINE_FACILITY",
  "INDUSTRIAL_FACTORY": "IFC_FACTORY",
  "INDUSTRIAL_PLANT": "IFC_PROCESS_PLANT",
  "INFRA_DISTRIBUTION": "IFC_DISTRIBUTION_SYSTEM",
  "SITE": "IFC_SITE",
  "OTHER": "OTHER"
};

// Match backend Project.PROJECT_PHASE_CHOICES
export const PROJECT_PHASE_CHOICES = [
  { value: "concept", label: "Concept" },
  { value: "schematic", label: "Schematic" },
  { value: "detailed", label: "Detailed Design" },
  { value: "as-built", label: "As-Built" }
];

// Match backend Project.PROJECT_SCALE_CHOICES
export const PROJECT_SCALE_CHOICES = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" }
];

// Match backend Project.CLIENT_TYPE_CHOICES
export const CLIENT_TYPE_CHOICES = [
  { value: "private", label: "Private" },
  { value: "government", label: "Government" },
  { value: "ngo", label: "NGO" },
  { value: "corporate", label: "Corporate" }
];

// Match backend Project.RISK_CLASSIFICATION_CHOICES
export const RISK_CLASSIFICATION_CHOICES = [
  { value: "low", label: "Low Risk" },
  { value: "medium", label: "Medium Risk" },
  { value: "high", label: "High Risk" },
  { value: "critical", label: "Critical Risk" }
];

// Match backend Site.IFC_SCHEMA_CHOICES
export const IFC_SCHEMA_CHOICES = [
  { value: "ifc2x3", label: "IFC2x3" },
  { value: "ifc4", label: "IFC4" },
  { value: "ifc4x3", label: "IFC4x3" }
];

// Match backend Site.CRS_CHOICES
export const CRS_CHOICES = [
  { value: "epsg:4326", label: "WGS 84 (EPSG:4326)" },
  { value: "epsg:3857", label: "Web Mercator (EPSG:3857)" },
  { value: "epsg:3395", label: "World Mercator (EPSG:3395)" },
  { value: "local", label: "Local Coordinate System" },
  { value: "custom", label: "Custom CRS" }
];

// Match backend GeneratedIFC.ASSET_TYPE_CHOICES
export const ASSET_TYPE_CHOICES = [
  { value: "building", label: "Building" },
  { value: "residential", label: "Residential Building" },
  { value: "commercial", label: "Commercial Building" },
  { value: "industrial", label: "Industrial Building" },
  { value: "institutional", label: "Institutional Building" },
  { value: "road", label: "Road" },
  { value: "highway", label: "Highway" },
  { value: "bridge", label: "Bridge" },
  { value: "tunnel", label: "Tunnel" },
  { value: "railway", label: "Railway/Track" },
  { value: "parking", label: "Parking Structure" },
  { value: "utility_network", label: "Utility Network" },
  { value: "power_line", label: "Power Line" },
  { value: "pipeline", label: "Pipeline" },
  { value: "water_system", label: "Water System" },
  { value: "drainage", label: "Drainage System" },
  { value: "site", label: "Site/Lot" },
  { value: "landscape", label: "Landscape" },
  { value: "plaza", label: "Plaza/Court" },
  { value: "park", label: "Park" },
  { value: "airport", label: "Airport" },
  { value: "seaport", label: "Seaport" },
  { value: "dam", label: "Dam" },
  { value: "solar_farm", label: "Solar Farm" },
  { value: "wind_farm", label: "Wind Farm" },
  { value: "hvac_system", label: "HVAC System" },
  { value: "electrical_system", label: "Electrical System" },
  { value: "plumbing_system", label: "Plumbing System" },
  { value: "fire_safety", label: "Fire Safety System" },
  { value: "other", label: "Other" }
];

export interface ProjectCreatePayload {
  name: string;
  project_number?: string;
  description?: string;
  project_type: string;  // Must match backend PROJECT_TYPE_CHOICES
  phase?: 'concept' | 'schematic' | 'detailed' | 'as-built';
  client_name?: string;
  client_type?: 'private' | 'government' | 'ngo' | 'corporate';
  project_scale?: 'small' | 'medium' | 'large';
  risk_classification?: 'low' | 'medium' | 'high' | 'critical';
  project_address?: string;
  project_start_date?: string;     
  construction_start_date?: string;
  expected_completion_date?: string;
}

export interface SiteCreatePayload {
  project: string;                  
  site_name: string;
  project_type: string;  // Must match backend PROJECT_TYPE_CHOICES
  address?: string;
  latitude?: number;
  longitude?: number;
  elevation?: number;
  coordinate_reference_system?: string;
  length_unit?: 'm' | 'mm';
  area_unit?: 'm2' | 'mm2';
  volume_unit?: 'm3' | 'mm3';
  ifc_schema_version?: 'ifc2x3' | 'ifc4' | 'ifc4x3';
  type_metadata?: Record<string, any>;  // Project-type specific metadata
  true_north_angle?: number;
  project_north_angle?: number;
  angle_unit?: 'degree' | 'radian';
  precision?: number;
  climate_zone?: string;
  design_temperature?: number;
  material_system?: Record<string, any>;
  regulatory_requirements?: Record<string, any>;
}

export interface GenerateIFCPayload {
  project_id: string;
  asset_type: string;  // Must match backend ASSET_TYPE_CHOICES
  ifc_schema_version?: 'ifc2x3' | 'ifc4' | 'ifc4x3';
  specifications: Record<string, any>;
}

export interface GeneratedIFC {
  id: string;
  project: string;
  project_name: string;
  asset_type: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  specifications: Record<string, any>;
  download_url?: string | null;
  file_size?: number;
  error_message?: string | null;
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
}

class GenerateModelService {
  /**
   * Create a new project
   * POST /api/v1/projects/create/
   */
  async createProject(data: ProjectCreatePayload): Promise<ApiResponse<{ id: string; name: string }>> {
    return apiClient.post('/projects/create/', data);
  }

  /**
   * Create a new site under a project
   * POST /api/v1/sites/create/
   */
  async createSite(data: SiteCreatePayload): Promise<ApiResponse<{ id: string; site_name: string }>> {
    return apiClient.post('/sites/create/', data);
  }

  /**
   * Create an IFC generation job
   * POST /api/v1/generate-model/ifcs/create_for_project/
   */
  async createIFCGenerationJob(
    payload: GenerateIFCPayload
  ): Promise<ApiResponse<GeneratedIFC>> {
    return apiClient.post('/generate-model/ifcs/create_for_project/', payload);
  }

  /**
   * Trigger IFC generation manually (if not auto-started)
   * POST /api/v1/generate-model/ifcs/{ifcId}/generate-model/
   */
  async triggerGeneration(ifcId: string): Promise<ApiResponse<any>> {
    return apiClient.post(`/generate-model/ifcs/${ifcId}/generate-model/`, {});
  }

  /**
   * Get IFC generation status
   * GET /api/v1/generate-model/ifcs/{ifcId}/
   */
  async getIFCStatus(ifcId: string): Promise<ApiResponse<GeneratedIFC>> {
    return apiClient.get(`/generate-model/ifcs/${ifcId}/`);
  }

  /**
   * Get download information for a generated IFC file
   * GET /api/v1/generate-model/ifcs/{ifcId}/download/
   */
  async getIFCDownloadInfo(ifcId: string): Promise<ApiResponse<{ download_url: string; filename: string }>> {
    return apiClient.get(`/generate-model/ifcs/${ifcId}/download/`);
  }

  /**
   * Download an IFC file
   */
  async downloadIFCFile(downloadUrl: string): Promise<Blob> {
    return apiClient.downloadFile(downloadUrl);
  }

  /**
   * Get a specific generated IFC by ID
   * GET /api/v1/generate-model/ifcs/{ifcId}/
   */
  async getGeneratedIFC(ifcId: string): Promise<ApiResponse<GeneratedIFC>> {
    return apiClient.get(`/generate-model/ifcs/${ifcId}/`);
  }

  /**
   * Build type_metadata according to the schema definitions in your backend
   * This creates the exact structure your backend expects for validation
   */
  private buildTypeMetadata(formData: any): Record<string, any> {
    const metadata: Record<string, any> = {};
    const desc = formData.description?.toLowerCase() || '';
    const specs = formData.specialRequirements?.toLowerCase() || '';
    const combinedText = desc + ' ' + specs;

    // Log which schema we're building for (helpful for debugging)
    const schemaKey = PROJECT_TYPE_TO_SCHEMA_MAP[formData.projectType];
    console.debug(`Building metadata for ${formData.projectType} using schema: ${schemaKey}`);

    switch (formData.projectType) {
      case 'BUILDING':
        metadata.building_use = this.detectBuildingUse(combinedText);
        metadata.num_stories = Number(formData.floors) || 4;
        metadata.total_area = Number(formData.area) || 3000;
        metadata.occupancy_type = this.detectOccupancyType(combinedText);
        metadata.is_residential = /residential|apartment|condo|housing/i.test(combinedText);
        metadata.ground_floor_use = this.detectGroundFloorUse(combinedText);
        
        if (/leed|green|sustainable|energy efficient/i.test(combinedText)) {
          metadata.sustainability_features = ['leed_certification', 'energy_efficient'];
        }
        
        if (/smart|iot|automation|intelligent/i.test(combinedText)) {
          metadata.smart_features = ['building_automation', 'iot_sensors'];
        }

        if (/seismic|earthquake|quake resistant/i.test(combinedText)) {
          metadata.seismic_design = true;
          metadata.seismic_zone = this.detectSeismicZone(combinedText);
        }
        break;

      case 'INFRA_ROAD':
        metadata.road_class = this.detectRoadClass(combinedText);
        metadata.road_usage = this.detectRoadUsage(combinedText);
        metadata.num_lanes = this.detectLaneCount(combinedText) || 2;
        metadata.pavement_type = this.detectPavementType(combinedText);
        metadata.length = Number(formData.area) ? Number(formData.area) / 1000 : 1;
        metadata.design_speed = this.detectDesignSpeed(combinedText);
        
        if (/bridge|overpass|flyover/i.test(combinedText)) {
          metadata.includes_bridges = true;
        }
        if (/tunnel|underground/i.test(combinedText)) {
          metadata.includes_tunnels = true;
        }
        if (/smart|intelligent|iot/i.test(combinedText)) {
          metadata.smart_highway = true;
          metadata.its_systems = ['traffic_sensors', 'variable_signs'];
        }
        break;

      case 'INFRA_BRIDGE':
        metadata.bridge_type = this.detectBridgeType(combinedText);
        metadata.bridge_usage = this.detectBridgeUsage(combinedText);
        metadata.span_length = this.detectSpanLength(combinedText) || 50;
        metadata.total_length = Number(formData.area) || 100;
        metadata.material_system = this.detectBridgeMaterial(combinedText);
        metadata.clearance = this.detectClearance(combinedText) || 5;
        
        if (/pedestrian|walkway|foot/i.test(combinedText)) {
          metadata.pedestrian_walkway = true;
        }
        if (/railway|train|rail/i.test(combinedText)) {
          metadata.railway_integration = true;
        }
        if (/cable-stay|cable stay|suspension/i.test(combinedText)) {
          metadata.cable_system = true;
        }
        break;

      case 'SITE':
        metadata.site_area = Number(formData.area) || 5000;
        metadata.land_use = this.detectLandUse(combinedText);
        metadata.site_usage = this.detectSiteUsage(combinedText);
        metadata.zoning = this.detectZoning(combinedText);
        metadata.site_slope = this.detectSlope(combinedText);
        
        if (/park|green space|garden/i.test(combinedText)) {
          metadata.includes_park = true;
        }
        if (/parking|garage|car park/i.test(combinedText)) {
          metadata.parking_spaces = this.estimateParkingSpaces(combinedText) || 100;
        }
        if (/mixed[-\s]use|mixed use/i.test(combinedText)) {
          metadata.mixed_use_development = true;
        }
        break;

      case 'INFRA_RAILWAY':
        metadata.rail_type = this.detectRailType(combinedText);
        metadata.rail_usage = this.detectRailUsage(combinedText);
        metadata.track_type = this.detectTrackType(combinedText);
        metadata.electrification = /electric|electrified|overhead lines/i.test(combinedText);
        metadata.max_speed = this.detectMaxSpeed(combinedText) || 160;
        metadata.num_tracks = this.detectTrackCount(combinedText) || 2;
        metadata.line_length = Number(formData.area) ? Number(formData.area) / 1000 : 10;
        
        if (/high[-\s]speed|tgv|shinkansen/i.test(combinedText)) {
          metadata.high_speed_rail = true;
        }
        break;

      case 'INFRA_TUNNEL':
        metadata.tunnel_type = this.detectTunnelType(combinedText);
        metadata.tunnel_usage = this.detectTunnelUsage(combinedText);
        metadata.length = Number(formData.area) || 500;
        metadata.cross_section_type = this.detectCrossSection(combinedText);
        metadata.diameter = /circular|bore/i.test(combinedText) ? 10 : undefined;
        metadata.width = /rectangular|box/i.test(combinedText) ? 12 : undefined;
        metadata.height = /rectangular|box/i.test(combinedText) ? 8 : undefined;
        metadata.construction_method = this.detectConstructionMethod(combinedText);
        
        if (/ventilation|air quality/i.test(combinedText)) {
          metadata.ventilation_system = true;
        }
        if (/emergency|evacuation|safety/i.test(combinedText)) {
          metadata.emergency_systems = ['evacuation_lighting', 'emergency_exits'];
        }
        break;

      case 'INFRA_MARINE':
        metadata.facility_type = this.detectMarineFacilityType(combinedText);
        metadata.facility_usage = this.detectMarineUsage(combinedText);
        metadata.water_depth = this.detectWaterDepth(combinedText) || 10;
        metadata.berth_count = this.detectBerthCount(combinedText) || 5;
        
        if (/container|cargo/i.test(combinedText)) {
          metadata.container_handling = true;
        }
        if (/passenger|cruise|ferry/i.test(combinedText)) {
          metadata.passenger_terminal = true;
        }
        break;

      case 'INDUSTRIAL_FACTORY':
        metadata.manufacturing_type = this.detectManufacturingType(combinedText);
        metadata.facility_usage = this.detectIndustrialUsage(combinedText);
        metadata.production_capacity = this.detectProductionCapacity(combinedText) || 1000;
        metadata.automation_level = this.detectAutomationLevel(combinedText);
        
        if (/robotics|automated|automation/i.test(combinedText)) {
          metadata.automated_systems = true;
        }
        if (/lean|just in time|jit/i.test(combinedText)) {
          metadata.lean_manufacturing = true;
        }
        break;

      case 'INFRA_DISTRIBUTION':
        metadata.system_type = this.detectUtilityType(combinedText);
        metadata.system_usage = this.detectUtilityUsage(combinedText);
        metadata.network_length = Number(formData.area) ? Number(formData.area) / 1000 : 10;
        metadata.design_capacity = this.detectDesignCapacity(combinedText) || 100;
        
        if (/redundant|backup|failover/i.test(combinedText)) {
          metadata.redundancy_type = 'dual_line';
        }
        break;
    }

    return metadata;
  }

  /**
   * Main method to generate a model from form data
   * This orchestrates the entire backend flow:
   * 1. Create Project
   * 2. Create Site
   * 3. Create IFC Generation Job
   */
  async generateModel(formData: any): Promise<{ ifc: GeneratedIFC }> {
    try {
      console.log('Starting model generation with data:', formData);

      // Step 1: Create the project with proper backend types
      const projectRes = await this.createProject({
        name: formData.projectName,
        description: formData.description,
        project_type: formData.projectType,
        project_number: `PRJ-${Date.now().toString().slice(-6)}`,
        phase: 'concept',
        client_name: formData.clientName || 'Not Specified',
        project_address: formData.location,
        project_scale: formData.projectScale || 'medium',
        risk_classification: formData.riskClassification || 'medium',
      });

      if (!projectRes.success || !projectRes.data?.id) {
        throw new Error(projectRes.message || 'Failed to create project');
      }

      const projectId = projectRes.data.id;
      console.log('Project created successfully:', projectId);

      // Step 2: Build type_metadata based on project type and user input
      const typeMetadata = this.buildTypeMetadata(formData);
      console.log('Built type metadata:', typeMetadata);
      
      // Step 3: Create site with proper backend structure
      const siteRes = await this.createSite({
        project: projectId,
        site_name: formData.siteName || 'Main Site',
        project_type: formData.projectType,
        address: formData.location,
        latitude: 40.7128, // Default - can be made configurable
        longitude: -74.0060,
        coordinate_reference_system: 'epsg:4326',
        length_unit: 'm',
        area_unit: 'm2',
        volume_unit: 'm3',
        ifc_schema_version: 'ifc4x3',
        type_metadata: typeMetadata,
        true_north_angle: 0,
        project_north_angle: 0,
        angle_unit: 'degree',
        precision: 0.0001,
      });

      if (!siteRes.success || !siteRes.data?.id) {
        throw new Error(siteRes.message || 'Failed to create site');
      }

      console.log('Site created successfully:', siteRes.data.id);

      // Step 4: Map project type to asset type for IFC generation
      const assetTypeMap: Record<string, string> = {
        'BUILDING': 'building',
        'INFRA_ROAD': 'road',
        'INFRA_RAILWAY': 'railway',
        'INFRA_BRIDGE': 'bridge',
        'INFRA_TUNNEL': 'tunnel',
        'INFRA_MARINE': 'seaport',
        'INDUSTRIAL_FACTORY': 'industrial',
        'INDUSTRIAL_PLANT': 'industrial',
        'INFRA_DISTRIBUTION': 'utility_network',
        'SITE': 'site',
        'OTHER': 'other'
      };

      // Step 5: Create IFC generation job
      const ifcRes = await this.createIFCGenerationJob({
        project_id: projectId,
        asset_type: assetTypeMap[formData.projectType] || 'building',
        ifc_schema_version: 'ifc4x3',
        specifications: {
          floors: Number(formData.floors) || 1,
          total_area_m2: Number(formData.area) || 1000,
          budget_usd: formData.budget ? Number(formData.budget) : undefined,
          timeline: formData.timeline,
          location: formData.location,
          contact_email: formData.contactEmail,
          special_requirements: formData.specialRequirements,
          type_metadata: typeMetadata,
          description: formData.description,
          project_name: formData.projectName,
        },
      });

      if (!ifcRes.success || !ifcRes.data?.id) {
        throw new Error(ifcRes.message || 'Failed to queue IFC generation');
      }

      console.log('IFC generation job created successfully:', ifcRes.data.id);

      return { ifc: ifcRes.data };
    } catch (error: any) {
      console.error('Model generation failed:', error);
      throw error;
    }
  }

  // ==================== DETECTION HELPER METHODS ====================
  // These methods analyze user input to populate type_metadata fields

  private detectBuildingUse(text: string): string {
    if (/residential|apartment|condo|housing/i.test(text)) return 'residential';
    if (/commercial|office|retail|shopping/i.test(text)) return 'commercial';
    if (/industrial|warehouse|factory/i.test(text)) return 'industrial';
    if (/hospital|clinic|medical|healthcare/i.test(text)) return 'institutional';
    if (/school|university|college|educational/i.test(text)) return 'institutional';
    if (/mixed[- ]use|combined/i.test(text)) return 'mixed_use';
    return 'residential';
  }

  private detectOccupancyType(text: string): string {
    if (/residential|apartment|condo/i.test(text)) return 'R-2';
    if (/commercial|office/i.test(text)) return 'B';
    if (/hospital|clinic|medical/i.test(text)) return 'I-2';
    if (/school|university|educational/i.test(text)) return 'E';
    if (/industrial|warehouse|factory/i.test(text)) return 'F-1';
    if (/assembly|theater|auditorium|church/i.test(text)) return 'A-1';
    return 'B';
  }

  private detectGroundFloorUse(text: string): string {
    if (/retail|shop|store/i.test(text)) return 'retail';
    if (/lobby|entrance|reception/i.test(text)) return 'lobby';
    if (/restaurant|cafe|dining/i.test(text)) return 'restaurant';
    if (/parking|garage/i.test(text)) return 'parking';
    return 'lobby';
  }

  private detectSeismicZone(text: string): string {
    if (/high seismic|zone 4|high risk/i.test(text)) return 'high';
    if (/moderate seismic|zone 3|medium risk/i.test(text)) return 'moderate';
    if (/low seismic|zone 2|low risk/i.test(text)) return 'low';
    return 'moderate';
  }

  private detectRoadClass(text: string): string {
    if (/highway|freeway|motorway|interstate/i.test(text)) return 'highway';
    if (/arterial|main road|boulevard/i.test(text)) return 'arterial';
    if (/collector|connector|link/i.test(text)) return 'collector';
    if (/local|neighborhood|residential street/i.test(text)) return 'local';
    if (/service|access|frontage/i.test(text)) return 'service';
    return 'urban';
  }

  private detectRoadUsage(text: string): string {
    if (/urban|city|downtown/i.test(text)) return 'urban';
    if (/suburban|residential area/i.test(text)) return 'suburban';
    if (/rural|country|highway/i.test(text)) return 'rural';
    return 'mixed';
  }

  private detectLaneCount(text: string): number {
    const match = text.match(/(\d+)[-\s]lane|\b(\d+)\s+lanes?\b/i);
    if (match) return parseInt(match[1] || match[2]);
    
    if (/6-lane|six lane|wide highway/i.test(text)) return 6;
    if (/4-lane|four lane|divided highway/i.test(text)) return 4;
    if (/2-lane|two lane|narrow road/i.test(text)) return 2;
    return 2;
  }

  private detectPavementType(text: string): string {
    if (/asphalt|blacktop|paved/i.test(text)) return 'asphalt';
    if (/concrete|cement|rigid/i.test(text)) return 'concrete';
    if (/gravel|unpaved|dirt/i.test(text)) return 'gravel';
    if (/brick|paver|cobblestone/i.test(text)) return 'brick_paver';
    if (/permeable|porous|green pavement/i.test(text)) return 'permeable';
    return 'asphalt';
  }

  private detectDesignSpeed(text: string): number {
    const match = text.match(/(\d+)[-\s]mph|\b(\d+)\s+mph\b|(\d+)[-\s]km\/h/i);
    if (match) {
      const speed = parseInt(match[1] || match[2] || match[3]);
      if (match[0].includes('mph')) return Math.round(speed * 1.609);
      return speed;
    }
    
    if (/highway|freeway/i.test(text)) return 110;
    if (/arterial|main road/i.test(text)) return 80;
    if (/local|residential/i.test(text)) return 50;
    return 80;
  }

  private detectBridgeType(text: string): string {
    if (/suspension|golden gate/i.test(text)) return 'suspension';
    if (/cable-stay|cable stay/i.test(text)) return 'cable_stay';
    if (/arch|arched/i.test(text)) return 'arch';
    if (/beam|girder|simple/i.test(text)) return 'beam';
    if (/truss|through truss/i.test(text)) return 'truss';
    if (/composite|hybrid/i.test(text)) return 'composite';
    return 'beam';
  }

  private detectBridgeUsage(text: string): string {
    if (/vehicular|car|truck|vehicle/i.test(text)) return 'vehicular';
    if (/pedestrian|foot|walkway|bike/i.test(text)) return 'pedestrian';
    if (/railway|train|rail/i.test(text)) return 'railway';
    if (/pipeline|conveyor|utility/i.test(text)) return 'pipeline';
    if (/combined|multi-use|multi purpose/i.test(text)) return 'combined';
    return 'vehicular';
  }

  private detectSpanLength(text: string): number {
    const match = text.match(/(\d+)[-\s]meter|\b(\d+)\s+meters?\b|\b(\d+)[-\s]m\b/i);
    if (match) return parseInt(match[1] || match[2] || match[3]);
    
    if (/long span|major bridge/i.test(text)) return 200;
    if (/medium span|river bridge/i.test(text)) return 100;
    if (/short span|small bridge/i.test(text)) return 30;
    return 50;
  }

  private detectBridgeMaterial(text: string): string {
    if (/steel|metal/i.test(text)) return 'steel';
    if (/concrete|reinforced/i.test(text)) return 'concrete';
    if (/hybrid|composite/i.test(text)) return 'hybrid';
    if (/timber|wood|wooden/i.test(text)) return 'timber';
    if (/composite|frp|fiberglass/i.test(text)) return 'composite';
    return 'steel';
  }

  private detectClearance(text: string): number {
    const match = text.match(/(\d+)[-\s]meter clearance|\b(\d+)\s+meters?\s+clear/i);
    if (match) return parseInt(match[1] || match[2]);
    
    if (/high clearance|tall ships|navigation/i.test(text)) return 50;
    if (/low clearance|underpass/i.test(text)) return 4.5;
    return 5;
  }

  private detectLandUse(text: string): string {
    if (/commercial|business|retail/i.test(text)) return 'commercial';
    if (/residential|housing|apartment|condo/i.test(text)) return 'residential';
    if (/industrial|warehouse|factory/i.test(text)) return 'industrial';
    if (/agricultural|farm|farming/i.test(text)) return 'agricultural';
    if (/recreational|park|playground|sports/i.test(text)) return 'recreational';
    if (/mixed[- ]use|combined|mixed use/i.test(text)) return 'mixed_use';
    if (/public space|plaza|civic/i.test(text)) return 'public_space';
    return 'commercial';
  }

  private detectSiteUsage(text: string): string {
    if (/development|new construction|greenfield/i.test(text)) return 'development';
    if (/shopping center|mall|retail center/i.test(text)) return 'shopping_center';
    if (/residential development|housing development/i.test(text)) return 'residential_development';
    if (/public park|green space|garden/i.test(text)) return 'public_park';
    if (/industrial zone|business park/i.test(text)) return 'industrial_zone';
    return 'development';
  }

  private detectZoning(text: string): string {
    if (/mixed[- ]use/i.test(text)) return 'mixed-use';
    if (/commercial|business/i.test(text)) return 'commercial';
    if (/residential|housing/i.test(text)) return 'residential';
    if (/industrial|manufacturing/i.test(text)) return 'industrial';
    return 'mixed-use';
  }

  private detectSlope(text: string): string {
    if (/flat|level|even/i.test(text)) return 'flat';
    if (/gentle|slight slope|rolling/i.test(text)) return 'gentle';
    if (/moderate|hillside|sloping/i.test(text)) return 'moderate';
    if (/steep|mountainous|cliff/i.test(text)) return 'steep';
    return 'gentle';
  }

  private estimateParkingSpaces(text: string): number {
    const match = text.match(/(\d+)[-\s]space|\b(\d+)\s+spaces?\b|\b(\d+)[-\s]car/i);
    if (match) return parseInt(match[1] || match[2] || match[3]);
    
    if (/large|extensive|multi-level/i.test(text)) return 500;
    if (/medium|moderate/i.test(text)) return 200;
    if (/small|limited/i.test(text)) return 50;
    return 100;
  }

  private detectRailType(text: string): string {
    if (/standard gauge|standard-gauge/i.test(text)) return 'standard_gauge';
    if (/narrow gauge|narrow-gauge|mountain railway/i.test(text)) return 'narrow_gauge';
    if (/broad gauge|broad-gauge|russian gauge/i.test(text)) return 'broad_gauge';
    return 'standard_gauge';
  }

  private detectRailUsage(text: string): string {
    if (/high[-\s]speed|tgv|shinkansen/i.test(text)) return 'high_speed';
    if (/commuter|suburban|local/i.test(text)) return 'commuter';
    if (/freight|cargo|goods/i.test(text)) return 'freight';
    if (/light rail|tram|streetcar/i.test(text)) return 'light_rail';
    if (/heritage|tourist|historic/i.test(text)) return 'heritage';
    if (/metro|subway|underground/i.test(text)) return 'metro';
    return 'commuter';
  }

  private detectTrackType(text: string): string {
    if (/ballasted|traditional|gravel/i.test(text)) return 'ballasted';
    if (/slab track|concrete track|slab-track/i.test(text)) return 'slab';
    if (/viaduct|elevated|bridge track/i.test(text)) return 'viaduct';
    if (/elevated|aerial|skyrail/i.test(text)) return 'elevated';
    if (/underground|subway|tube/i.test(text)) return 'underground';
    return 'ballasted';
  }

  private detectMaxSpeed(text: string): number {
    const match = text.match(/(\d+)[-\s]km\/h|\b(\d+)\s+km\/h|\b(\d+)[-\s]mph/i);
    if (match) {
      const speed = parseInt(match[1] || match[2] || match[3]);
      if (match[0].includes('mph')) return Math.round(speed * 1.609);
      return speed;
    }
    
    if (/high[-\s]speed|tgv/i.test(text)) return 300;
    if (/express|fast/i.test(text)) return 200;
    if (/commuter|local/i.test(text)) return 120;
    if (/freight|cargo/i.test(text)) return 100;
    return 160;
  }

  private detectTrackCount(text: string): number {
    const match = text.match(/(\d+)[-\s]track|\b(\d+)\s+tracks?\b|\b(\d+)-line/i);
    if (match) return parseInt(match[1] || match[2] || match[3]);
    
    if (/double track|two-track|2-track/i.test(text)) return 2;
    if (/single track|one-track|1-track/i.test(text)) return 1;
    if (/multi-track|multiple tracks|4-track/i.test(text)) return 4;
    return 2;
  }

  private detectTunnelType(text: string): string {
    if (/road|highway|vehicular/i.test(text)) return 'road';
    if (/rail|railway|train|metro/i.test(text)) return 'rail';
    if (/utility|service|cable|pipe/i.test(text)) return 'utility';
    if (/pedestrian|foot|walkway/i.test(text)) return 'pedestrian';
    if (/metro|subway|underground rail/i.test(text)) return 'metro';
    if (/mining|mine|extraction/i.test(text)) return 'mining';
    return 'road';
  }

  private detectTunnelUsage(text: string): string {
    if (/water transport|aqueduct|water supply/i.test(text)) return 'water_transport';
    if (/cable conduit|power cable|electrical/i.test(text)) return 'cable_conduit';
    if (/evacuation|emergency|escape/i.test(text)) return 'evacuation';
    if (/mixed traffic|combined|multi-use/i.test(text)) return 'mixed_traffic';
    return 'mixed_traffic';
  }

  private detectCrossSection(text: string): string {
    if (/circular|bore|round|tbm/i.test(text)) return 'circular';
    if (/horseshoe|arched|mine style/i.test(text)) return 'horseshoe';
    if (/rectangular|box|square|cut and cover/i.test(text)) return 'rectangular';
    if (/obround|oval|elliptical/i.test(text)) return 'obround';
    return 'circular';
  }

  private detectConstructionMethod(text: string): string {
    if (/drill[-\s]and[-\s]blast|drill & blast|drilling and blasting/i.test(text)) return 'drill_blast';
    if (/tbm|tunnel boring machine|boring machine|mechanical excavation/i.test(text)) return 'tbm';
    if (/cut[-\s]and[-\s]cover|cut & cover|open excavation/i.test(text)) return 'cut_cover';
    if (/immersed tube|immersed|sunken tube/i.test(text)) return 'immersed';
    if (/open cut|open excavation|surface excavation/i.test(text)) return 'open_cut';
    return 'tbm';
  }

  private detectMarineFacilityType(text: string): string {
    if (/port|harbor|harbour/i.test(text)) return 'port';
    if (/pier|wharf|jetty/i.test(text)) return 'pier';
    if (/dock|dry dock|graving dock/i.test(text)) return 'dock';
    if (/marina|yacht|boat harbor/i.test(text)) return 'marina';
    if (/breakwater|seawall|wave breaker/i.test(text)) return 'breakwater';
    if (/offshore|platform|rig/i.test(text)) return 'offshore';
    return 'port';
  }

  private detectMarineUsage(text: string): string {
    if (/container|cargo|freight|shipping/i.test(text)) return 'container';
    if (/bulk|cargo|grain|ore|coal/i.test(text)) return 'bulk_cargo';
    if (/passenger|cruise|ferry/i.test(text)) return 'passenger';
    if (/fishing|fishery|fish/i.test(text)) return 'fishing';
    if (/recreation|recreational|leisure|pleasure/i.test(text)) return 'recreation';
    if (/naval|military|navy|warship/i.test(text)) return 'naval';
    return 'container';
  }

  private detectWaterDepth(text: string): number {
    const match = text.match(/(\d+)[-\s]meter depth|\b(\d+)\s+meters?\s+depth|\b(\d+)[-\s]m deep/i);
    if (match) return parseInt(match[1] || match[2] || match[3]);
    
    if (/deep water|deep draft|deepsea/i.test(text)) return 15;
    if (/shallow water|shallow draft|nearshore/i.test(text)) return 5;
    return 10;
  }

  private detectBerthCount(text: string): number {
    const match = text.match(/(\d+)[-\s]berth|\b(\d+)\s+berths?\b|\b(\d+)[-\s]dock/i);
    if (match) return parseInt(match[1] || match[2] || match[3]);
    
    if (/large|major|international/i.test(text)) return 10;
    if (/medium|regional/i.test(text)) return 5;
    if (/small|local/i.test(text)) return 2;
    return 5;
  }

  private detectManufacturingType(text: string): string {
    if (/automotive|car|vehicle|auto/i.test(text)) return 'automotive';
    if (/electronics|circuit|semiconductor|pcb/i.test(text)) return 'electronics';
    if (/food|beverage|processing|packaging/i.test(text)) return 'food_beverage';
    if (/textile|fabric|clothing|garment/i.test(text)) return 'textiles';
    if (/chemical|chemicals|petrochemical/i.test(text)) return 'chemicals';
    if (/machinery|machine|equipment|heavy equipment/i.test(text)) return 'machinery';
    if (/pharma|pharmaceutical|drug|medicine/i.test(text)) return 'pharmaceuticals';
    return 'other';
  }

  private detectIndustrialUsage(text: string): string {
    if (/assembly|production line/i.test(text)) return 'assembly';
    if (/component|parts|manufacturing/i.test(text)) return 'component_production';
    if (/heavy|steel|metal|forging/i.test(text)) return 'heavy_processing';
    if (/light|small parts|precision/i.test(text)) return 'light_assembly';
    if (/mixed|multiple|variety/i.test(text)) return 'mixed';
    return 'assembly';
  }

  private detectProductionCapacity(text: string): number {
    const match = text.match(/(\d+)[-\s]units? per day|\b(\d+)\s+units?\/day|\b(\d+)[-\s]t\/day/i);
    if (match) return parseInt(match[1] || match[2] || match[3]);
    
    if (/large scale|high volume|mass production/i.test(text)) return 10000;
    if (/medium scale|medium volume/i.test(text)) return 1000;
    if (/small scale|low volume|prototype/i.test(text)) return 100;
    return 1000;
  }

  private detectAutomationLevel(text: string): string {
    if (/fully automated|lights out|unmanned/i.test(text)) return 'fully_automated';
    if (/automated|robotics|robots/i.test(text)) return 'automated';
    if (/semi-automated|semi automated|partial automation/i.test(text)) return 'semi_automated';
    if (/manual|hand|craftsmanship/i.test(text)) return 'manual';
    return 'semi_automated';
  }

  private detectUtilityType(text: string): string {
    if (/electrical|power|electricity|grid/i.test(text)) return 'electrical';
    if (/water|potable|drinking|supply/i.test(text)) return 'water';
    if (/gas|natural gas|propane/i.test(text)) return 'gas';
    if (/sewer|wastewater|sanitary|sewage/i.test(text)) return 'sewer';
    if (/stormwater|drainage|storm drain/i.test(text)) return 'stormwater';
    if (/heating|district heating|thermal/i.test(text)) return 'district_heating';
    if (/telecom|communication|fiber|broadband/i.test(text)) return 'telecom';
    if (/pipeline|fuel|oil|petroleum/i.test(text)) return 'fuel_pipeline';
    return 'electrical';
  }

  private detectUtilityUsage(text: string): string {
    if (/municipal|city|urban|town/i.test(text)) return 'municipal_supply';
    if (/transmission|high voltage|bulk power/i.test(text)) return 'power_transmission';
    if (/distribution|local|neighborhood/i.test(text)) return 'distribution';
    if (/industrial|factory|plant|heavy/i.test(text)) return 'industrial_supply';
    if (/commercial|business|retail/i.test(text)) return 'commercial_supply';
    return 'municipal_supply';
  }

  private detectDesignCapacity(text: string): number {
    const match = text.match(/(\d+)[-\s]mw|\b(\d+)\s+mw\b|(\d+)[-\s]mwd|\b(\d+)\s+m³\/day/i);
    if (match) return parseInt(match[1] || match[2] || match[3]);
    
    if (/large|major|high capacity/i.test(text)) return 500;
    if (/medium|moderate/i.test(text)) return 100;
    if (/small|limited|local/i.test(text)) return 20;
    return 100;
  }
}

export const generateModelService = new GenerateModelService();
export default generateModelService;