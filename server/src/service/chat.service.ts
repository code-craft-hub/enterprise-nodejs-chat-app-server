import { config } from '@/config';
import { User, Message, Room, SocketUser  } from '@/types/chat';
import jwt from 'jsonwebtoken';
// import { config } from './config';

// In-memory storage for demo purposes
// In production, use MongoDB, PostgreSQL, etc.
export class ChatService {
  private users: Map<string, User> = new Map();
  private messages: Map<string, Message[]> = new Map(); // roomId -> messages
  private rooms: Map<string, Room> = new Map();
  private connectedUsers: Map<string, SocketUser> = new Map(); // socketId -> user
  private userSockets: Map<string, string> = new Map(); // userId -> socketId
  private typingUsers: Map<string, Set<string>> = new Map(); // roomId -> Set of userIds

  constructor() {
    this.initializeDemoData();
  }

  // Authentication
  generateToken(user: User): string {
    return jwt.sign(
      { userId: user.id, username: user.username, email: user.email },
      config.jwtSecret,
      { expiresIn: '7d' }
    );
  }

  verifyToken(token: string): { userId: string; username: string; email: string } | null {
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as any;
      return { userId: decoded.userId, username: decoded.username, email: decoded.email };
    } catch (error) {
      return null;
    }
  }

  // User management
  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'lastSeen'>): Promise<User> {
    const user: User = {
      ...userData,
      id: this.generateId(),
      createdAt: new Date(),
      lastSeen: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async getUserById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return null;
  }

  async updateUserStatus(userId: string, status: User['status']): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.status = status;
      user.lastSeen = new Date();
      this.users.set(userId, user);
    }
  }

  // Socket user management
  connectUser(socketId: string, user: User): SocketUser {
    const socketUser: SocketUser = { ...user, socketId };
    this.connectedUsers.set(socketId, socketUser);
    this.userSockets.set(user.id, socketId);
    this.updateUserStatus(user.id, 'online');
    return socketUser;
  }

  disconnectUser(socketId: string): User | null {
    const user = this.connectedUsers.get(socketId);
    if (user) {
      this.connectedUsers.delete(socketId);
      this.userSockets.delete(user.id);
      this.updateUserStatus(user.id, 'offline');
      return user;
    }
    return null;
  }

  getConnectedUser(socketId: string): SocketUser | null {
    return this.connectedUsers.get(socketId) || null;
  }

  getConnectedUsers(): SocketUser[] {
    return Array.from(this.connectedUsers.values());
  }

  // Room management
  async createRoom(roomData: Omit<Room, 'id' | 'createdAt'>): Promise<Room> {
    const room: Room = {
      ...roomData,
      id: this.generateId(),
      createdAt: new Date(),
    };
    this.rooms.set(room.id, room);
    this.messages.set(room.id, []);
    return room;
  }

  async getRoomById(id: string): Promise<Room | null> {
    return this.rooms.get(id) || null;
  }

  async getUserRooms(userId: string): Promise<Room[]> {
    const rooms: Room[] = [];
    for (const room of this.rooms.values()) {
      if (room.participants.includes(userId)) {
        rooms.push(room);
      }
    }
    return rooms;
  }

  async addUserToRoom(roomId: string, userId: string): Promise<boolean> {
    const room = this.rooms.get(roomId);
    if (room && !room.participants.includes(userId)) {
      room.participants.push(userId);
      this.rooms.set(roomId, room);
      return true;
    }
    return false;
  }

  async removeUserFromRoom(roomId: string, userId: string): Promise<boolean> {
    const room = this.rooms.get(roomId);
    if (room) {
      room.participants = room.participants.filter(id => id !== userId);
      this.rooms.set(roomId, room);
      return true;
    }
    return false;
  }

  // Message management
  async createMessage(messageData: Omit<Message, 'id' | 'timestamp'>): Promise<Message> {
    const message: Message = {
      ...messageData,
      id: this.generateId(),
      timestamp: new Date(),
    };

    const roomMessages = this.messages.get(messageData.roomId) || [];
    roomMessages.push(message);
    this.messages.set(messageData.roomId, roomMessages);

    // Update room's last message
    const room = this.rooms.get(messageData.roomId);
    if (room) {
      room.lastMessage = message;
      this.rooms.set(messageData.roomId, room);
    }

    return message;
  }

  async getRoomMessages(roomId: string, limit: number = 50, offset: number = 0): Promise<Message[]> {
    const messages = this.messages.get(roomId) || [];
    return messages.slice(-limit - offset, messages.length - offset).reverse();
  }

  async editMessage(messageId: string, newContent: string): Promise<Message | null> {
    for (const [roomId, messages] of this.messages.entries()) {
      console.log(roomId)
      const messageIndex = messages.findIndex(m => m.id === messageId);
      if (messageIndex !== -1) {
        messages[messageIndex].content = newContent;
        messages[messageIndex].edited = true;
        messages[messageIndex].editedAt = new Date();
        return messages[messageIndex];
      }
    }
    return null;
  }

  async deleteMessage(messageId: string): Promise<boolean> {
    for (const [roomId, messages] of this.messages.entries()) {
      const messageIndex = messages.findIndex(m => m.id === messageId);
      if (messageIndex !== -1) {
        messages.splice(messageIndex, 1);
        this.messages.set(roomId, messages);
        return true;
      }
    }
    return false;
  }

  // Typing indicators
  setUserTyping(roomId: string, userId: string): void {
    if (!this.typingUsers.has(roomId)) {
      this.typingUsers.set(roomId, new Set());
    }
    this.typingUsers.get(roomId)!.add(userId);
  }

  removeUserTyping(roomId: string, userId: string): void {
    const typingSet = this.typingUsers.get(roomId);
    if (typingSet) {
      typingSet.delete(userId);
      if (typingSet.size === 0) {
        this.typingUsers.delete(roomId);
      }
    }
  }

  getTypingUsers(roomId: string): string[] {
    const typingSet = this.typingUsers.get(roomId);
    return typingSet ? Array.from(typingSet) : [];
  }

  // Utility methods
  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private initializeDemoData(): void {
    // Create demo users
    const user1: User = {
      id: 'user1',
      username: 'john_doe',
      email: 'john@company.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
      status: 'offline',
      lastSeen: new Date(),
      createdAt: new Date(),
    };

    const user2: User = {
      id: 'user2',
      username: 'jane_smith',
      email: 'jane@company.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane',
      status: 'offline',
      lastSeen: new Date(),
      createdAt: new Date(),
    };

    this.users.set(user1.id, user1);
    this.users.set(user2.id, user2);

    // Create demo rooms
    const generalRoom: Room = {
      id: 'general',
      name: 'General',
      type: 'channel',
      participants: ['user1', 'user2'],
      createdBy: 'user1',
      createdAt: new Date(),
      isPrivate: false,
      description: 'General discussion channel',
    };

    const devRoom: Room = {
      id: 'dev-team',
      name: 'Development Team',
      type: 'channel',
      participants: ['user1', 'user2'],
      createdBy: 'user1',
      createdAt: new Date(),
      isPrivate: false,
      description: 'Development team discussions',
    };

    this.rooms.set(generalRoom.id, generalRoom);
    this.rooms.set(devRoom.id, devRoom);
    this.messages.set(generalRoom.id, []);
    this.messages.set(devRoom.id, []);
  }
}