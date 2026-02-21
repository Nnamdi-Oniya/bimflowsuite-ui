import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isProduction = mode === 'production';
  
  const backendUrl = isProduction 
    ? (env.VITE_BACKEND_URL || 'https://api.bimflowsuite.com')
    : (env.VITE_BACKEND_URL || 'http://127.0.0.1:8000');

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
        REACT_APP_ENV: JSON.stringify(env.VITE_APP_ENV || mode),
        REACT_APP_BACKEND_URL: JSON.stringify(backendUrl),
        REACT_APP_API_PREFIX: JSON.stringify(env.VITE_API_PREFIX || '/api/v1'),
        REACT_APP_DEBUG: JSON.stringify(env.VITE_DEBUG || 'false'),
        REACT_APP_VERSION: JSON.stringify(env.VITE_APP_VERSION || '1.0.0'),
        REACT_APP_FRONTEND_URL: JSON.stringify(env.VITE_FRONTEND_URL || backendUrl),
      },
    },

    server: {
      port: 5173,
      host: true,
      proxy: {
        '/api/v1': {
          target: backendUrl,
          changeOrigin: true,
          secure: isProduction,
        },
        '/api': {
          target: backendUrl,
          changeOrigin: true,
          secure: isProduction,
          rewrite: (path) => path.replace(/^\/api/, '/api/v1'),
        },
        '/ws': {
          target: backendUrl.replace('http', 'ws'),
          ws: true,
          changeOrigin: true,
          secure: isProduction,
        },
      },
    },

    build: {
      outDir: 'dist',
      sourcemap: mode === 'development',
      minify: isProduction ? 'terser' : false,
      terserOptions: isProduction ? {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
        format: {
          comments: false,
        },
      } : undefined,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            ui: ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          },
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        },
      },
      chunkSizeWarningLimit: 1000,
    },

    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@mui/material',
        '@mui/icons-material',
        '@emotion/react',
        '@emotion/styled',
        'axios',
      ],
    },

    preview: {
      port: 4173,
      host: true,
      proxy: {
        '/api/v1': {
          target: backendUrl,
          changeOrigin: true,
          secure: isProduction,
        },
        '/api': {
          target: backendUrl,
          changeOrigin: true,
          secure: isProduction,
          rewrite: (path) => path.replace(/^\/api/, '/api/v1'),
        },
        '/ws': {
          target: backendUrl.replace('http', 'ws'),
          ws: true,
          changeOrigin: true,
          secure: isProduction,
        },
      },
    },

    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/setupTests.ts'],
      alias: [
        { find: '@', replacement: path.resolve(__dirname, './src') }
      ],
      deps: {
        inline: [
          '@testing-library/user-event',
          'react-pdf',
          'pdfjs-dist'
        ],
        optimizer: {
          web: {
            include: ['react-pdf', 'pdfjs-dist']
          }
        }
      },
      include: ['src/test/**/*.{test,spec}.{js,jsx,ts,tsx}'],
      testTimeout: 10000,
      hookTimeout: 10000,
      environmentOptions: {
        jsdom: {
          resources: 'usable',
          runScripts: 'dangerously',
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