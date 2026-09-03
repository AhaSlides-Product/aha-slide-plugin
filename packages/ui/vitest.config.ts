import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['src/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@aha/ui-vanilla': resolve(__dirname, '../ui-vanilla/src'),
    },
  },
})
