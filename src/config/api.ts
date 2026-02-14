// src/config/api.ts

type Env = Record<string, string | undefined>;
declare const process: { env: Env } | undefined;

const getEnv = (key: string, defaultValue: string = ''): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const viteKey = key.replace('REACT_APP_', 'VITE_');
    const value = import.meta.env[viteKey];
    if (value !== undefined) return String(value);
  }
  if (typeof process !== 'undefined' && process.env?.[key]) {
    return String(process.env[key]);
  }
  return defaultValue;
};

const isDevEnvironment = (): boolean => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    return (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.endsWith('.localhost') ||
      import.meta.env?.MODE === 'development'
    );
  }
  return getEnv('NODE_ENV') === 'development' || getEnv('REACT_APP_ENV') === 'development';
};

export const ENV = {
  isDevelopment: isDevEnvironment(),
  isProduction: !isDevEnvironment(),
  isTest: getEnv('NODE_ENV') === 'test',
  backendUrl: getEnv('REACT_APP_BACKEND_URL') || getEnv('VITE_BACKEND_URL'),
  apiPrefix: getEnv('REACT_APP_API_PREFIX', '/api/v1'),
  debug: getEnv('REACT_APP_DEBUG', 'false') === 'true',
  version: getEnv('REACT_APP_VERSION', '1.0.0'),
  frontendUrl: getEnv(
    'REACT_APP_FRONTEND_URL',
    typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173'
  ),
} as const;

export const getBackendUrl = (): string => {
  if (ENV.isDevelopment) return '';
  if (ENV.backendUrl) return ENV.backendUrl;
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  if (hostname === 'localhost' || hostname === '127.0.0.1') return 'http://localhost:8000';
  return 'https://api.bimflowsuite.com';
};

export const getApiPrefix = (): string => ENV.apiPrefix;
export const BASE_URL: string = ENV.isDevelopment ? '/api' : getBackendUrl() + getApiPrefix();

