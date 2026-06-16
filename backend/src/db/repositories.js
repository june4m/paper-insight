'use strict';

const db = require('./index');

function nowIso() {
  return new Date().toISOString();
}

// ─── Documents ──────────────────────────────────────────────
const documents = {
  insert(doc) {
    const ts = nowIso();
    db.prepare(
      `INSERT INTO documents
        (id, file_name, file_type, file_size, storage_path, processing_status, created_at, updated_at)
       VALUES (@id, @file_name, @file_type, @file_size, @storage_path, @processing_status, @created_at, @updated_at)`
    ).run({
      processing_status: 'processing',
      created_at: ts,
      updated_at: ts,
      ...doc,
    });
    return this.getById(doc.id);
  },

  getById(id) {
    return db.prepare('SELECT * FROM documents WHERE id = ?').get(id);
  },

  list() {
    return db.prepare('SELECT * FROM documents ORDER BY created_at DESC').all();
  },

  updateStatus(id, status, errorMessage = null) {
    db.prepare(
      `UPDATE documents SET processing_status = ?, error_message = ?, updated_at = ? WHERE id = ?`
    ).run(status, errorMessage, nowIso(), id);
  },

  setPageCount(id, pageCount) {
    db.prepare('UPDATE documents SET page_count = ?, updated_at = ? WHERE id = ?').run(
      pageCount,
      nowIso(),
      id
    );
  },

  delete(id) {
    return db.prepare('DELETE FROM documents WHERE id = ?').run(id).changes > 0;
  },
};

// ─── Chunks ─────────────────────────────────────────────────
const chunks = {
  insertMany(rows) {
    const stmt = db.prepare(
      `INSERT INTO document_chunks
        (id, document_id, chunk_index, content, page_number, token_count, created_at)
       VALUES (@id, @document_id, @chunk_index, @content, @page_number, @token_count, @created_at)`
    );
    const ts = nowIso();
    const tx = db.transaction((items) => {
      for (const r of items) stmt.run({ created_at: ts, ...r });
    });
    tx(rows);
  },

  listByDocument(documentId) {
    return db
      .prepare('SELECT * FROM document_chunks WHERE document_id = ? ORDER BY chunk_index ASC')
      .all(documentId);
  },

  getByIds(ids) {
    if (!ids.length) return [];
    const placeholders = ids.map(() => '?').join(',');
    return db
      .prepare(`SELECT * FROM document_chunks WHERE id IN (${placeholders})`)
      .all(...ids);
  },
};

// ─── Chat messages ──────────────────────────────────────────
const chatMessages = {
  insert(msg) {
    const row = {
      ...msg,
      created_at: nowIso(),
      sources: JSON.stringify(msg.sources || []),
    };
    db.prepare(
      `INSERT INTO chat_messages (id, document_id, question, answer, sources, created_at)
       VALUES (@id, @document_id, @question, @answer, @sources, @created_at)`
    ).run(row);
  },

  listByDocument(documentId) {
    return db
      .prepare('SELECT * FROM chat_messages WHERE document_id = ? ORDER BY created_at ASC')
      .all(documentId)
      .map((m) => ({ ...m, sources: JSON.parse(m.sources) }));
  },
};

module.exports = { documents, chunks, chatMessages, nowIso };
