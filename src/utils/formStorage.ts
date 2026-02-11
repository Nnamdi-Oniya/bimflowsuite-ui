// src/utils/formStorage.ts
export interface FormData {
  projectType?: string;
  projectName?: string;
  description?: string;
  floors?: string;
  area?: string;
  location?: string;
  budget?: string;
  timeline?: string;
  specialRequirements?: string;
  contactEmail?: string;
  mainSpanLength?: string;
  roadLength?: string;
  numberOfLanes?: string;
  
  // Add other common fields that might be shared
  projectCategory?: string;
  buildingType?: string;
  infrastructureType?: string;
  industrialType?: string;
  civilWorksType?: string;
  projectScale?: string;
  clientType?: string;
  lodTarget?: string;
  deliveryFormat?: string;
  numberOfModels?: number;
}

const FORM_STORAGE_KEY = 'bimflow_model_form_data';

export const saveFormData = (formData: FormData): void => {
  try {
    localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formData));
  } catch (error) {
    console.warn('Failed to save form data:', error);
  }
};

export const loadFormData = (): FormData | null => {
  try {
    const data = localStorage.getItem(FORM_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.warn('Failed to load form data:', error);
    return null;
  }
};

export const clearFormData = (): void => {
  localStorage.removeItem(FORM_STORAGE_KEY);
};

export const getProjectParams = (formData: FormData): any => {
  return {
    // Core project info
    project_type: formData.projectType || '',
    project_name: formData.projectName?.trim() || '',
    description: formData.description?.trim() || '',
    project_category: formData.projectCategory || '',
    building_type: formData.buildingType || '',
    infrastructure_type: formData.infrastructureType || '',
    industrial_type: formData.industrialType || '',
    civil_works_type: formData.civilWorksType || '',
    project_scale: formData.projectScale || '',
    client_type: formData.clientType || '',
    
    // Specifications
    floors: formData.floors ? Number(formData.floors) : null,
    area: formData.area ? Number(formData.area) : null,
    location: formData.location?.trim() || null,
    budget: formData.budget ? Number(formData.budget) : null,
    timeline: formData.timeline || null,
    special_requirements: formData.specialRequirements?.trim() || null,
    main_span_length: formData.mainSpanLength ? Number(formData.mainSpanLength) : null,
    road_length: formData.roadLength ? Number(formData.roadLength) : null,
    number_of_lanes: formData.numberOfLanes ? Number(formData.numberOfLanes) : null,
    contact_email: formData.contactEmail || '',
    
    // BIM specific
    lod_target: formData.lodTarget || '',
    delivery_format: formData.deliveryFormat || '',
    number_of_models: formData.numberOfModels || 1,
  };
};