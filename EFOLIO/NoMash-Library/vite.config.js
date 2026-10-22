
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// Different base paths for GitHub Pages and Cloudflare Pages
export default defineConfig({
  base: process.env.DEPLOY_TARGET === 'github'
    ? '/FIT5032/'
    : '/',

  plugins: [
    vue(),
    vueDevTools(),
  ],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
