'use strict';

/**
 * Fallback vector store: cosine similarity in JS, vectors persisted in SQLite
 * (chunk_vectors table). Adequate for the MVP's "small data" target (NFR-01:
 * vector search < 2s). Distance returned is cosine distance (1 - cosine sim)
 * to match Chroma's cosine space.
 */

const db = require('../../db');

function cosineDistance(a, b) {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 1;
  const sim = dot / (Math.sqrt(na) * Math.sqrt(nb));
  return 1 - sim;
}

async function upsert(records) {
  const stmt = db.prepare(
    `INSERT INTO chunk_vectors (chunk_id, document_id, vector)
     VALUES (@chunk_id, @document_id, @vector)
     ON CONFLICT(chunk_id) DO UPDATE SET vector = excluded.vector`
  );
  const tx = db.transaction((rows) => {
    for (const r of rows) {
      stmt.run({
        chunk_id: r.id,
        document_id: r.documentId,
        vector: JSON.stringify(r.vector),
      });
    }
  });
  tx(records);
}

async function query(vector, { topK, documentId }) {
  const rows = documentId
    ? db
        .prepare('SELECT chunk_id, document_id, vector FROM chunk_vectors WHERE document_id = ?')
        .all(documentId)
    : db.prepare('SELECT chunk_id, document_id, vector FROM chunk_vectors').all();

  const scored = rows.map((r) => ({
    chunkId: r.chunk_id,
    distance: cosineDistance(vector, JSON.parse(r.vector)),
    metadata: { documentId: r.document_id },
  }));

  scored.sort((a, b) => a.distance - b.distance);
  return scored.slice(0, topK);
}

async function deleteByDocument(documentId) {
  db.prepare('DELETE FROM chunk_vectors WHERE document_id = ?').run(documentId);
}

module.exports = { upsert, query, deleteByDocument };
