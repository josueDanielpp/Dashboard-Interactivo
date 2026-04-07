import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  base: '/DenueAgs/',
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return;
          }

          if (id.includes('/ol/')) {
            return 'vendor-mapa';
          }

          if (id.includes('/echarts/')) {
            return 'vendor-graficas';
          }

          if (id.includes('/react-grid-layout/')) {
            return 'vendor-layout';
          }

          if (
            id.includes('/react/') ||
            id.includes('/react-dom/') ||
            id.includes('/react-toastify/')
          ) {
            return 'vendor-react';
          }
        },
      },
    },
  },
});
