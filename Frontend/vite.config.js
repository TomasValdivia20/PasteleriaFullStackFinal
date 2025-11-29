import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Base path para Vercel (siempre raiz)
  base: '/',
  // Configuración de tests
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './setup.js',
  },
  // Configuración de build optimizada para producción
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild', // Cambiar de terser a esbuild (más rápido y sin dependencias extra)
    // Optimizaciones
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'bootstrap': ['bootstrap'],
          'axios': ['axios']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  // Server config para desarrollo
  server: {
    port: 5173,
    host: true,
    open: true
  },
  // Preview config
  preview: {
    port: 4173,
    host: true
  }
});