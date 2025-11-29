import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
    // Base path para GitHub Pages
    base: mode === 'production' 
      ? '/Pasteleria-Mil-Sabores-VersionReactFinalFinal/'
      : '/',
    // Configuración de tests
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './setup.js',
    },
    // Configuración de build
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      // Optimizaciones
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'bootstrap': ['bootstrap'],
            'axios': ['axios']
          }
        }
      }
    },
    // Server config para desarrollo
    server: {
      port: 5173,
      host: true,
      open: true
    }
  }
});