import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export const vitePort = 3000;

export default defineConfig(({ mode }) => {
  const apiTarget = process.env.VITE_API_URL || 'http://localhost:3001';

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './client/src'),
      },
    },
    root: path.join(process.cwd(), 'client'),
    build: {
      outDir: path.join(process.cwd(), 'server/public'),
      emptyOutDir: true,
    },
    clearScreen: false,
    server: {
      hmr: {
        overlay: false,
      },
      host: true,
      port: vitePort,
      allowedHosts: true,
      cors: true,
      proxy: {
        '/api/': {
          target: apiTarget,
          changeOrigin: true,
        },
        '/uploads/': {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
    css: {
      devSourcemap: true,
    },
    esbuild: {
      sourcemap: true,
    },
  };
});
