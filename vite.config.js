import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget =
    env.VITE_API_BASE_URL?.trim() || 'https://api.crickbro.com/';
  const normalizedTarget = apiTarget.endsWith('/') ? apiTarget : `${apiTarget}/`;

  return {
    plugins: [react()],
    base: '/',
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    server: {
      port: 3000,
      proxy: {
        '/webSiteApi': {
          target: normalizedTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path,
        },
      },
    },

    build: {
      chunkSizeWarningLimit: 1500,
    },
  };
});
