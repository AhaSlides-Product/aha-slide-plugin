import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue() as any],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [resolve(__dirname, '../helpers/setup.ts')],
    include: ['consumer/**/*.test.ts', 'consumer/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test-results/',
        'playwright-report/',
        '**/*.config.ts',
        '**/helpers/**',
        '**/fixtures/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@aha/ui': resolve(__dirname, '../../../packages/ui/src'),
      '@aha/backend-utils': resolve(__dirname, '../../../packages/backend-utils/src'),
    },
  },
});
