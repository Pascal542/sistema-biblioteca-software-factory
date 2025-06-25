import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import{BACKEND} from './src/utils/conexion'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const backendIP = env.VITE_BACKEND_IP;
  const targetBackend = backendIP ? `http://${backendIP}:8000` : BACKEND;
  
  console.log('🔧 Vite Proxy Config:');
  console.log('  - VITE_BACKEND_IP:', backendIP);
  console.log('  - Target Backend:', targetBackend);

  return {
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: targetBackend,
        changeOrigin: true,
        secure: false,
        ws: true,
        configure: (proxy) => {
          proxy.on('proxyReq', (_proxyReq, req) => {
            console.log(` Proxy ACTIVADO: ${req.method} ${req.url} -> ${targetBackend}${req.url}`);
          });
          proxy.on('error', (err) => {
            console.log(' Error en proxy:', err.message);
          });
        }
      }
    }
  }
  }
})