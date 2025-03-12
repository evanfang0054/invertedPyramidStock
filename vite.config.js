import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/invertedPyramidStock/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    port: '3000',
    host: '0.0.0.0',
    proxy: {
      '/baidu': {
        target: 'https://finance.pae.baidu.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/baidu/, '')
      },
    }
  }
})
