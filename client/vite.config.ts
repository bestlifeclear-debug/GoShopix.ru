import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@goshopix/shared': path.resolve(rootDir, '../shared/src'),
    },
  },
  server: {
    // Явный IPv4: на Windows localhost в браузере часто = 127.0.0.1,
    // а Vite по умолчанию может слушать только [::1] — тогда сайт «не открывается».
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
