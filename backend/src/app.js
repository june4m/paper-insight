'use strict';

const express = require('express');
const cors = require('cors');
const config = require('./config');
const routes = require('./routes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(
  cors({
    origin: config.corsOrigins.length ? config.corsOrigins : true,
  })
);
app.use(express.json());

app.use('/api', routes);

// 404 for unknown API routes
app.use((req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: `No route for ${req.method} ${req.path}` } });
});

app.use(errorHandler);

module.exports = app;
