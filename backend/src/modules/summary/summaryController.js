'use strict';

const AppError = require('../../utils/AppError');
const { documents, chunks } = require('../../db/repositories');
const { generateAnswer } = require('../../ai/gemini');

const SYSTEM_INSTRUCTION = [
  'You are a document summarization assistant.',
  'Write a short, clear summary of the document based ONLY on the provided excerpts.',
  'Use the same language as the document. Prefer 3–6 concise sentences or a few bullet points.',
  'Do not invent information that is not in the excerpts.',
].join(' ');

/**
 * Pick representative chunks: take the first few and then evenly sample the rest
 * so the summary reflects the whole document without sending every chunk.
 */
function selectRepresentative(allChunks, max = 12) {
  if (allChunks.length <= max) return allChunks;
  const head = allChunks.slice(0, 4);
  const remaining = allChunks.slice(4);
  const step = Math.ceil(remaining.length / (max - head.length));
  const sampled = remaining.filter((_, i) => i % step === 0).slice(0, max - head.length);
  return [...head, ...sampled];
}

/** POST /api/documents/:id/summary (FR-08, UC-03 / WBS 2.5) */
async function summarize(req, res) {
  const doc = documents.getById(req.params.id);
  if (!doc) throw new AppError(404, 'DOCUMENT_NOT_FOUND', 'Document not found.');
  if (doc.processing_status !== 'completed') {
    throw new AppError(
      409,
      'DOCUMENT_NOT_READY',
      `Document is "${doc.processing_status}". It must be completed before summarizing.`
    );
  }

  const allChunks = chunks.listByDocument(doc.id);
  if (!allChunks.length) {
    throw new AppError(409, 'NO_CONTENT', 'Document has no extracted content to summarize.');
  }

  const selected = selectRepresentative(allChunks);
  const context = selected.map((c, i) => `[${i + 1}] ${c.content}`).join('\n\n');
  const prompt = `Document: ${doc.file_name}\n\nExcerpts:\n${context}\n\nWrite the summary:`;

  const summary = await generateAnswer(SYSTEM_INSTRUCTION, prompt);
  res.json({ summary });
}

module.exports = { summarize };
