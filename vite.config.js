import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Proxy /api vers le backend Express en dev (évite les soucis CORS/cookies).
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
})
