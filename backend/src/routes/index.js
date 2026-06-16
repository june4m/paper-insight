'use strict';

const express = require('express');
const upload = require('../middleware/upload');
const { asyncHandler } = require('../middleware/errorHandler');
const documentController = require('../modules/document/documentController');
const chatController = require('../modules/chat/chatController');
const summaryController = require('../modules/summary/summaryController');

const router = express.Router();

// Health
router.get('/health', (req, res) => res.json({ status: 'ok' }));

// Documents (spec §10)
router.post('/documents/upload', upload, asyncHandler(documentController.upload));
router.get('/documents', asyncHandler(documentController.list));
router.get('/documents/:id', asyncHandler(documentController.getOne));
router.delete('/documents/:id', asyncHandler(documentController.remove));
router.post('/documents/:id/summary', asyncHandler(summaryController.summarize));

// Chat
router.post('/chat/ask', asyncHandler(chatController.ask));
router.get('/chat/:documentId/history', asyncHandler(chatController.history));

module.exports = router;
