'use strict';

/**
 * Vector store abstraction (WBS 4.2).
 * Primary backend: ChromaDB (per chosen stack).
 * Fallback backend: "memory" — an in-process cosine store persisted in SQLite,
 * so the app runs end-to-end without a separate Chroma server during dev/demo.
 *
 * Public interface:
 *   upsert(records)  records: [{ id, documentId, content, pageNumber, chunkIndex, vector }]
 *   query(vector, { topK, documentId })  -> [{ chunkId, distance, metadata }]
 *   deleteByDocument(documentId)
 */

const config = require('../../config');
const chromaStore = require('./chromaStore');
const memoryStore = require('./memoryStore');

let active = null;

async function getStore() {
  if (active) return active;

  if (config.vector.backend === 'memory') {
    active = memoryStore;
    return active;
  }

  // backend === 'chroma' (default): try Chroma, fall back to memory if down.
  try {
    await chromaStore.init();
    active = chromaStore;
    console.log(`[vectorstore] using ChromaDB at ${config.vector.chromaUrl}`);
  } catch (err) {
    console.warn(
      `[vectorstore] ChromaDB unavailable (${err.message}). ` +
        'Falling back to in-memory store. Set VECTOR_BACKEND=memory to silence this.'
    );
    active = memoryStore;
  }
  return active;
}

module.exports = {
  async upsert(records) {
    return (await getStore()).upsert(records);
  },
  async query(vector, opts) {
    return (await getStore()).query(vector, opts);
  },
  async deleteByDocument(documentId) {
    return (await getStore()).deleteByDocument(documentId);
  },
};
