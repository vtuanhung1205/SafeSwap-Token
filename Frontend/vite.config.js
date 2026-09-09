import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Use esbuild for faster minification (default in Vite 5)
    minify: 'esbuild',
    // Raise chunk warning limit slightly
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // React core - changes rarely
          'react-vendor': ['react', 'react-dom'],
          // Router - changes rarely
          'router': ['react-router-dom'],
          // Animation library - large, rarely changes
          'framer-motion': ['framer-motion'],
          // Aptos SDK - very large, changes rarely
          'aptos-sdk': ['aptos', '@aptos-labs/wallet-adapter-react'],
          // UI utilities
          'ui-utils': ['react-hot-toast', 'lucide-react', 'react-helmet-async'],
        },
      },
    },
    // Enable source maps only in dev
    sourcemap: false,
  },
  // Optimize deps pre-bundling
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      'lucide-react',
      'react-hot-toast',
      'socket.io-client',
    ],
  },
  // Server settings for dev
  server: {
    hmr: {
      overlay: false, // Disable error overlay for cleaner dev experience
    },
  },
})

