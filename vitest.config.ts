import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  test: {
    include: ['ui-kit/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@ui-kit': path.resolve(rootDir, './ui-kit'),
      '@dashboard': path.resolve(rootDir, './dashboard'),
    },
  },
})