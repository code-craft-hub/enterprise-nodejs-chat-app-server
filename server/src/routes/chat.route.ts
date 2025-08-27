import { ChatController } from "@/controller/chat.controller";
import { authMiddleware } from "@/middleware/chat.middleware";
import { ChatService } from "@/service/chat.service";
import { Router } from "express";

const chatService = new ChatService();

const chatRouter: Router = Router();
const controller = new ChatController(chatService);
const auth = authMiddleware(chatService);

// Health check
chatRouter.get("/health", (_req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Authentication routes
chatRouter.post("/auth/register", controller.register);
chatRouter.post("/auth/login", controller.login);

// Protected routes
chatRouter.use(auth);

// User routes
chatRouter.get("/profile", controller.getProfile);
chatRouter.get("/users", controller.getUsers);

// Room routes
chatRouter.get("/rooms", controller.getRooms);
chatRouter.post("/rooms", controller.createRoom);
chatRouter.post("/rooms/:roomId/join", controller.joinRoom);

// Message routes
chatRouter.get("/rooms/:roomId/messages", controller.getRoomMessages);

export default chatRouter;