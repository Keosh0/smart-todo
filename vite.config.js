import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // в режиме разработки запросы /api уходят на локальный Express (npm run server)
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
})
