import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';

// Global test setup
beforeAll(async () => {
  // Setup that runs once before all tests
  console.log('🧪 Starting test suite...');
  
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.PORT = '0'; // Use random port for testing
  
  // Setup test database connections, external services, etc.
});

afterAll(async () => {
  // Cleanup that runs once after all tests
  console.log('🧹 Cleaning up test suite...');
  
  // Close database connections, cleanup files, etc.
});

beforeEach(async () => {
  // Setup that runs before each test
  // Reset mocks, clear database, etc.
});

afterEach(async () => {
  // Cleanup that runs after each test
  // Reset state, clear timers, etc.
});

// Global test utilities
declare global {
  var testUtils: {
    createMockUser: () => any;
    cleanDatabase: () => Promise<void>;
  };
}

globalThis.testUtils = {
  createMockUser: () => ({
    id: '123',
    name: 'Test User',
    email: 'test@example.com',
    createdAt: new Date().toISOString()
  }),
  
  cleanDatabase: async () => {
    // Database cleanup logic
    console.log('🗄️ Cleaning test database...');
  }
};