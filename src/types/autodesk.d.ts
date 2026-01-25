// Type definitions for Autodesk Forge Viewer
declare global {
  interface Window {
    Autodesk?: typeof Autodesk;
  }
}

export interface AutodeskViewerConfig {
  extensions?: string[];
  [key: string]: unknown;
}

export interface AutodeskInitOptions {
  env: string;
  api: string;
  getAccessToken: (callback: (token: string, expires: number) => void) => void;
}

export interface Viewer3D {
  start: (url?: string, options?: unknown, onSuccess?: () => void, onError?: (error: unknown) => void) => void;
  loadModel: (url: string, options?: unknown, onSuccess?: () => void, onError?: (error: unknown) => void) => void;
  finish: () => void;
  unloadModel: (model: unknown) => void;
  setIsolated: (dbIds: number[]) => void;
  fitToView: (dbIds?: number[]) => void;
  addEventListener: (event: string, callback: (event: unknown) => void) => void;
  removeEventListener: (event: string, callback: (event: unknown) => void) => void;
}

export interface AutodeskDocument {
  getRootItem: () => unknown;
  getViewablePath: (viewable: unknown) => Promise<string>;
}

export interface AutodeskViewing {
  Initializer: (options: AutodeskInitOptions, callback?: () => void) => void;
  Viewer3D: new (container: HTMLElement, config?: AutodeskViewerConfig) => Viewer3D;
  Document: {
    load: (urn: string, onSuccess: (doc: AutodeskDocument) => void, onError: (error: unknown) => void) => void;
  };
}

export interface Autodesk {
  Viewing: AutodeskViewing;
}

declare const Autodesk: Autodesk;

export default Autodesk;