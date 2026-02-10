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
    typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173',
  ),
} as const;

export const getBackendUrl = (): string => {
  if (ENV.isDevelopment && typeof window !== 'undefined') {
    return '';
  }

  if (ENV.backendUrl) {
    return ENV.backendUrl;
  }

  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8000';
  }

  return 'https://api.bimflowsuite.com';
};

export const getApiPrefix = (): string => ENV.apiPrefix;

export const BASE_URL: string = getBackendUrl() + getApiPrefix();

export const BACKEND_CONFIG = {
  get baseUrl(): string {
    return getBackendUrl();
  },
  apiPrefix: ENV.apiPrefix,
  timeout: 30000,
  uploadTimeout: 300000,

  endpoints: {
    auth: {
      login: '/auth/login/',
      register: '/auth/register/',
      logout: '/auth/logout/',
      verify: '/auth/verify/',
      refresh: '/token/refresh/',
      me: '/auth/me/',
      changePassword: '/auth/change-password/',
      resetPassword: '/auth/reset-password/',
      requestReset: '/auth/request-reset/',
      confirmReset: '/auth/confirm-reset/',
      activateAccount: '/auth/activate/',
      verifyActivationToken: '/auth/verify-activation-token/',
    },
    users: {
      list: '/users/',
      detail: (id: string | number) => `/users/${id}/`,
      update: (id: string | number) => `/users/${id}/`,
      delete: (id: string | number) => `/users/${id}/`,
      uploadAvatar: '/users/upload-avatar/',
      profile: '/users/profile/',
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

export interface TokenPair {
  access: string;
  refresh: string;
}

let accessToken: string | null = null;
let refreshToken: string | null = null;

if (typeof window !== 'undefined') {
  accessToken = localStorage.getItem('access_token');
  refreshToken = localStorage.getItem('refresh_token');
}

export const setTokens = (tokens: TokenPair): void => {
  accessToken = tokens.access;
  refreshToken = tokens.refresh;
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
  }
};

export const clearTokens = (): void => {
  accessToken = null;
  refreshToken = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
  }
};

export const getAccessToken = (): string | null => accessToken;
export const getRefreshToken = (): string | null => refreshToken;

export const isAuthenticated = (): boolean => {
  const token = getAccessToken();
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

export const getAuthHeaders = (): Record<string, string> => {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : {};
};

export const getWebSocketUrl = (endpoint: string): string => {
  const base = getBackendUrl() || (typeof window !== 'undefined' ? window.location.origin : '');
  const protocol = base.startsWith('https') ? 'wss' : 'ws';
  return `${protocol}://${base.replace(/^https?:\/\//, '')}${endpoint}`;
};