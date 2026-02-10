const Fastify = require('fastify');
const cors = require('@fastify/cors');
const socketIO = require('socket.io');
require('dotenv').config();

const prismaPlugin = require('./src/plugins/prisma');
const authPlugin = require('./src/plugins/auth');
const authRoutes = require('./src/routes/auth');
const roomRoutes = require('./src/routes/rooms');
const directChatRoutes = require('./src/routes/directChats');
const socketHandler = require('./src/socket/socketHandler');

// Create Fastify instance
const fastify = Fastify({
  logger: {
    level: 'info',
    transport: process.env.NODE_ENV !== 'production' ? {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname'
      }
    } : undefined
  }
});

// Register CORS
fastify.register(cors, {
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
});

// Register plugins
fastify.register(prismaPlugin);
fastify.register(authPlugin);

// Register routes
fastify.register(authRoutes, { prefix: '/api/auth' });
fastify.register(roomRoutes, { prefix: '/api/rooms' });
fastify.register(directChatRoutes, { prefix: '/api/direct-chats' });

// Health check
fastify.get('/health', async (request, reply) => {
  return { status: 'ok' };
});

// Start server
const start = async () => {
  try {
    await fastify.listen({ 
      port: process.env.PORT || 5000,
      host: '0.0.0.0'
    });

    // Setup Socket.IO after server starts
    const io = socketIO(fastify.server, {
      cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
      }
    });

    socketHandler(io);

    fastify.log.info(`Server running on port ${process.env.PORT || 5000}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();