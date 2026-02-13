// src/setupTests.ts
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';
import { Buffer } from 'buffer';

// Make vitest functions available globally (though globals:true should handle this)
// This is a backup

// -------------------------------------------------------
// Window mocks
// -------------------------------------------------------
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
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

Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: vi.fn(),
});

// -------------------------------------------------------
// React Router mocks
// -------------------------------------------------------
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({
      pathname: '/',
      search: '',
      hash: '',
      state: null,
      key: 'default',
    }),
    useParams: () => ({}),
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
    useRouteError: () => null,
  };
});

// -------------------------------------------------------
// Canvas mocks
// -------------------------------------------------------
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: vi.fn().mockReturnValue(null),
  writable: true,
});

vi.mock('canvas', async () => {
  const actual = await vi.importActual<any>('canvas');
  return {
    ...actual,
    createCanvas: vi.fn(() => ({
      getContext: vi.fn(() => null),
      toDataURL: vi.fn(() => 'data:image/png;base64,mock'),
      width: 100,
      height: 100,
      toBuffer: vi.fn(() => Buffer.from('')),
      dispose: vi.fn(),
    })),
    loadImage: vi.fn(() =>
      Promise.reject(new Error('Not supported in test environment'))
    ),
  };
});

// -------------------------------------------------------
// react-pdf mocks
// -------------------------------------------------------
vi.mock('react-pdf', () => ({
  Document: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="pdf-document-mock">{children}</div>
  ),
  Page: ({ pageNumber = 1 }: { pageNumber?: number }) => (
    <div data-testid={`pdf-page-mock-${pageNumber}`}>PDF Page {pageNumber}</div>
  ),
  Outline: () => null,
  pdfjs: {
    GlobalWorkerOptions: {
      workerSrc: 'pdfjs-worker-mock',
    },
  },
}));

// -------------------------------------------------------
// Plotly mocks
// -------------------------------------------------------
vi.mock('plotly.js-dist-min', () => {
  const mock = vi.fn();
  return {
    newPlot: mock,
    react: mock,
    purge: mock,
    addFrames: mock,
    respond: mock,
  };
});

vi.mock('plotly.js', () => {
  const mock = vi.fn();
  return {
    newPlot: mock,
    react: mock,
    purge: mock,
    addFrames: mock,
    respond: mock,
  };
});

// -------------------------------------------------------
// Suppress act() warnings (optional)
// -------------------------------------------------------
const originalError = console.error;
console.error = (...args) => {
  if (/Warning.*not wrapped in act/.test(args[0])) {
    return;
  }
  originalError.call(console, ...args);
};