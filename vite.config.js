import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'
import viteCompression from 'vite-plugin-compression'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repo = 'invertedPyramidStock';

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? `/${repo}/` : '/',
  publicPath: mode === 'production' ? `/${repo}/` : '/',
  plugins: [
    react(),
    // GZIP 压缩
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240,
      algorithm: 'gzip',
      ext: '.gz',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
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
    },
    // 开发服务器配置
    cors: true,
    hmr: {
      overlay: true,
    },
  },
  build: {
    // 构建配置
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets',
    cssCodeSplit: true,
    sourcemap: false,
    minify: 'esbuild',
    esbuild: {
      drop: ['console', 'debugger'],
    },
    rollupOptions: {
      output: {
        // 分包配置
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'antd-vendor': ['antd'],
          'utils-vendor': ['axios'],
        },
        // 用于从入口点创建的块的打包输出格式
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
  },
  css: {
    // CSS 配置
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        modifyVars: {
          // 在这里添加 less 变量
        },
      },
    },
    modules: {
      localsConvention: 'camelCase',
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'antd'],
  },
}))
