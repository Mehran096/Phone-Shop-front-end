import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://phone-shop-back-end.onrender.com', // ← https://phone-shop-back-end.onrender.com/
        changeOrigin: true,
      },
    },
  },
})