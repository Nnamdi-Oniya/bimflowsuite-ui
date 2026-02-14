// vite.config.ts
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';   // ← NEW
import path from 'path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      tsconfigPaths(),           // ← Add here (helps dev + build)
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

    esbuild: {
      drop: ['console', 'debugger'],
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
      css: true,
      environment: 'jsdom',

      setupFiles: ['./src/setupTests.ts'], // keep this — relative path is correct

      // Extra safety: explicitly repeat alias + plugin inside test
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        },
      },

      // Many people add the plugin here too (especially if setup file uses @/)
      plugins: [
        tsconfigPaths(),
      ],

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