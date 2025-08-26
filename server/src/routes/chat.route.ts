import { ChatController } from '@/controller/chat.controller';
import { authMiddleware } from '@/middleware/chat.middleware';
import { ChatService } from '@/service/chat.service';
import { Router } from 'express';
export const createRoutes = (chatService: ChatService): Router => {
  const router = Router();
  const controller = new ChatController(chatService);
  const auth = authMiddleware(chatService);

  // Health check
  router.get('/health', (_req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  });

  // Authentication routes
  router.post('/auth/register', controller.register);
  router.post('/auth/login', controller.login);

  // Protected routes
  router.use(auth);

  // User routes
  router.get('/profile', controller.getProfile);
  router.get('/users', controller.getUsers);

  // Room routes
  router.get('/rooms', controller.getRooms);
  router.post('/rooms', controller.createRoom);
  router.post('/rooms/:roomId/join', controller.joinRoom);

  // Message routes
  router.get('/rooms/:roomId/messages', controller.getRoomMessages);

  return router;
};