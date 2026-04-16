import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    // Explicit output directory — must match vercel.json "distDir": "dist"
    outDir: 'dist',
    // Disable source maps in production for smaller bundle + less exposure
    sourcemap: false,
    // Warn at 800KB (default 500KB is too aggressive for this stack)
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        // Split large libraries into separate chunks for better caching
        manualChunks: {
          // React core — changes rarely, cache effectively
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Charting library — large, split it out
          'vendor-charts': ['recharts'],
          // Animation library — large, split it out
          'vendor-motion': ['framer-motion'],
          // Form + validation
          'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
        },
      },
    },
  },
})
