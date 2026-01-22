import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://4.230.40.102:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
