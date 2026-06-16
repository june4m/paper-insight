'use strict';

const multer = require('multer');
const AppError = require('../utils/AppError');
const config = require('../config');

/** Wrap async route handlers so thrown/rejected errors reach the error handler. */
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

/** Central error handler -> consistent { error: { code, message } } shape. */
function errorHandler(err, req, res, _next) {
  // Multer-specific errors (size/type) -> 400 (BR-01, BR-02).
  if (err instanceof multer.MulterError) {
    const code = err.code === 'LIMIT_FILE_SIZE' ? 'FILE_TOO_LARGE' : err.code;
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? `File exceeds the maximum size of ${Math.round(config.maxFileBytes / 1048576)} MB.`
        : err.message;
    return res.status(400).json({ error: { code, message } });
  }
  if (err.code === 'INVALID_FILE_TYPE') {
    return res.status(400).json({ error: { code: 'INVALID_FILE_TYPE', message: err.message } });
  }

  if (err instanceof AppError) {
    return res.status(err.status).json({ error: { code: err.code, message: err.message } });
  }

  // AI / config errors -> 502/500
  if (err.code === 'AI_NOT_CONFIGURED') {
    return res.status(500).json({ error: { code: err.code, message: err.message } });
  }
  if (err.code === 'AI_ERROR') {
    return res.status(502).json({ error: { code: err.code, message: err.message } });
  }

  console.error('[error]', err);
  res
    .status(500)
    .json({ error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' } });
}

module.exports = { asyncHandler, errorHandler };
