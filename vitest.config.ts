import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  test: {
    environment: 'node',
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          include: [
            'lib/__tests__/**/*.test.ts',
            'stores/__tests__/**/*.test.ts',
            'hooks/__tests__/**/*.test.ts',
          ],
        },
      },
      {
        extends: false,
        test: {
          name: 'integration',
          environment: 'node',
          include: ['__tests__/rls/**/*.test.ts'],
          testTimeout: 30_000,
          hookTimeout: 60_000,
          setupFiles: ['./__tests__/rls/setup.ts'],
        },
        resolve: {
          alias: { '@': path.resolve(__dirname, '.') },
        },
      },
    ],
  },
})
