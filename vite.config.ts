import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Use '/api/' with a trailing slash so it strictly matches API routes (e.g., /api/login)
      // and ignores source files starting with 'api' (e.g., /api.ts)
      '/api/': {
        target: 'http://127.0.0.1:8999',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});