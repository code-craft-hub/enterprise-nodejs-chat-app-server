import request from "supertest";
import app from "../../app";

// Test data factories
export const createTestUser = (
  overrides: Partial<{ name: string; email: string }> = {}
) => ({
  name: "Test User",
  email: "test@example.com",
  ...overrides,
});

export const createMultipleTestUsers = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    name: `Test User ${i + 1}`,
    email: `test${i + 1}@example.com`,
  }));

// API test helpers
export class ApiTestHelper {
  static async createUser(userData: { name: string; email: string }) {
    const response = await request(app)
      .post("/api/users")
      .send(userData)
      .expect(201);

    return response.body;
  }

  static async getUser(id: number) {
    const response = await request(app).get(`/api/users/${id}`).expect(200);

    return response.body;
  }

  static async getAllUsers() {
    const response = await request(app).get("/api/users").expect(200);

    return response.body.users;
  }

  static async expectError(
    method: "get" | "post" | "put" | "delete",
    url: string,
    expectedStatus: number,
    data?: any
  ) {
    const req = request(app)[method](url);

    if (data) {
      req.send(data);
    }

    const response = await req.expect(expectedStatus);
    return response.body;
  }
}

// Custom matchers and assertions
export const customMatchers = {
  toBeValidTimestamp: (received: string) => {
    const date = new Date(received);
    const isValid = !isNaN(date.getTime());

    return {
      message: () => `expected ${received} to be a valid timestamp`,
      pass: isValid,
    };
  },

  toBeValidEmail: (received: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(received);

    return {
      message: () => `expected ${received} to be a valid email`,
      pass: isValid,
    };
  },

  toHaveValidUserStructure: (received: any) => {
    const hasRequiredFields =
      typeof received.id === "number" &&
      typeof received.name === "string" &&
      typeof received.email === "string" &&
      typeof received.createdAt === "string";

    return {
      message: () => `expected user object to have valid structure`,
      pass: hasRequiredFields,
    };
  },
};

// Database helpers (for when you add a database)
export class DatabaseHelper {
  static async cleanDatabase() {
    // Clear all test data
    console.log("🧹 Cleaning test database...");
  }

  static async seedDatabase() {
    // Add seed data for tests
    console.log("🌱 Seeding test database...");
  }

  static async createTestData(type: string, count: number = 1) {
    console.log(`📝 Creating ${count} ${type} test records...`);
    // Create test data based on type
  }
}

// Environment helpers
export class EnvironmentHelper {
  static setTestEnv(env: Record<string, string>) {
    const original: Record<string, string | undefined> = {};

    Object.entries(env).forEach(([key, value]) => {
      original[key] = process.env[key];
      process.env[key] = value;
    });

    return () => {
      Object.entries(original).forEach(([key, value]) => {
        if (value === undefined) {
          delete process.env[key];
        } else {
          process.env[key] = value;
        }
      });
    };
  }

  static async withTestEnv<T>(
    env: Record<string, string>,
    fn: () => Promise<T>
  ): Promise<T> {
    const restore = this.setTestEnv(env);
    try {
      return await fn();
    } finally {
      restore();
    }
  }
}

// Performance testing helpers
export class PerformanceHelper {
  static async measureExecutionTime<T>(
    fn: () => Promise<T>
  ): Promise<{ result: T; duration: number }> {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();

    return {
      result,
      duration: end - start,
    };
  }

  static async expectMaxDuration<T>(
    maxMs: number,
    fn: () => Promise<T>
  ): Promise<T> {
    const { result, duration } = await this.measureExecutionTime(fn);

    if (duration > maxMs) {
      throw new Error(
        `Execution took ${duration}ms, expected less than ${maxMs}ms`
      );
    }

    return result;
  }
}
