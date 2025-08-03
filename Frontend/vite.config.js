import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify('https://safeswap-backend-service.onrender.com/api'),
    'import.meta.env.VITE_WEBSOCKET_URL': JSON.stringify('https://safeswap-backend-service.onrender.com'),
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['lucide-react', 'react-icons'],
          wallet: [
            '@aptos-labs/wallet-adapter-react',
            '@aptos-labs/wallet-adapter-core',
            '@martianwallet/aptos-wallet-adapter',
            '@pontem/aptos-wallet-adapter',
            '@rise-wallet/wallet-adapter',
            'fewcha-plugin-wallet-adapter'
          ],
          utils: ['axios', 'socket.io-client', 'clsx', 'nprogress']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  }
})
