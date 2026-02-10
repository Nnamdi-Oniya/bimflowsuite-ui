import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  console.log(`🚀 Mode: ${mode}`);
  console.log(`🌐 Using backend target: ${env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'}`);

  return {
    plugins: [react()],

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
          target: 'http://127.0.0.1:8000', // IPv4 loopback – prevents ::1 issues
          changeOrigin: true,
          secure: false,

          configure: (proxy, _options) => {
            proxy.on('proxyReq', (_proxyReq, _req, _res) => {
              console.log('[Proxy] → Sending:', _req.method, _req.url);
            });

            proxy.on('proxyRes', (_proxyRes, _req, _res) => {
              console.log('[Proxy] ← Received:', _proxyRes.statusCode, _req.url);
            });

            proxy.on('error', (err, _req, _res) => {
              console.log('[Proxy] Error:', err);
            });
          },
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

    test: {
      globals: true,
      css: true,
      environment: 'jsdom',
      setupFiles: ['./src/setupTests'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        include: ['src/**/*.{ts,tsx}'],
        exclude: ['src/main.tsx', 'src/vite-env.d.ts'],
      },
      exclude: ['node_modules', 'dist', '**/*.stories.{ts,tsx}'],
    },
  };
});