import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          background: path.resolve(__dirname, 'background.ts'),
          // content: path.resolve(__dirname, 'src/content/content.tsx'), // Built separately via vite.content.config.ts
        },
        output: {
          entryFileNames: '[name].js',
          chunkFileNames: '[name].js',
          assetFileNames: '[name].[ext]',
          manualChunks: undefined, // Disable default vendor chunk splitting
          inlineDynamicImports: false, // We have multiple inputs, so we can't use this globally, but we need to ensure content is bundled
        }
      },
      // Ensure we don't split chunks for content script
      commonjsOptions: {
        include: [/node_modules/],
      },
    }
  };
});
