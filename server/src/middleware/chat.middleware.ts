import { ChatService } from '@/service/chat.service';
import { Request, Response, NextFunction } from 'express';
// import { ChatService } from './service';

export const authMiddleware = (chatService: ChatService) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
         res.status(401).json({ error: 'No token provided' });return
      }

      const token = authHeader.substring(7);
      const payload = chatService.verifyToken(token);

      if (!payload) {
         res.status(401).json({ error: 'Invalid token' });return
      }

      (req as any).user = payload;
      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      res.status(401).json({ error: 'Authentication failed' });
    }
  };
};

export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('Error:', error);

  if (error.name === 'ValidationError') {
     res.status(400).json({ error: 'Validation error', details: error.message });return
  }

  if (error.name === 'CastError') {
     res.status(400).json({ error: 'Invalid ID format' });return
  }

  res.status(500).json({ error: 'Internal server error' });
};

export const notFoundHandler = (_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
};