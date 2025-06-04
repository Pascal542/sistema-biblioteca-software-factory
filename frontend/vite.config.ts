import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      '/api': {
        //target: 'http://localhost:8000',
        target: 'http://192.168.1.200:8000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})