import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    define: {
        'process.env': {}
    },
    build: {
        emptyOutDir: false, // Don't clear dist, main build does that
        outDir: 'dist',
        rollupOptions: {
            input: {
                content: path.resolve(__dirname, 'src/content/content.tsx'),
            },
            output: {
                entryFileNames: '[name].js',
                format: 'iife', // Immediately Invoked Function Expression - perfect for content scripts
                name: 'ContentScript', // Global variable name for IIFE
                extend: true,
                inlineDynamicImports: true, // Force everything into one file
            }
        }
    }
});
