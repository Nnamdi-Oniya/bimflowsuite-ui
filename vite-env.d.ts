/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_ENV: string
  readonly VITE_BACKEND_URL: string
  readonly VITE_API_PREFIX: string
  readonly VITE_DEBUG: string
  readonly VITE_APP_VERSION: string
  readonly VITE_FRONTEND_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// For backward compatibility with React scripts
declare namespace NodeJS {
  interface ProcessEnv {
    readonly REACT_APP_ENV: string
    readonly REACT_APP_BACKEND_URL: string
    readonly REACT_APP_API_PREFIX: string
    readonly REACT_APP_DEBUG: string
    readonly REACT_APP_VERSION: string
    readonly NODE_ENV: 'development' | 'production' | 'test'
  }
}