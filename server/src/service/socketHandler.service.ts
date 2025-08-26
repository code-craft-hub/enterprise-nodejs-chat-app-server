import { Server, Socket } from 'socket.io';
// import { ChatEvents, SocketUser } from './types';
import { ChatService } from './chat.service';

export class SocketHandlers {
  constructor(
    private io: Server,
    private chatService: ChatService
  ) {}

  handleConnection = (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Authentication handler
    socket.on('authenticate', async (token: string) => {
      try {
        const payload = this.chatService.verifyToken(token);
        if (!payload) {
          socket.emit('error', 'Invalid token');
          return;
        }

        const user = await this.chatService.getUserById(payload.userId);
        if (!user) {
          socket.emit('error', 'User not found');
          return;
        }

        // Connect user
        // const socketUser = this.chatService.connectUser(socket.id, user);
        
        // Join user to their rooms
        const rooms = await this.chatService.getUserRooms(user.id);
        for (const room of rooms) {
          socket.join(room.id);
        }

        // Notify user of successful authentication
        socket.emit('authenticated', user);

        // Notify other users that this user is now online
        socket.broadcast.emit('userStatusChanged', user.id, 'online');

        console.log(`User ${user.username} authenticated and connected`);
      } catch (error) {
        console.error('Authentication error:', error);
        socket.emit('error', 'Authentication failed');
      }
    });

    // Join room handler
    socket.on('joinRoom', async (roomId: string) => {
      try {
        const user = this.chatService.getConnectedUser(socket.id);
        if (!user) {
          socket.emit('error', 'Not authenticated');
          return;
        }

        const room = await this.chatService.getRoomById(roomId);
        if (!room) {
          socket.emit('error', 'Room not found');
          return;
        }

        // Check if user is already a participant
        if (!room.participants.includes(user.id)) {
          await this.chatService.addUserToRoom(roomId, user.id);
        }

        socket.join(roomId);
        socket.emit('roomJoined', room);

        // Notify other room members
        socket.to(roomId).emit('userJoined', user);

        console.log(`User ${user.username} joined room ${room.name}`);
      } catch (error) {
        console.error('Join room error:', error);
        socket.emit('error', 'Failed to join room');
      }
    });

    // Leave room handler
    socket.on('leaveRoom', async (roomId: string) => {
      try {
        const user = this.chatService.getConnectedUser(socket.id);
        if (!user) {
          socket.emit('error', 'Not authenticated');
          return;
        }

        socket.leave(roomId);
        socket.emit('roomLeft', roomId);

        // Notify other room members
        socket.to(roomId).emit('userLeft', user.id);

        console.log(`User ${user.username} left room ${roomId}`);
      } catch (error) {
        console.error('Leave room error:', error);
        socket.emit('error', 'Failed to leave room');
      }
    });

    // Send message handler
    socket.on('sendMessage', async (messageData) => {
      try {
        const user = this.chatService.getConnectedUser(socket.id);
        if (!user) {
          socket.emit('error', 'Not authenticated');
          return;
        }

        const room = await this.chatService.getRoomById(messageData.roomId);
        if (!room) {
          socket.emit('error', 'Room not found');
          return;
        }

        // Check if user is a participant in the room
        if (!room.participants.includes(user.id)) {
          socket.emit('error', 'Not a member of this room');
          return;
        }

        const message = await this.chatService.createMessage({
          ...messageData,
          senderId: user.id,
          senderUsername: user.username,
          senderAvatar: user.avatar,
        });

        // Send message to all room participants
        this.io.to(messageData.roomId).emit('messageReceived', message);

        console.log(`Message sent by ${user.username} to room ${messageData.roomId}`);
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', 'Failed to send message');
      }
    });

    // Start typing handler
    socket.on('startTyping', (roomId: string) => {
      try {
        const user = this.chatService.getConnectedUser(socket.id);
        if (!user) return;

        this.chatService.setUserTyping(roomId, user.id);
        socket.to(roomId).emit('userTyping', user.id, user.username, roomId);
      } catch (error) {
        console.error('Start typing error:', error);
      }
    });

    // Stop typing handler
    socket.on('stopTyping', (roomId: string) => {
      try {
        const user = this.chatService.getConnectedUser(socket.id);
        if (!user) return;

        this.chatService.removeUserTyping(roomId, user.id);
        socket.to(roomId).emit('userStoppedTyping', user.id, roomId);
      } catch (error) {
        console.error('Stop typing error:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      try {
        const user = this.chatService.disconnectUser(socket.id);
        if (user) {
          // Notify other users that this user is now offline
          socket.broadcast.emit('userStatusChanged', user.id, 'offline');
          
          // Remove user from all typing indicators
          const rooms = this.chatService.getUserRooms(user.id);
          rooms.then(roomsList => {
            for (const room of roomsList) {
              this.chatService.removeUserTyping(room.id, user.id);
              socket.to(room.id).emit('userStoppedTyping', user.id, room.id);
            }
          });

          console.log(`User ${user.username} disconnected`);
        }
      } catch (error) {
        console.error('Disconnect error:', error);
      }
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  };
}