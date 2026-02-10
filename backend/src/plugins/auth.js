const fp = require('fastify-plugin');
const jwt = require('@fastify/jwt');

async function authPlugin(fastify, options) {
  // Register JWT
  fastify.register(jwt, {
    secret: process.env.JWT_SECRET
  });

  // Decorate fastify with authenticate method
  fastify.decorate('authenticate', async function (request, reply) {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  });
}

module.exports = fp(authPlugin);