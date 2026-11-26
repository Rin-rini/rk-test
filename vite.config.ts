import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@ui-kit': fileURLToPath(new URL('./ui-kit', import.meta.url)),
      '@dashboard': fileURLToPath(new URL('./dashboard', import.meta.url)),
      '@legacy-redo': fileURLToPath(new URL('./legacy-redo', import.meta.url)),
      '@rules-test': fileURLToPath(new URL('./rules-test', import.meta.url)),
    },
  },
})
