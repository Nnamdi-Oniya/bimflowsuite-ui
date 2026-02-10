// -----------------------------------------------------------------------------
// services/index.ts
// Single public entry point / barrel file for all business-logic services
// -----------------------------------------------------------------------------

// ── Low-level / shared infrastructure ───────────────────────────────────────
export { apiClient, type ApiResponse, type ApiError } from './apiClient';

// ── Authentication & Session ─────────────────────────────────────────────────
export { authService } from './authService';
export type {
  LoginCredentials,
  RegisterData,
  UserProfile,
  PasswordChangeData,
  PasswordResetData,
  PasswordResetConfirmData,
  TokenPair,
} from './authService';

// ── Current User Profile & Settings ──────────────────────────────────────────
export { userService } from './userService';
export type {
  UpdateProfileData,
  UserListParams,
  UserListResponse,
} from './userService';

// ── Projects ─────────────────────────────────────────────────────────────────
export { projectService } from './projectService';
export type {
  Project,
  CreateProjectData,
  UpdateProjectData,
  TeamMember,
  ProjectActivity,
  IFCUploadResponse,
  ProjectAnalysis,
} from './projectService';

// ── File / Storage Management ────────────────────────────────────────────────
export { fileService } from './fileService';
export type {
  FileMetadata,
  FileItem,
  UploadProgress,
  UploadOptions,
  UploadFileParams,
  FileListParams,
} from './fileService';

// ── BIM / IFC Processing ─────────────────────────────────────────────────────
export { bimflowService } from './bimflowService';
export type {
  IFCUploadParams,
  IFCParseResult,
  CollaborationSession,
} from './bimflowService';

// ── Compliance & Validation Engine ───────────────────────────────────────────
export { complianceService } from './complianceService';
export type {
  ComplianceRule,
  ComplianceCheck,
  ComplianceCheckRequest,
  ComplianceCheckResult,
  ComplianceReport,
  ValidationResult,
} from './complianceService';

// ── Parametric / Generative Design ───────────────────────────────────────────
export { modelService } from './modelService';      // ← renamed from parametricService for consistency
export type {
  ModelTemplate,
  ModelParameter,
  ModelGenerationRequest,
  GeneratedModel,
  ModelExportOptions,
  ParametricTemplate,
  GenerationParams,
  GenerationJob,
} from './modelService';

// ── Analytics & Reporting ────────────────────────────────────────────────────
export { analyticsService } from './analyticsService';
export type {
  DashboardStats,
  DashboardMetrics,
  AnalyticsInsight,
  AnalyticsReport,
  ProjectAnalytics,
  ChartData,
  ExportOptions,
} from './analyticsService';

// ── Notifications ────────────────────────────────────────────────────────────
export { notificationService } from './notificationService';
export type { Notification, NotificationPreferences } from './notificationService';

// ── Health / Monitoring ──────────────────────────────────────────────────────
export { healthService } from './healthService';
export type { HealthStatus, VersionInfo } from './healthService';

// ── Global Configuration & Token Helpers ─────────────────────────────────────
export {
  BACKEND_CONFIG,
  setTokens,
  clearTokens,
  getAccessToken,
  isAuthenticated,
  getAuthHeaders,
} from '../config/api';

// ── Optional: convenience object for dependency injection / testing ──────────
export const services = {
  api:        apiClient,
  auth:       authService,
  user:       userService,
  project:    projectService,
  file:       fileService,
  bimflow:    bimflowService,
  compliance: complianceService,
  model:      modelService,
  analytics:  analyticsService,
  notification: notificationService,
  health:     healthService,
} as const;

// Optional one-call initialization / warm-up (useful in dev / SSR scenarios)
export function initializeServices() {
  console.log('[Services] initialized');
  
  // You can add real initialization logic here later
  // e.g. authService.restoreSession(), analyticsService.initTracking(), etc.
  
  return services;
}

// Optional default export (some teams prefer it, some hate it)
export default services;