export const BACKEND_CONFIG = {
  get baseUrl(): string {
    return ENV.isDevelopment ? '' : getBackendUrl();
  },
  apiPrefix: ENV.apiPrefix,
  timeout: 30000,
  uploadTimeout: 300000,
  debug: ENV.debug,
  ENABLE_TOKEN_REFRESH: false,
  
  endpoints: {
    auth: {
      login: '/auth/login/',
      register: '/auth/register/',
      logout: '/auth/logout/',
      verify: '/auth/verify/',
      refresh: '/token/refresh/',
      changePassword: '/auth/change-password/',
      resetPassword: '/auth/reset-password/',
      requestReset: '/auth/forgot-password/',
      confirmReset: '/auth/reset-password/',
      activateAccount: '/auth/activate/',
      verifyActivationToken: '/auth/verify-activation-token/',
    },
    users: {
      list: '/users/',
      detail: (id: string | number) => `/users/${id}/`,
      update: (id: string | number) => `/users/${id}/`,
      delete: (id: string | number) => `/users/${id}/`,
      uploadAvatar: '/users/upload-avatar/',
      profile: '/user/profile/',
    },
    analytics: {
      dashboard: '/analytics/dashboard/',
      metrics: '/analytics/metrics/',
      reports: '/analytics/reports/',
      export: '/analytics/export/',
      projectAnalytics: (id: number) => `/analytics/projects/${id}/`,
    },
    compliance: {
      rules: '/compliance/rules/',
      ruleDetail: (id: number) => `/compliance/rules/${id}/`,
      checks: '/compliance/checks/',
      checkStatus: (jobId: string) => `/compliance/checks/${jobId}/`,
      reports: '/compliance/reports/',
      reportDetail: (id: number) => `/compliance/reports/${id}/`,
      reportDownload: (id: number) => `/compliance/reports/${id}/download/`,
      validate: '/compliance/validate/',
      upload: '/compliance/upload/',
    },
    parametric: {
      generate: '/parametric/generate/',
      templates: '/parametric/templates/',
      templateDetail: (id: number) => `/parametric/templates/${id}/`,
      configurations: '/parametric/configurations/',
      saveConfiguration: '/parametric/configurations/save/',
      export: '/parametric/export/',
      generationStatus: (jobId: string) => `/parametric/generations/${jobId}/`,
      generationCancel: (jobId: string) => `/parametric/generations/${jobId}/cancel/`,
      history: '/parametric/history/',
    },
    files: {
      upload: '/files/upload/',
      list: '/files/',
      detail: (id: string | number) => `/files/${id}/`,
      delete: (id: string | number) => `/files/${id}/`,
      download: (id: string | number) => `/files/${id}/download/`,
      update: (id: string | number) => `/files/${id}/`,
    },
    bimflow: {
      ifcUpload: '/bimflow/ifc/upload/',
      ifcParse: '/bimflow/ifc/parse/',
      ifcParseResult: (id: number) => `/bimflow/ifc/parse/${id}/`,
      modelView: '/bimflow/model/view/',
      modelViewDetail: (id: number) => `/bimflow/model/view/${id}/`,
      collaborate: '/bimflow/collaborate/',
      collaborateSession: (sessionId: string) => `/bimflow/collaborate/${sessionId}/`,
      collaborateJoin: (sessionId: string) => `/bimflow/collaborate/${sessionId}/join/`,
      collaborateLeave: (sessionId: string) => `/bimflow/collaborate/${sessionId}/leave/`,
      collaborateMessages: (sessionId: string) => `/bimflow/collaborate/${sessionId}/messages/`,
      modelStatistics: (fileId: number) => `/bimflow/model/${fileId}/statistics/`,
      modelExport: (fileId: number) => `/bimflow/model/${fileId}/export/`,
    },
    projects: {
      list: '/projects/',
      detail: (id: number) => `/projects/${id}/`,
      create: '/projects/',
      update: (id: number) => `/projects/${id}/`,
      delete: (id: number) => `/projects/${id}/`,
      teamMembers: (projectId: number) => `/projects/${projectId}/team-members/`,
      teamMemberDetail: (projectId: number, userId: number) =>
        `/projects/${projectId}/team-members/${userId}/`,
      files: (projectId: number) => `/projects/${projectId}/files/`,
      activities: (projectId: number) => `/projects/${projectId}/activities/`,
      archive: (projectId: number) => `/projects/${projectId}/archive/`,
      restore: (projectId: number) => `/projects/${projectId}/restore/`,
      duplicate: (projectId: number) => `/projects/${projectId}/duplicate/`,
      export: (projectId: number) => `/projects/${projectId}/export/`,
    },
    notifications: {
      list: '/notifications/',
      markRead: (id: number) => `/notifications/${id}/mark-read/`,
      markAllRead: '/notifications/mark-all-read/',
      delete: (id: number) => `/notifications/${id}/`,
      preferences: '/notifications/preferences/',
      test: '/notifications/test/',
    },
    requests: {
      submit: '/user/request-submission/',
      checkEmail: '/requests/check-email/',
    },
    health: '/health/',
    version: '/version/',
  },
  wsEndpoints: {
    notifications: '/ws/notifications/',
    collaboration: '/ws/collaboration/',
    uploadProgress: '/ws/upload-progress/',
    modelUpdates: '/ws/model-updates/',
  },
} as const;

// ==============================================
// TOKEN MANAGEMENT - ENCODED FOR SECURITY
// ==============================================

/**
 * Encode token for secure storage
 * Uses double encoding for extra security
 */
const encodeToken = (token: string): string => {
  try {
    // First encodeURIComponent, then base64
    return btoa(encodeURIComponent(token));
  } catch {
    return token;
  }
};

/**
 * Decode token from storage
 */
const decodeToken = (encoded: string): string => {
  try {
    // First base64 decode, then decodeURIComponent
    return decodeURIComponent(atob(encoded));
  } catch {
    return encoded;
  }
};

// In-memory cache for decoded tokens
let memoryAccessToken: string | null = null;
let memoryRefreshToken: string | null = null;

// Initialize from localStorage on load
if (typeof window !== 'undefined') {
  try {
    const encryptedAccess = localStorage.getItem('access_token');
    const encryptedRefresh = localStorage.getItem('refresh_token');
    
    memoryAccessToken = encryptedAccess ? decodeToken(encryptedAccess) : null;
    memoryRefreshToken = encryptedRefresh ? decodeToken(encryptedRefresh) : null;
  } catch {
    memoryAccessToken = null;
    memoryRefreshToken = null;
  }
}

