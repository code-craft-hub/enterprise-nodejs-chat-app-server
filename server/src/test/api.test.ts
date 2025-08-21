import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../app";
import { Server } from "http";

describe("API Endpoints", () => {
  let server: Server;

  beforeAll(() => {
    // Start server for testing
    server = app.listen(0); // Use random port
  });

  afterAll(() => {
    // Close server after tests
    server.close();
  });

  describe("GET /", () => {
    it("should return welcome message", async () => {
      const response = await request(app).get("/").expect(200);

      expect(response.body).toEqual({
        message: "Hello World!",
        timestamp: expect.any(String),
        environment: "test",
      });
    });

    it("should return valid timestamp", async () => {
      const response = await request(app).get("/").expect(200);

      const timestamp = new Date(response.body.timestamp);
      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.getTime()).not.toBeNaN();
    });
  });

  describe("GET /health", () => {
    it("should return health status", async () => {
      const response = await request(app).get("/health").expect(200);

      expect(response.body).toEqual({
        status: "OK",
        uptime: expect.any(Number),
        timestamp: expect.any(String),
      });
    });

    it("should return positive uptime", async () => {
      const response = await request(app).get("/health").expect(200);

      expect(response.body.uptime).toBeGreaterThan(0);
    });
  });

  describe("GET /api/users", () => {
    it("should return list of users", async () => {
      const response = await request(app).get("/api/users").expect(200);

      expect(response.body).toHaveProperty("users");
      expect(Array.isArray(response.body.users)).toBe(true);
      expect(response.body.users.length).toBeGreaterThan(0);
    });

    it("should return users with correct structure", async () => {
      const response = await request(app).get("/api/users").expect(200);

      const user = response.body.users[0];
      expect(user).toHaveProperty("id");
      expect(user).toHaveProperty("name");
      expect(user).toHaveProperty("email");
      expect(typeof user.id).toBe("number");
      expect(typeof user.name).toBe("string");
      expect(typeof user.email).toBe("string");
    });
  });

  describe("POST /api/users", () => {
    it("should create a new user", async () => {
      const newUser = {
        name: "Test User",
        email: "test@example.com",
      };

      const response = await request(app)
        .post("/api/users")
        .send(newUser)
        .expect(201);

      expect(response.body).toEqual({
        id: expect.any(Number),
        name: newUser.name,
        email: newUser.email,
        createdAt: expect.any(String),
      });
    });

    it("should validate required fields", async () => {
      const response = await request(app)
        .post("/api/users")
        .send({})
        .expect(400);

      expect(response.body).toEqual({
        error: "Bad Request",
        message: "Name and email are required",
      });
    });

    it("should validate partial data", async () => {
      const response = await request(app)
        .post("/api/users")
        .send({ name: "Test User" })
        .expect(400);

      expect(response.body.message).toBe("Name and email are required");
    });
  });

  describe("GET /api/users/:id", () => {
    it("should return user by ID", async () => {
      const response = await request(app).get("/api/users/123").expect(200);

      expect(response.body).toEqual({
        id: 123,
        name: expect.any(String),
        email: expect.any(String),
      });
    });

    it("should handle invalid user ID", async () => {
      const response = await request(app).get("/api/users/invalid").expect(400);

      expect(response.body).toEqual({
        error: "Bad Request",
        message: "Invalid user ID",
      });
    });
  });

  describe("404 Handler", () => {
    it("should return 404 for non-existent routes", async () => {
      const response = await request(app)
        .get("/non-existent-route")
        .expect(404);

      expect(response.body).toEqual({
        error: "Not Found",
        message: "Route GET /non-existent-route not found",
      });
    });

    it("should handle POST to non-existent routes", async () => {
      const response = await request(app)
        .post("/non-existent-route")
        .expect(404);

      expect(response.body.message).toContain(
        "POST /non-existent-route not found"
      );
    });
  });
});
