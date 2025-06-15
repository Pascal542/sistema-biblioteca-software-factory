import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import{BACKEND} from './src/utils/conexion'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: ['.ngrok-free.app'],
    proxy: {
      '/api': {
        //target: 'http://localhost:8000',
        //target: 'http://192.168.1.200:8000',
        target: BACKEND,
        changeOrigin: true,
        secure: false
      }
    }
  }
})