const generateRoomCode = require('../utils/generateRoomCode');

async function roomRoutes(fastify, options) {
  // Create room
  fastify.post('/create', {
    onRequest: [fastify.authenticate],
    schema: {
      body: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string' }
        }
      }
    },
    handler: async (request, reply) => {
      try {
        const { name } = request.body;
        const userId = request.user.userId;

        // Generate unique room code
        let roomCode;
        let isUnique = false;

        while (!isUnique) {
          roomCode = generateRoomCode();
          const existing = await fastify.prisma.room.findUnique({
            where: { roomCode }
          });
          if (!existing) isUnique = true;
        }

        // Create room and add creator as member
        const room = await fastify.prisma.room.create({
          data: {
            name,
            roomCode,
            createdById: userId,
            members: {
              create: {
                userId
              }
            }
          },
          include: {
            createdBy: {
              select: {
                id: true,
                username: true,
                email: true
              }
            },
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    email: true
                  }
                }
              }
            }
          }
        });

        return room;
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: error.message });
      }
    }
  });

  // Join room
  fastify.post('/join', {
    onRequest: [fastify.authenticate],
    schema: {
      body: {
        type: 'object',
        required: ['roomCode'],
        properties: {
          roomCode: { type: 'string' }
        }
      }
    },
    handler: async (request, reply) => {
      try {
        const { roomCode } = request.body;
        const userId = request.user.userId;

        // Find room
        const room = await fastify.prisma.room.findUnique({
          where: { roomCode }
        });

        if (!room) {
          return reply.status(404).send({ error: 'Room not found' });
        }

        // Check if already a member
        const existingMember = await fastify.prisma.roomMember.findUnique({
          where: {
            userId_roomId: {
              userId,
              roomId: room.id
            }
          }
        });

        if (existingMember) {
          return reply.status(400).send({ error: 'Already a member' });
        }

        // Add member
        await fastify.prisma.roomMember.create({
          data: {
            userId,
            roomId: room.id
          }
        });

        // Return room with members
        const updatedRoom = await fastify.prisma.room.findUnique({
          where: { id: room.id },
          include: {
            createdBy: {
              select: {
                id: true,
                username: true,
                email: true
              }
            },
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    email: true
                  }
                }
              }
            }
          }
        });

        return updatedRoom;
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: error.message });
      }
    }
  });

  // Get my rooms
  fastify.get('/my-rooms', {
    onRequest: [fastify.authenticate],
    handler: async (request, reply) => {
      try {
        const userId = request.user.userId;

        const rooms = await fastify.prisma.room.findMany({
          where: {
            members: {
              some: {
                userId
              }
            }
          },
          include: {
            createdBy: {
              select: {
                id: true,
                username: true,
                email: true
              }
            },
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    email: true
                  }
                }
              }
            },
            messages: {
              take: 1,
              orderBy: {
                createdAt: 'desc'
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        });

        return rooms;
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: error.message });
      }
    }
  });

  // Get room messages
  fastify.get('/:roomId/messages', {
    onRequest: [fastify.authenticate],
    schema: {
      params: {
        type: 'object',
        properties: {
          roomId: { type: 'string' }
        }
      }
    },
    handler: async (request, reply) => {
      try {
        const { roomId } = request.params;
        const userId = request.user.userId;

        // Check if user is member
        const member = await fastify.prisma.roomMember.findUnique({
          where: {
            userId_roomId: {
              userId,
              roomId
            }
          }
        });

        if (!member) {
          return reply.status(403).send({ error: 'Not a member of this room' });
        }

        const messages = await fastify.prisma.message.findMany({
          where: { roomId },
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                email: true
              }
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

module.exports = roomRoutes;