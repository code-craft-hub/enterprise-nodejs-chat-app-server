import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    // Environment
    environment: 'node',
    
    // Global test setup
    globals: true,
    
    // Test files patterns
    include: ['src/**/*.{test,spec}.{js,ts}'],
    exclude: ['node_modules', 'dist', 'build'],
    
    // Test timeout
    testTimeout: 10000,
    hookTimeout: 10000,
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'src/**/*.test.ts',
        'src/**/*.spec.ts',
        'dist/',
        'coverage/',
        '**/*.d.ts',
        'src/types/',
        'vitest.config.ts'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    
    // Reporters
    reporters: ['verbose'],
    // outputFile: {
    //   json: './test-results.json',
    //   html: './test-results.html'
    // },
    
    // Watch options
    watch: true,
    
    // Setup files
    setupFiles: ['./src/test/setup.ts'],
    
    // Silent console logs during tests
    silent: false,
    
    // Run tests in parallel
    // threads: true,
    // maxThreads: 4,
    // minThreads: 1,
    
    
    // Pool options for better performance
    pool: 'threads'
  },
  
  // Resolve aliases (optional)
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@test': resolve(__dirname, './src/test')
    }
  }
});