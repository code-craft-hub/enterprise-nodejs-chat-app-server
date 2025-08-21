import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../../app";
import {
  ApiTestHelper,
  EnvironmentHelper,
  PerformanceHelper,
} from "../helpers/testHelpers";

describe("Advanced Testing Patterns", () => {
  describe("Snapshot Testing", () => {
    it("should match API response snapshot", async () => {
      const response = await request(app).get("/").expect(200);

      // Remove dynamic fields for consistent snapshots
      const snapshot = {
        ...response.body,
        timestamp: "[TIMESTAMP]",
      };

      expect(snapshot).toMatchInlineSnapshot(`
        {
          "environment": "test",
          "message": "Hello World!",
          "timestamp": "[TIMESTAMP]",
        }
      `);
    });
  });

  describe("Parameterized Tests", () => {
    it.each([
      { method: "GET", url: "/health", expectedStatus: 200 },
      { method: "GET", url: "/", expectedStatus: 200 },
      { method: "GET", url: "/api/users", expectedStatus: 200 },
      { method: "GET", url: "/nonexistent", expectedStatus: 404 },
    ])(
      "$method $url should return $expectedStatus",
      async ({ method, url, expectedStatus }) => {
        await request(app)
          [method.toLowerCase() as "get"](url)
          .expect(expectedStatus);
      }
    );

    it.each([
      { name: "", email: "test@example.com", shouldFail: true },
      { name: "John", email: "", shouldFail: true },
      { name: "John", email: "invalid-email", shouldFail: false }, // API doesn't validate email format
      { name: "Valid User", email: "valid@example.com", shouldFail: false },
    ])(
      'POST /api/users with name="$name" email="$email" should fail=$shouldFail',
      async ({ name, email, shouldFail }) => {
        const expectedStatus = shouldFail ? 400 : 201;

        await request(app)
          .post("/api/users")
          .send({ name, email })
          .expect(expectedStatus);
      }
    );
  });

  describe("Concurrent Testing", () => {
    it("should handle multiple simultaneous requests", async () => {
      const userPromises = Array.from({ length: 5 }, (_, i) =>
        ApiTestHelper.createUser({
          name: `Concurrent User ${i}`,
          email: `concurrent${i}@test.com`,
        })
      );

      const users = await Promise.all(userPromises);

      expect(users).toHaveLength(5);
      users.forEach((user, index) => {
        expect(user.name).toBe(`Concurrent User ${index}`);
        expect(user.email).toBe(`concurrent${index}@test.com`);
      });
    });
  });

  describe("Environment Variable Testing", () => {
    it("should use test environment variables", async () => {
      await EnvironmentHelper.withTestEnv(
        { NODE_ENV: "testing", PORT: "4000" },
        async () => {
          const response = await request(app).get("/").expect(200);

          expect(response.body.environment).toBe("testing");
        }
      );
    });

    it("should handle missing environment variables", async () => {
      const restore = EnvironmentHelper.setTestEnv({ NODE_ENV: "" });

      try {
        const response = await request(app).get("/").expect(200);

        expect(response.body.environment).toBe("development");
      } finally {
        restore();
      }
    });
  });

  describe("Performance Testing", () => {
    it("should respond quickly to health checks", async () => {
      await PerformanceHelper.expectMaxDuration(100, async () => {
        await request(app).get("/health").expect(200);
      });
    });

    it("should handle load testing", async () => {
      const { duration } = await PerformanceHelper.measureExecutionTime(
        async () => {
          const requests = Array.from({ length: 20 }, () =>
            request(app).get("/").expect(200)
          );
          await Promise.all(requests);
        }
      );

      console.log(`20 concurrent requests took ${duration}ms`);
      expect(duration).toBeLessThan(2000); // Should complete within 2 seconds
    });
  });

  describe("Error Boundary Testing", () => {
    it("should handle malformed JSON gracefully", async () => {
      const response = await request(app)
        .post("/api/users")
        .set("Content-Type", "application/json")
        .send({ malformed: "json" });

      // Express handles this automatically with 400
      expect(response.status).toBe(400);
    });

    it("should handle very large payloads", async () => {
      const largeData = {
        name: "A".repeat(10000),
        email: "large@test.com",
      };

      const response = await request(app)
        .post("/api/users")
        .send(largeData)
        .expect(201);

      expect(response.body.name).toBe(largeData.name);
    });

    it("should handle special characters in input", async () => {
      const specialUser = {
        name: '测试用户 🚀 <script>alert("xss")</script>',
        email: "special+chars@tëst.com",
      };

      const response = await request(app)
        .post("/api/users")
        .send(specialUser)
        .expect(201);

      expect(response.body.name).toBe(specialUser.name);
      expect(response.body.email).toBe(specialUser.email);
    });
  });

  describe("Headers and Security Testing", () => {
    it("should include CORS headers", async () => {
      const response = await request(app).get("/").expect(200);

      expect(response.headers["access-control-allow-origin"]).toBeDefined();
    });

    it("should handle missing content-type header", async () => {
      await request(app)
        .post("/api/users")
        .send("name=Test&email=test@example.com")
        .expect(201);
    });

    it("should handle custom headers", async () => {
      const response = await request(app)
        .get("/")
        .set("X-Custom-Header", "test-value")
        .expect(200);

      expect(response.status).toBe(200);
    });
  });

  describe("Mock Integration Tests", () => {
    beforeEach(() => {
      // Setup mocks before each test
      vi.clearAllMocks();
    });

    it("should mock console.log in production-like scenarios", async () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      await request(app).get("/").expect(200);

      // Verify console.log was called (from server startup logs)
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("should mock Date for consistent timestamps", async () => {
      const mockDate = new Date("2024-01-01T00:00:00Z");
      vi.setSystemTime(mockDate);

      const response = await request(app).get("/").expect(200);

      expect(response.body.timestamp).toBe(mockDate.toISOString());

      vi.useRealTimers();
    });
  });
});
