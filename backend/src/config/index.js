'use strict';

const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const root = path.resolve(__dirname, '..', '..');

function resolveFromRoot(p, fallback) {
  return path.resolve(root, p || fallback);
}

const config = {
  root,
  port: parseInt(process.env.PORT || '4000', 10),
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:3000')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),

  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    chatModel: process.env.CHAT_MODEL || 'gemini-2.0-flash',
    embedModel: process.env.EMBED_MODEL || 'text-embedding-004',
  },

  storageDir: resolveFromRoot(process.env.STORAGE_DIR, './storage'),
  maxFileBytes: parseInt(process.env.MAX_FILE_BYTES || '10485760', 10),

  dbPath: resolveFromRoot(process.env.DB_PATH, './data/paper-insight.db'),

  vector: {
    backend: (process.env.VECTOR_BACKEND || 'chroma').toLowerCase(),
    chromaUrl: process.env.CHROMA_URL || 'http://localhost:8000',
    collection: process.env.CHROMA_COLLECTION || 'paper_insight_chunks',
  },

  rag: {
    chunkTokens: parseInt(process.env.CHUNK_TOKENS || '600', 10),
    chunkOverlap: parseInt(process.env.CHUNK_OVERLAP || '80', 10),
    topK: parseInt(process.env.TOP_K || '4', 10),
    simMaxDistance: parseFloat(process.env.SIM_MAX_DISTANCE || '0.75'),
  },

  // Business rules
  acceptedMimeTypes: ['application/pdf'],
  notFoundAnswer: 'Không tìm thấy thông tin này trong tài liệu.',
};

module.exports = config;
