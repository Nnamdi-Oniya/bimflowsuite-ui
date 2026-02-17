import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
    ],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    define: {
      'process.env': {
        NODE_ENV: JSON.stringify(mode),
        REACT_APP_BACKEND_URL: JSON.stringify(env.VITE_BACKEND_URL),
        REACT_APP_API_PREFIX: JSON.stringify(env.VITE_API_PREFIX ?? '/api/v1'),
      },
    },

    server: {
      port: 5173,
      host: true,
      proxy: {
        '/api/v1': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
          secure: false,
        },
      },
    },

    build: {
      outDir: 'dist',
      sourcemap: mode === 'development',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            ui: ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          },
        },
      },
    },

    optimizeDeps: {
      include: [
        '@mui/material',
        '@mui/icons-material',
        '@emotion/react',
        '@emotion/styled',
      ],
    },

    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/setupTests.ts'],
      
      // Enable alias resolution in tests
      alias: [
        { find: '@', replacement: path.resolve(__dirname, './src') }
      ],
      
      deps: {
        inline: [
          '@testing-library/user-event',
          'react-pdf',
          'pdfjs-dist'
        ],
        // Optimize these dependencies for tests
        optimizer: {
          web: {
            include: ['react-pdf', 'pdfjs-dist']
          }
        }
      },
      
      include: ['src/test/**/*.{test,spec}.{js,jsx,ts,tsx}'],
      
      testTimeout: 10000,
      hookTimeout: 10000,
      
      // Mock browser APIs that might be missing
      environmentOptions: {
        jsdom: {
          resources: 'usable',
          runScripts: 'dangerously',
          // Add missing browser globals
          pretendToBeVisual: true,
        }
      },
      
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        include: ['src/**/*.{ts,tsx}'],
        exclude: ['src/main.tsx', 'src/vite-env.d.ts', 'src/test/**'],
      },

      exclude: ['node_modules', 'dist', '**/*.stories.{ts,tsx}'],
    },
  };
});