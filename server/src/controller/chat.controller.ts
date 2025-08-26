import { Request, Response } from 'express';
// import { ChatService } from './service';
import bcrypt from 'bcryptjs';
import { ChatService } from '@/service/chat.service';

export class ChatController {
  constructor(private chatService: ChatService) {}

  // Auth endpoints
  register = async (req: Request, res: Response) => {
    try {
      const { username, email, password } = req.body;

      // Check if user already exists
      const existingUser = await this.chatService.getUserByUsername(username);
      if (existingUser) {
         res.status(400).json({ error: 'Username already exists' });return
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
console.log(hashedPassword)
      // Create user
      const user = await this.chatService.createUser({
        username,
        email,
        status: 'offline',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        
      });

      // Generate token
      const token = this.chatService.generateToken(user);

      res.status(201).json({
        user: { ...user, password: undefined },
        token,
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const { username } = req.body;

      // Find user
      const user = await this.chatService.getUserByUsername(username);
      if (!user) {
         res.status(401).json({ error: 'Invalid credentials' });return
      }

      // For demo purposes, we'll skip password verification
      // In production, verify the hashed password

      // Generate token
      const token = this.chatService.generateToken(user);

      res.json({
        user: { ...user, password: undefined },
        token,
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  // Room endpoints
  getRooms = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;
      const rooms = await this.chatService.getUserRooms(userId);
      res.json(rooms);
    } catch (error) {
      console.error('Get rooms error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  createRoom = async (req: Request, res: Response) => {
    try {
      const { name, type, isPrivate, description } = req.body;
      const userId = (req as any).user.userId;

      const room = await this.chatService.createRoom({
        name,
        type: type || 'channel',
        participants: [userId],
        createdBy: userId,
        isPrivate: isPrivate || false,
        description,
      });

      res.status(201).json(room);
    } catch (error) {
      console.error('Create room error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  joinRoom = async (req: Request, res: Response) => {
    try {
      const { roomId } = req.params;
      const userId = (req as any).user.userId;

      const success = await this.chatService.addUserToRoom(roomId, userId);
      if (success) {
        const room = await this.chatService.getRoomById(roomId);
        res.json(room);
      } else {
        res.status(404).json({ error: 'Room not found' });
      }
    } catch (error) {
      console.error('Join room error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  // Message endpoints
  getRoomMessages = async (req: Request, res: Response) => {
    try {
      const { roomId } = req.params;
      const { limit = 50, offset = 0 } = req.query;

      const messages = await this.chatService.getRoomMessages(
        roomId,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.json(messages);
    } catch (error) {
      console.error('Get messages error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  // User endpoints
  getUsers = async (_req: Request, res: Response) => {
    try {
      const connectedUsers = this.chatService.getConnectedUsers();
      res.json(connectedUsers);
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  getProfile = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;
      const user = await this.chatService.getUserById(userId);
      
      if (!user) {
         res.status(404).json({ error: 'User not found' });return
      }

      res.json(user);
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}