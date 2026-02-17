// src/types/project.ts
export interface Project {
  id: number;
  name: string;
  title: string;  // Make required
  description: string;  // Make required
  status: 'active' | 'completed' | 'archived' | 'pending';
  type: string;
  compliance: string;  // Make required
  assets: any[];  // Make required
  created_at: string;
  updated_at: string;
  lastUpdated: string;  // Make required
  teamSize: number;  // Make required
  thumbnail: string;  // Make required
}