'use strict';

const AppError = require('../../utils/AppError');
const config = require('../../config');
const { v4: uuid } = require('uuid');
const { documents, chunks, chatMessages } = require('../../db/repositories');
const { embedText, generateAnswer } = require('../../ai/gemini');
const vectorstore = require('../vectorstore');
const { SYSTEM_INSTRUCTION, buildUserPrompt } = require('./prompt');

/**
 * POST /api/chat/ask (FR-06, FR-07 / WBS 4.6, 4.7)
 * Body: { document_id, question }
 */
async function ask(req, res) {
  const { document_id: documentId, question } = req.body || {};

  if (!documentId || question == null) {
    throw new AppError(400, 'MISSING_FIELDS', 'document_id and question are required.');
  }
  if (!String(question).trim()) {
    throw new AppError(400, 'EMPTY_QUESTION', 'Question must not be empty.');
  }

  const doc = documents.getById(documentId);
  if (!doc) throw new AppError(404, 'DOCUMENT_NOT_FOUND', 'Document not found.');
  if (doc.processing_status !== 'completed') {
    // BR-03: only completed documents can be queried.
    throw new AppError(
      409,
      'DOCUMENT_NOT_READY',
      `Document is "${doc.processing_status}". It must be completed before asking questions.`
    );
  }

  // 1. Embed the question (WBS 4.4.1)
  const questionVector = await embedText(String(question).trim());

  // 2. Retrieve top-k relevant chunks within this document (WBS 4.4.2, 4.4.3)
  const matches = await vectorstore.query(questionVector, {
    topK: config.rag.topK,
    documentId,
  });

  // 3. Relevance gate (BR-04 / AC-06)
  const relevant = matches.filter((m) => m.distance <= config.rag.simMaxDistance);
  if (!relevant.length) {
    const answer = config.notFoundAnswer;
    chatMessages.insert({ id: uuid(), document_id: documentId, question, answer, sources: [] });
    return res.json({ answer, sources: [] });
  }

  // 4. Load chunk content, preserving retrieval order.
  const chunkRows = chunks.getByIds(relevant.map((m) => m.chunkId));
  const byId = new Map(chunkRows.map((c) => [c.id, c]));
  const orderedChunks = relevant.map((m) => byId.get(m.chunkId)).filter(Boolean);

  // 5. Build grounded prompt + call Gemini (WBS 4.5, 4.6)
  const userPrompt = buildUserPrompt(question, orderedChunks);
  const answer = await generateAnswer(SYSTEM_INSTRUCTION, userPrompt);

  // 6. Citations (FR-07 / WBS 4.7)
  const sources = orderedChunks.map((c) => ({
    chunk_id: c.id,
    document_name: doc.file_name,
    page_number: c.page_number,
    content: c.content,
  }));

  chatMessages.insert({ id: uuid(), document_id: documentId, question, answer, sources });
  res.json({ answer, sources });
}

/** GET /api/chat/:documentId/history (Should-Have: chat history) */
async function history(req, res) {
  const doc = documents.getById(req.params.documentId);
  if (!doc) throw new AppError(404, 'DOCUMENT_NOT_FOUND', 'Document not found.');
  res.json(chatMessages.listByDocument(req.params.documentId));
}

module.exports = { ask, history };
