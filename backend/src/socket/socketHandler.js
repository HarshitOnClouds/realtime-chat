const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Store online users: { userId: socketId }
const onlineUsers = new Map();

// Store typing users: { roomId/chatId: Set of userIds }
const typingUsers = new Map();

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // User comes online
    socket.on('user_online', (userId) => {
      onlineUsers.set(userId, socket.id);
      io.emit('user_status_change', {
        userId,
        status: 'online'
      });
    });

    // Join room
    socket.on('join_room', async ({ roomId, userId }) => {
      socket.join(roomId);

      // Get room members
      const members = await prisma.roomMember.findMany({
        where: { roomId },
        include: {
          user: {
            select: { id: true, username: true, email: true }
          }
        }
      });

      // Notify others
      socket.to(roomId).emit('user_joined_room', {
        userId,
        roomId
      });

      // Send member list with online status
      const membersWithStatus = members.map(member => ({
        ...member.user,
        isOnline: onlineUsers.has(member.user.id)
      }));

      socket.emit('room_members', {
        roomId,
        members: membersWithStatus
      });
    });

    // Join direct chat
    socket.on('join_direct_chat', ({ chatId, userId }) => {
      socket.join(chatId);
    });

    // Send message to room
    socket.on('send_room_message', async ({ roomId, content, senderId }) => {
      try {
        const message = await prisma.message.create({
          data: {
            content,
            roomId,
            senderId
          },
          include: {
            sender: {
              select: { id: true, username: true, email: true }
            }
          }
        });

        io.to(roomId).emit('receive_message', message);
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Send message to direct chat
    socket.on('send_direct_message', async ({ chatId, content, senderId, receiverId }) => {
      try {
        const message = await prisma.message.create({
          data: {
            content,
            directChatId: chatId,
            senderId
          },
          include: {
            sender: {
              select: { id: true, username: true, email: true }
            }
          }
        });

        io.to(chatId).emit('receive_message', message);

        // Also emit to receiver's socket if online
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('new_direct_message', {
            chatId,
            message
          });
        }
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Typing indicator
    socket.on('typing_start', ({ roomId, chatId, userId, username }) => {
      const key = roomId || chatId;

      if (!typingUsers.has(key)) {
        typingUsers.set(key, new Set());
      }
      typingUsers.get(key).add(userId);

      const target = roomId ? `room:${roomId}` : `chat:${chatId}`;
      socket.to(roomId || chatId).emit('user_typing', {
        userId,
        username,
        target
      });
    });

    socket.on('typing_stop', ({ roomId, chatId, userId }) => {
      const key = roomId || chatId;

      if (typingUsers.has(key)) {
        typingUsers.get(key).delete(userId);
      }

      socket.to(roomId || chatId).emit('user_stopped_typing', { userId });
    });

    // Disconnect
    socket.on('disconnect', () => {
      // Find and remove user from online users
      let disconnectedUserId;
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          disconnectedUserId = userId;
          onlineUsers.delete(userId);
          break;
        }
      }

      if (disconnectedUserId) {
        io.emit('user_status_change', {
          userId: disconnectedUserId,
          status: 'offline'
        });
      }

      console.log('User disconnected:', socket.id);
    });
  });
};

module.exports = socketHandler;