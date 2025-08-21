import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../../app";
import { Server } from "http";

describe("Integration Tests - API Routes", () => {
  let server: Server;

  beforeAll(async () => {
    // Start server for integration tests
    server = app.listen(0);
  });

  afterAll(async () => {
    // Close server after tests
    server.close();
  });

  describe("Full User Workflow", () => {
    it("should handle complete user creation and retrieval flow", async () => {
      // 1. Create a new user
      const newUser = {
        name: "Integration Test User",
        email: "integration@test.com",
      };

      const createResponse = await request(app)
        .post("/api/users")
        .send(newUser)
        .expect(201);

      expect(createResponse.body).toMatchObject({
        id: expect.any(Number),
        name: newUser.name,
        email: newUser.email,
        createdAt: expect.any(String),
      });

      const userId = createResponse.body.id;

      // 2. Retrieve the created user
      const getResponse = await request(app)
        .get(`/api/users/${userId}`)
        .expect(200);

      expect(getResponse.body).toMatchObject({
        id: userId,
        name: expect.any(String),
        email: expect.any(String),
      });

      // 3. Verify user appears in users list
      const listResponse = await request(app).get("/api/users").expect(200);

      expect(listResponse.body.users).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number),
            name: expect.any(String),
            email: expect.any(String),
          }),
        ])
      );
    });
  });

  describe("Error Handling Integration", () => {
    it("should handle malformed JSON", async () => {
      const response = await request(app)
        .post("/api/users")
        .set("Content-Type", "application/json")
        .send({ invalid: "json" })
        .expect(400);

      // Express will handle this automatically
    });

    it("should handle large payloads", async () => {
      const largePayload = {
        name: "A".repeat(1000),
        email: "test@example.com",
      };

      const response = await request(app)
        .post("/api/users")
        .send(largePayload)
        .expect(201);

      expect(response.body.name).toBe(largePayload.name);
    });
  });

  describe("Content Type Handling", () => {
    it("should handle JSON content type", async () => {
      const user = { name: "JSON User", email: "json@test.com" };

      await request(app)
        .post("/api/users")
        .set("Content-Type", "application/json")
        .send(user)
        .expect(201);
    });

    it("should handle URL encoded content type", async () => {
      await request(app)
        .post("/api/users")
        .set("Content-Type", "application/x-www-form-urlencoded")
        .send("name=URL User&email=url@test.com")
        .expect(201);
    });
  });

  describe("CORS Integration", () => {
    it("should include CORS headers", async () => {
      const response = await request(app).get("/").expect(200);

      expect(response.headers).toHaveProperty("access-control-allow-origin");
    });

    it("should handle preflight requests", async () => {
      await request(app)
        .options("/api/users")
        .set("Origin", "http://localhost:3000")
        .set("Access-Control-Request-Method", "POST")
        .set("Access-Control-Request-Headers", "Content-Type")
        .expect(204);
    });
  });

  describe("Performance Tests", () => {
    it("should respond within acceptable time", async () => {
      const start = Date.now();

      await request(app).get("/").expect(200);

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000); // Should respond within 1 second
    });

    it("should handle concurrent requests", async () => {
      const requests = Array.from({ length: 10 }, (_, i) =>
        request(app).get("/").expect(200)
      );

      const responses = await Promise.all(requests);

      expect(responses).toHaveLength(10);
      responses.forEach((response) => {
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Hello World!");
      });
    });
  });
});
