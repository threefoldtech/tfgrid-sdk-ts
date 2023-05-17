import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: 'dist',
  },
  base: '/',
  plugins: [vue(), nodePolyfills()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  define: {
    'process.env': {
      NETWORK: process.env.NETWORK || 'dev',
      INTERNAL_SOLUTION_PROVIDER_ID: process.env.INTERNAL_SOLUTION_PROVIDER_ID || 1,
    },
  },
})
