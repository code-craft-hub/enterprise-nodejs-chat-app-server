export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
  lastSeen: Date;
  createdAt: Date;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  senderUsername: string;
  senderAvatar?: string;
  roomId: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file';
  edited?: boolean;
  editedAt?: Date;
}

export interface Room {
  id: string;
  name: string;
  type: 'channel' | 'direct' | 'group';
  participants: string[];
  createdBy: string;
  createdAt: Date;
  lastMessage?: Message;
  isPrivate: boolean;
  description?: string;
}

export interface AuthPayload {
  userId: string;
  username: string;
  email: string;
}

export interface SocketUser extends User {
  socketId: string;
}

export interface ChatEvents {
  // Authentication
  authenticate: (token: string) => void;
  authenticated: (user: User) => void;
  
  // Rooms
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  roomJoined: (room: Room) => void;
  roomLeft: (roomId: string) => void;
  
  // Messages
  sendMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  messageReceived: (message: Message) => void;
  messageEdited: (message: Message) => void;
  messageDeleted: (messageId: string, roomId: string) => void;
  
  // Typing
  startTyping: (roomId: string) => void;
  stopTyping: (roomId: string) => void;
  userTyping: (userId: string, username: string, roomId: string) => void;
  userStoppedTyping: (userId: string, roomId: string) => void;
  
  // User status
  userStatusChanged: (userId: string, status: User['status']) => void;
  userJoined: (user: User) => void;
  userLeft: (userId: string) => void;
  
  // Errors
  error: (message: string) => void;
}