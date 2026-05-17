import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 8032,
    proxy: {
      '/api': {
        target: 'http://localhost:8031',
        changeOrigin: true
      }
    }
  }
})