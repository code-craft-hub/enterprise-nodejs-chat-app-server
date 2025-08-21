import express, { Request, Response, NextFunction, Application } from "express";
import cors from "cors";

// Create Express app
const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req: Request, res: Response) => {
  console.log(`${req.method} ${req.path}`);

  res.json({
    message: "Hello World!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "OK",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// User routes (example)
app.get("/api/users", (_req: Request, res: Response) => {
  res.json({
    users: [
      { id: 1, name: "John Doe", email: "john@example.com" },
      { id: 2, name: "Jane Smith", email: "jane@example.com" },
    ],
  });
});

app.post("/api/users", (req: Request, res: Response) => {
  const { name, email } = req.body;

  if (!name || !email) {
    res.status(400).json({
      error: "Bad Request",
      message: "Name and email are required",
    });
    return;
  }

  const newUser = {
    id: Date.now(),
    name,
    email,
    createdAt: new Date().toISOString(),
  };

  res.status(201).json(newUser);
});

app.get("/api/users/:id", (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id || isNaN(Number(id))) {
    res.status(400).json({
      error: "Bad Request",
      message: "Invalid user ID",
    });
    return;
  }

  // Mock user data
  const user = { id: Number(id), name: "John Doe", email: "john@example.com" };
  res.json(user);
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Internal Server Error",
    message: "Something went wrong!",
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.method} ${req.url} not found`,
  });
});

export default app;
