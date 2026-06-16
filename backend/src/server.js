'use strict';

const app = require('./app');
const config = require('./config');

// Touch the DB module so the schema is created on boot.
require('./db');

const server = app.listen(config.port, () => {
  console.log(`[server] Paper Insight backend listening on http://localhost:${config.port}`);
  console.log(`[server] vector backend: ${config.vector.backend}`);
  if (!config.gemini.apiKey) {
    console.warn('[server] WARNING: GEMINI_API_KEY is not set — AI features will fail.');
  }
});

process.on('SIGINT', () => server.close(() => process.exit(0)));
process.on('SIGTERM', () => server.close(() => process.exit(0)));

module.exports = server;
