import { io } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(userId) {
    if (typeof window === 'undefined') return null;
    
    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('Connected to socket server');
      this.socket.emit('user_online', userId);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinRoom(roomId, userId) {
    if (this.socket) {
      this.socket.emit('join_room', { roomId, userId });
    }
  }

  joinDirectChat(chatId, userId) {
    if (this.socket) {
      this.socket.emit('join_direct_chat', { chatId, userId });
    }
  }

  sendRoomMessage(roomId, content, senderId) {
    if (this.socket) {
      this.socket.emit('send_room_message', { roomId, content, senderId });
    }
  }

  sendDirectMessage(chatId, content, senderId, receiverId) {
    if (this.socket) {
      this.socket.emit('send_direct_message', { chatId, content, senderId, receiverId });
    }
  }

  startTyping(roomId, chatId, userId, username) {
    if (this.socket) {
      this.socket.emit('typing_start', { roomId, chatId, userId, username });
    }
  }

  stopTyping(roomId, chatId, userId) {
    if (this.socket) {
      this.socket.emit('typing_stop', { roomId, chatId, userId });
    }
  }

  onReceiveMessage(callback) {
    if (this.socket) {
      this.socket.on('receive_message', callback);
    }
  }

  onUserJoinedRoom(callback) {
    if (this.socket) {
      this.socket.on('user_joined_room', callback);
    }
  }

  onRoomMembers(callback) {
    if (this.socket) {
      this.socket.on('room_members', callback);
    }
  }

  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on('user_typing', callback);
    }
  }

  onUserStoppedTyping(callback) {
    if (this.socket) {
      this.socket.on('user_stopped_typing', callback);
    }
  }

  onUserStatusChange(callback) {
    if (this.socket) {
      this.socket.on('user_status_change', callback);
    }
  }

  offReceiveMessage() {
    if (this.socket) {
      this.socket.off('receive_message');
    }
  }

  offUserTyping() {
    if (this.socket) {
      this.socket.off('user_typing');
    }
  }

  offUserStoppedTyping() {
    if (this.socket) {
      this.socket.off('user_stopped_typing');
    }
  }
}

export default new SocketService();