export interface TokenPair {
  access: string;
  refresh: string;
}

/**
 * Store tokens securely
 * - Encoded in localStorage
 * - Decoded in memory for quick access
 */
export const setTokens = (tokens: TokenPair): void => {
  // Store decoded in memory
  memoryAccessToken = tokens.access;
  memoryRefreshToken = tokens.refresh;
  
  if (typeof window !== 'undefined') {
    try {
      // Store ENCODED in localStorage
      localStorage.setItem('access_token', encodeToken(tokens.access));
      localStorage.setItem('refresh_token', encodeToken(tokens.refresh));
      
      // Dispatch event for auth state change
      window.dispatchEvent(new CustomEvent('auth-state-changed', { 
        detail: { isAuthenticated: true } 
      }));
    } catch {
      // Silently fail if localStorage is unavailable
    }
  }
};

/**
 * Clear all tokens from memory and storage
 */
export const clearTokens = (): void => {
  memoryAccessToken = null;
  memoryRefreshToken = null;
  
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
      
      window.dispatchEvent(new CustomEvent('auth-state-changed', { 
        detail: { isAuthenticated: false } 
      }));
    } catch {
      // Silently fail
    }
  }
};

/**
 * Get access token (already decoded from memory)
 */
export const getAccessToken = (): string | null => {
  return memoryAccessToken;
};

/**
 * Get refresh token (already decoded from memory)
 */
export const getRefreshToken = (): string | null => {
  return memoryRefreshToken;
};

/**
 * Refresh tokens from storage
 * Call this on app initialization or after storage changes
 */
export const refreshTokensFromStorage = (): void => {
  if (typeof window !== 'undefined') {
    try {
      const encryptedAccess = localStorage.getItem('access_token');
      const encryptedRefresh = localStorage.getItem('refresh_token');
      
      if (encryptedAccess) {
        memoryAccessToken = decodeToken(encryptedAccess);
      } else {
        memoryAccessToken = null;
      }
      
      if (encryptedRefresh) {
        memoryRefreshToken = decodeToken(encryptedRefresh);
      } else {
        memoryRefreshToken = null;
      }
    } catch {
      memoryAccessToken = null;
      memoryRefreshToken = null;
    }
  }
};

// Initial refresh on module load
if (typeof window !== 'undefined') {
  refreshTokensFromStorage();
}

/**
 * Check if user is authenticated with valid token
 */
export const isAuthenticated = (): boolean => {
  const token = getAccessToken();
  if (!token) return false;
  
  try {
    // Decode JWT to check expiration
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    let padded = base64;
    while (padded.length % 4) padded += '=';
    
    const jsonPayload = decodeURIComponent(
      atob(padded)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    const payload = JSON.parse(jsonPayload);
    const exp = payload.exp;
    
    if (typeof exp !== 'number') return false;
    
    // Add 5 minute buffer (300,000 ms) to account for network lag
    return exp * 1000 > Date.now() + 300000;
  } catch {
    return false;
  }
};

/**
 * Get auth headers for API requests
 */
export const getAuthHeaders = (): Record<string, string> => {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// WebSocket URL helper
export const getWebSocketUrl = (endpoint: string): string => {
  const base = getBackendUrl() || (typeof window !== 'undefined' ? window.location.origin : '');
  const protocol = base.startsWith('https') ? 'wss' : 'ws';
  return `${protocol}://${base.replace(/^https?:\/\//, '')}${endpoint}`;
};

// Media URL Handling
export const getMediaBaseUrl = (): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env.VITE_MEDIA_BASE_URL) {
    return import.meta.env.VITE_MEDIA_BASE_URL as string;
  }
  const backendUrl = getBackendUrl();
  if (backendUrl) return backendUrl;
  if (ENV.isDevelopment) return 'http://localhost:8000';
  return 'https://api.bimflowsuite.com';
};

export const resolveMediaUrl = (path?: string | null): string => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('//')) {
    return path;
  }
  const base = getMediaBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
};