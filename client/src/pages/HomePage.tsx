import React, { useState, useEffect, useRef, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Send, 
  Users, 
  Hash, 
  Settings, 
  LogOut, 
  Plus,
  Search,
  MoreVertical,
  Smile
} from 'lucide-react';

// Types
interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
  lastSeen: Date;
  createdAt: Date;
}

interface Message {
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

interface Room {
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

const HomePage: React.FC = () => {
  // State management
  const [socket, setSocket] = useState<Socket | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [error, setError] = useState<string | null>(null);

  // Login form state
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Socket connection and event handlers
  const connectSocket = useCallback((token: string) => {
    const newSocket = io('http://localhost:5000', {
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      setConnectionStatus('connected');
      setError(null);
      newSocket.emit('authenticate', token);
    });

    newSocket.on('disconnect', () => {
      setConnectionStatus('disconnected');
      setIsAuthenticated(false);
    });

    newSocket.on('authenticated', (userData: User) => {
      setUser(userData);
      setIsAuthenticated(true);
      loadRooms();
    });

    newSocket.on('messageReceived', (message: Message) => {
      if (activeRoom && message.roomId === activeRoom.id) {
        setMessages(prev => [...prev, message]);
      }
    });

    newSocket.on('userTyping', (userId: string, username: string, roomId: string) => {
      if (activeRoom && roomId === activeRoom.id && userId !== user?.id) {
        setTypingUsers(prev => [...prev.filter(u => u !== username), username]);
      }
    });

    newSocket.on('userStoppedTyping', (userId: string, roomId: string) => {
      if (activeRoom && roomId === activeRoom.id) {
        setTypingUsers(prev => prev.filter(u => u !== userId));
      }
    });

    newSocket.on('userStatusChanged', (userId: string, status: User['status']) => {
      setOnlineUsers(prev => 
        prev.map(u => u.id === userId ? { ...u, status } : u)
      );
    });

    newSocket.on('roomJoined', (room: Room) => {
      setRooms(prev => [...prev, room]);
    });

    newSocket.on('error', (errorMessage: string) => {
      setError(errorMessage);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [activeRoom, user]);

  // Authentication
  const handleLogin = async () => {
    setIsLoggingIn(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      localStorage.setItem('chat-token', data.token);
      connectSocket(data.token);
    } catch (err) {
      setError('Login failed. Please check your credentials.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Load rooms
  const loadRooms = async () => {
    const token = localStorage.getItem('chat-token');
    if (!token) return;

    try {
      const response = await fetch('http://localhost:5000/api/rooms', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const roomsData = await response.json();
        setRooms(roomsData);
        if (roomsData.length > 0 && !activeRoom) {
          selectRoom(roomsData[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load rooms:', err);
    }
  };

  // Select room
  const selectRoom = async (room: Room) => {
    if (activeRoom?.id === room.id) return;

    setActiveRoom(room);
    setMessages([]);
    setTypingUsers([]);

    if (socket) {
      socket.emit('joinRoom', room.id);
    }

    // Load room messages
    const token = localStorage.getItem('chat-token');
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:5000/api/rooms/${room.id}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const messagesData = await response.json();
        setMessages(messagesData.reverse());
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  // Send message
  const sendMessage = () => {
    if (!newMessage.trim() || !socket || !activeRoom) return;

    socket.emit('sendMessage', {
      content: newMessage,
      roomId: activeRoom.id,
      type: 'text',
    });

    setNewMessage('');
    setIsTyping(false);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    socket.emit('stopTyping', activeRoom.id);
  };

  // Handle typing
  const handleTyping = (value: string) => {
    setNewMessage(value);

    if (!socket || !activeRoom) return;

    if (value && !isTyping) {
      setIsTyping(true);
      socket.emit('startTyping', activeRoom.id);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('stopTyping', activeRoom.id);
    }, 1000);
  };

  // Initialize on mount
  useEffect(() => {
    const token = localStorage.getItem('chat-token');
    if (token) {
      connectSocket(token);
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  // Format timestamp
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Login form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <h1 className="text-2xl font-bold text-center">Enterprise Chat</h1>
            <p className="text-gray-600 text-center">Sign in to start chatting</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Input
                placeholder="Username"
                value={loginData.username}
                onChange={(e) => setLoginData(prev => ({ ...prev, username: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
              <Input
                type="password"
                placeholder="Password"
                value={loginData.password}
                onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <Button 
              onClick={handleLogin} 
              disabled={isLoggingIn || !loginData.username}
              className="w-full"
            >
              {isLoggingIn ? 'Signing in...' : 'Sign In'}
            </Button>
            <div className="text-sm text-gray-600 text-center">
              Demo users: john_doe, jane_smith (any password)
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r flex flex-col">
        {/* User header */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={user?.avatar} />
              <AvatarFallback>{user?.username?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="font-semibold">{user?.username}</div>
              <div className="flex items-center space-x-2">
                <Badge variant={user?.status === 'online' ? 'default' : 'secondary'}>
                  {user?.status}
                </Badge>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Rooms list */}
        <div className="flex-1 overflow-hidden">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Channels</h2>
              <Button variant="ghost" size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="px-4 space-y-1">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  onClick={() => selectRoom(room)}
                  className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer hover:bg-gray-100 ${
                    activeRoom?.id === room.id ? 'bg-blue-100 border border-blue-200' : ''
                  }`}
                >
                  <Hash className="w-4 h-4 text-gray-500" />
                  <div className="flex-1">
                    <div className="font-medium">{room.name}</div>
                    {room.lastMessage && (
                      <div className="text-sm text-gray-600 truncate">
                        {room.lastMessage.senderUsername}: {room.lastMessage.content}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {activeRoom ? (
          <>
            {/* Chat header */}
            <div className="p-4 border-b bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Hash className="w-5 h-5 text-gray-500" />
                  <div>
                    <div className="font-semibold">{activeRoom.name}</div>
                    <div className="text-sm text-gray-600">{activeRoom.participants.length} members</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Search className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Users className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages area */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className="flex items-start space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={message.senderAvatar} />
                      <AvatarFallback>{message.senderUsername.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-semibold text-sm">{message.senderUsername}</span>
                        <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
                        {message.edited && (
                          <span className="text-xs text-gray-400">(edited)</span>
                        )}
                      </div>
                      <div className="text-gray-800">{message.content}</div>
                    </div>
                  </div>
                ))}
                
                {/* Typing indicator */}
                {typingUsers.length > 0 && (
                  <div className="flex items-start space-x-3 opacity-60">
                    <div className="w-8 h-8 flex items-center justify-center">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message input */}
            <div className="p-4 border-t bg-white">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
                <div className="flex-1 relative">
                  <Input
                    placeholder={`Message #${activeRoom.name}`}
                    value={newMessage}
                    onChange={(e) => handleTyping(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    className="pr-10"
                  />
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="absolute right-1 top-1/2 -translate-y-1/2"
                  >
                    <Smile className="w-4 h-4" />
                  </Button>
                </div>
                <Button 
                  onClick={sendMessage} 
                  disabled={!newMessage.trim()}
                  size="sm"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <Hash className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Select a channel</h3>
              <p>Choose a channel from the sidebar to start chatting</p>
            </div>
          </div>
        )}
      </div>

      {/* Connection status */}
      {connectionStatus !== 'connected' && (
        <div className="absolute top-4 right-4">
          <Alert>
            <AlertDescription>
              {connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
};

export default HomePage;