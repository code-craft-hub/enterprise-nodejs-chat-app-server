import express, { Request, Response, NextFunction, Application } from "express";
import cors from "cors";
import { Server } from "socket.io";
import { createServer } from "http";
import chatRouter from "./routes/chat.route";

const app: Application = express();


app.use(cors())
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: false, // Keep consistent with Express CORS
  },
});


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/api", chatRouter);

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "OK",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
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

export const getServer = () => {
  return server;
};

export const getIO = () => {
  return io;
};

export default app;
