'use strict';

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const config = require('../config');

// Ensure the directory for the DB file exists.
fs.mkdirSync(path.dirname(config.dbPath), { recursive: true });

const db = new Database(config.dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Schema (WBS 1.4 / spec §9). Idempotent.
db.exec(`
CREATE TABLE IF NOT EXISTS documents (
  id                TEXT PRIMARY KEY,
  file_name         TEXT NOT NULL,
  file_type         TEXT NOT NULL,
  file_size         INTEGER NOT NULL,
  storage_path      TEXT NOT NULL,
  processing_status TEXT NOT NULL DEFAULT 'processing',
  error_message     TEXT,
  page_count        INTEGER,
  created_at        TEXT NOT NULL,
  updated_at        TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS document_chunks (
  id           TEXT PRIMARY KEY,
  document_id  TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  chunk_index  INTEGER NOT NULL,
  content      TEXT NOT NULL,
  page_number  INTEGER,
  token_count  INTEGER NOT NULL DEFAULT 0,
  created_at   TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_chunks_document ON document_chunks(document_id);

CREATE TABLE IF NOT EXISTS chat_messages (
  id           TEXT PRIMARY KEY,
  document_id  TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  question     TEXT NOT NULL,
  answer       TEXT NOT NULL,
  sources      TEXT NOT NULL DEFAULT '[]',
  created_at   TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_chat_document ON chat_messages(document_id);

-- Fallback vector store table (used only when VECTOR_BACKEND=memory).
CREATE TABLE IF NOT EXISTS chunk_vectors (
  chunk_id    TEXT PRIMARY KEY REFERENCES document_chunks(id) ON DELETE CASCADE,
  document_id TEXT NOT NULL,
  vector      TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_vectors_document ON chunk_vectors(document_id);
`);

module.exports = db;
