async function directChatRoutes(fastify, options) {
  // Create direct chat
  fastify.post('/create', {
    onRequest: [fastify.authenticate],
    schema: {
      body: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string', format: 'email' }
        }
      }
    },
    handler: async (request, reply) => {
      try {
        const { email } = request.body;
        const senderId = request.user.userId;

        // Find receiver by email
        const receiver = await fastify.prisma.user.findUnique({
          where: { email }
        });

        if (!receiver) {
          return reply.status(404).send({ error: 'User not found' });
        }

        if (receiver.id === senderId) {
          return reply.status(400).send({ error: 'Cannot chat with yourself' });
        }

        // Check if chat already exists (bidirectional)
        let chat = await fastify.prisma.directChat.findFirst({
          where: {
            OR: [
              { senderId, receiverId: receiver.id },
              { senderId: receiver.id, receiverId: senderId }
            ]
          },
          include: {
            sender: {
              select: { id: true, username: true, email: true }
            },
            receiver: {
              select: { id: true, username: true, email: true }
            }
          }
        });

        if (!chat) {
          // Create new chat
          chat = await fastify.prisma.directChat.create({
            data: {
              senderId,
              receiverId: receiver.id
            },
            include: {
              sender: {
                select: { id: true, username: true, email: true }
              },
              receiver: {
                select: { id: true, username: true, email: true }
              }
            }
          });
        }

        return chat;
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: error.message });
      }
    }
  });

  // Get my direct chats
  fastify.get('/my-chats', {
    onRequest: [fastify.authenticate],
    handler: async (request, reply) => {
      try {
        const userId = request.user.userId;

        const chats = await fastify.prisma.directChat.findMany({
          where: {
            OR: [
              { senderId: userId },
              { receiverId: userId }
            ]
          },
          include: {
            sender: {
              select: { id: true, username: true, email: true }
            },
            receiver: {
              select: { id: true, username: true, email: true }
            },
            messages: {
              take: 1,
              orderBy: {
                createdAt: 'desc'
              },
              include: {
                sender: {
                  select: { id: true, username: true }
                }
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        });

        return chats;
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: error.message });
      }
    }
  });

  // Get direct chat messages
  fastify.get('/:chatId/messages', {
    onRequest: [fastify.authenticate],
    schema: {
      params: {
        type: 'object',
        properties: {
          chatId: { type: 'string' }
        }
      }
    },
    handler: async (request, reply) => {
      try {
        const { chatId } = request.params;
        const userId = request.user.userId;

        // Check if user is part of this chat
        const chat = await fastify.prisma.directChat.findUnique({
          where: { id: chatId }
        });

        if (!chat || (chat.senderId !== userId && chat.receiverId !== userId)) {
          return reply.status(403).send({ error: 'Access denied' });
        }

        const messages = await fastify.prisma.message.findMany({
          where: { directChatId: chatId },
          include: {
            sender: {
              select: { id: true, username: true, email: true }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        });

        return messages;
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: error.message });
      }
    }
  });
}

module.exports = directChatRoutes;