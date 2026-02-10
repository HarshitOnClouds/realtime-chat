const bcrypt = require('bcryptjs');

async function authRoutes(fastify, options) {
  // Register
  fastify.post('/register', {
    schema: {
      body: {
        type: 'object',
        required: ['username', 'email', 'password'],
        properties: {
          username: { type: 'string' },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 }
        }
      }
    },
    handler: async (request, reply) => {
      try {
        const { username, email, password } = request.body;

        // Check if user exists
        const existingUser = await fastify.prisma.user.findFirst({
          where: {
            OR: [{ email }, { username }]
          }
        });

        if (existingUser) {
          return reply.status(400).send({ error: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await fastify.prisma.user.create({
          data: {
            username,
            email,
            password: hashedPassword
          }
        });

        // Generate token
        const token = fastify.jwt.sign({ userId: user.id });

        return {
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email
          }
        };
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: error.message });
      }
    }
  });

  // Login
  fastify.post('/login', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' }
        }
      }
    },
    handler: async (request, reply) => {
      try {
        const { email, password } = request.body;

        // Find user
        const user = await fastify.prisma.user.findUnique({ 
          where: { email } 
        });

        if (!user) {
          return reply.status(400).send({ error: 'Invalid credentials' });
        }

        // Check password
        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
          return reply.status(400).send({ error: 'Invalid credentials' });
        }

        // Generate token
        const token = fastify.jwt.sign({ userId: user.id });

        return {
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email
          }
        };
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: error.message });
      }
    }
  });

  // Get current user
  fastify.get('/me', {
    onRequest: [fastify.authenticate],
    handler: async (request, reply) => {
      try {
        const user = await fastify.prisma.user.findUnique({
          where: { id: request.user.userId },
          select: {
            id: true,
            username: true,
            email: true,
            createdAt: true
          }
        });
        return user;
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: error.message });
      }
    }
  });
}

module.exports = authRoutes;