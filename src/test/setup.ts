import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
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
  thresholds: number[] = [];
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn();
}

window.ResizeObserver = MockResizeObserver as any;
window.IntersectionObserver = MockIntersectionObserver as any;

// Mock canvas (for Plotly / charts)
HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn(),
  putImageData: vi.fn(),
  createImageData: vi.fn(),
  setTransform: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  translate: vi.fn(),
  transform: vi.fn(),
  fillText: vi.fn(),
  strokeText: vi.fn(),
  measureText: vi.fn().mockReturnValue({ width: 0 }),
});

// Mock plotly
vi.mock('plotly.js-dist', () => ({
  default: {
    newPlot: vi.fn(),
    react: vi.fn(),
    update: vi.fn(),
  },
}));

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
        getPage: () =>
          Promise.resolve({
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

// Suppress expected console warnings in tests
const originalError = console.error;

console.error = (...args: unknown[]) => {
  const firstArg = String(args[0]);

  if (
    firstArg.includes('ReactDOM.render is no longer supported') ||
    firstArg.includes('useLayoutEffect does nothing on the server') ||
    firstArg.includes('Not implemented: navigation') ||
    firstArg.includes('validateDOMNesting') ||
    firstArg.includes('An update to') ||
    firstArg.includes('not wrapped in act') ||
    firstArg.includes('Cannot update a component') ||
    firstArg.includes('Too many auto-margin redraws')
  ) {
    return;
  }

  originalError.call(console, ...args);
};
