import '@testing-library/jest-dom/vitest';
import { vi, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock scrollTo
window.scrollTo = vi.fn();

// Mock ResizeObserver
class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

// Mock IntersectionObserver
class MockIntersectionObserver {
  root = null;
  rootMargin = '';
  thresholds = [];
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn();
}

window.ResizeObserver = MockResizeObserver as any;
window.IntersectionObserver = MockIntersectionObserver as any;

// Mock DOMMatrix for PDF.js
if (typeof window.DOMMatrix === 'undefined') {
  // @ts-ignore
  window.DOMMatrix = class DOMMatrix {
    constructor() {}
    a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
    m11 = 1; m12 = 0; m13 = 0; m14 = 0;
    m21 = 0; m22 = 1; m23 = 0; m24 = 0;
    m31 = 0; m32 = 0; m33 = 1; m34 = 0;
    m41 = 0; m42 = 0; m43 = 0; m44 = 1;
    is2D = true;
    isIdentity = true;
    multiply = () => this;
    inverse = () => this;
    translate = () => this;
    scale = () => this;
    rotate = () => this;
    rotateFromVector = () => this;
    rotateAxisAngle = () => this;
    skewX = () => this;
    skewY = () => this;
    toString = () => 'matrix(1, 0, 0, 1, 0, 0)';
    static fromMatrix = () => new DOMMatrix();
    static fromFloat32Array = () => new DOMMatrix();
    static fromFloat64Array = () => new DOMMatrix();
  };
}

// Mock react-pdf
vi.mock('react-pdf', () => ({
  Document: () => null,
  Page: () => null,
  pdfjs: {
    GlobalWorkerOptions: {
      workerSrc: '',
    },
  },
}));

// Mock pdfjs-dist
vi.mock('pdfjs-dist', () => ({
  default: {
    GlobalWorkerOptions: {
      workerSrc: '',
    },
    getDocument: () => ({
      promise: Promise.resolve({
        numPages: 1,
        getPage: () => Promise.resolve({
          getViewport: () => ({ width: 100, height: 100 }),
          render: () => Promise.resolve(),
        }),
      }),
    }),
  },
  GlobalWorkerOptions: {
    workerSrc: '',
  },
}));

// Mock react-router-dom hooks
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/' }),
    useParams: () => ({}),
  };
});

// Suppress specific console errors
const originalError = console.error;
console.error = (...args: any[]) => {
  const firstArg = String(args[0]);
  
  // Suppress expected warnings
  if (
    firstArg.includes('Warning: ReactDOM.render is no longer supported') ||
    firstArg.includes('Warning: useLayoutEffect does nothing on the server') ||
    firstArg.includes('Not implemented: navigation') ||
    firstArg.includes('Warning: validateDOMNesting') ||
    firstArg.includes('Warning: An update to') ||
    firstArg.includes('Inside a test was not wrapped in act')
  ) {
    return;
  }
  
  originalError.call(console, ...args);
};