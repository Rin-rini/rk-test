import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  root: fileURLToPath(new URL('./legacy-redo', import.meta.url)),
  publicDir: fileURLToPath(new URL('./public', import.meta.url)),
  resolve: {
    alias: {
      '@ui-kit': fileURLToPath(new URL('./ui-kit', import.meta.url)),
      '@dashboard': fileURLToPath(new URL('./dashboard', import.meta.url)),
      '@legacy-redo': fileURLToPath(new URL('./legacy-redo', import.meta.url)),
      '@rules-test': fileURLToPath(new URL('./rules-test', import.meta.url)),
    },
  },
  server: {
    port: 5174,
  },
  build: {
    outDir: fileURLToPath(new URL('./dist-legacy', import.meta.url)),
    emptyOutDir: true,
  },
})