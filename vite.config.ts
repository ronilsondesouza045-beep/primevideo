import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
    ],

    resolve: {
      dedupe: [
        'react',
        'react-dom',
      ],

      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },

    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-dom/client',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        'react-router-dom',
        'zustand',
        'lucide-react',
      ],
    },

    build: {
      cssCodeSplit: true,

      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) {
              return;
            }

            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }

            if (id.includes('firebase')) {
              return 'vendor-firebase';
            }

            if (
              id.includes('zustand') ||
              id.includes('zod')
            ) {
              return 'vendor-state';
            }

            if (id.includes('/three/')) {
              return 'vendor-three';
            }

            if (
              id.includes('/motion/') ||
              id.includes('framer-motion')
            ) {
              return 'vendor-motion';
            }

            if (
              id.includes('/react/') ||
              id.includes('/react-dom/') ||
              id.includes('/react-router') ||
              id.includes('react-router-dom')
            ) {
              return 'vendor-react';
            }
          },
        },
      },
    },

    server: {
      hmr: process.env.DISABLE_HMR !== 'true',

      watch:
        process.env.DISABLE_HMR === 'true'
          ? null
          : {},
    },
  };
});
