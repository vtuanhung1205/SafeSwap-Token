import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify('https://safeswap-backend-service.onrender.com/api'),
    'import.meta.env.VITE_WEBSOCKET_URL': JSON.stringify('https://safeswap-backend-service.onrender.com'),
  }
})
