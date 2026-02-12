// src/utils/formStorage.ts
export interface FormData {
  name?: string;
  description?: string;
  project_type?: string;
  phase?: string;
  client_name?: string;
  client_type?: string;
  project_scale?: string;
  risk_classification?: string;
  project_address?: string;
  project_start_date?: string;
  construction_start_date?: string;
  expected_completion_date?: string;
  site_name?: string;
  latitude?: string;
  longitude?: string;
  number_of_models?: number;
  lod_target?: string;
  delivery_format?: string;
  contact_email?: string;
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