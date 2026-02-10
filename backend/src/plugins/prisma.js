const { PrismaClient } = require('@prisma/client');
const fp = require('fastify-plugin');

async function prismaPlugin(fastify, options) {
  const prisma = new PrismaClient();

  // Make Prisma Client available through the fastify server instance
  fastify.decorate('prisma', prisma);

  // Close connection when fastify closes
  fastify.addHook('onClose', async (server) => {
    await server.prisma.$disconnect();
  });
}

module.exports = fp(prismaPlugin);