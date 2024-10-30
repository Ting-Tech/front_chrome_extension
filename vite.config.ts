import { defineConfig } from 'vite'
import path from 'node:path'
import vue from '@vitejs/plugin-vue'
import tailwind from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json' assert { type: 'json' }

// https://vitejs.dev/config/
export default defineConfig({
  css: {
    postcss: {
      plugins: [tailwind(), autoprefixer()],
    },
  },
  plugins: [
    vue(), crx({ manifest })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        popup: 'index.html'
      }
    },
  }
})
