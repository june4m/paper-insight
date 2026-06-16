'use strict';

const { v4: uuid } = require('uuid');
const { documents, chunks } = require('../../db/repositories');
const { extractPdf } = require('./pdfExtractor');
const { chunkPages } = require('./chunker');
const { embedBatch } = require('../../ai/gemini');
const vectorstore = require('../vectorstore');

/**
 * Full ingestion pipeline for one document (WBS 2.3, 2.4, 4.3, 4.2).
 * Runs asynchronously after upload; updates processing_status on completion
 * or failure (NFR-03). Never throws to the caller — it records `failed`.
 *
 * @param {string} documentId
 * @param {string} filePath
 */
async function processDocument(documentId, filePath) {
  try {
    // 1. Extract text (FR-02)
    const { pages, pageCount } = await extractPdf(filePath);
    documents.setPageCount(documentId, pageCount);

    // 2. Chunk (FR-03)
    const rawChunks = chunkPages(pages);
    if (!rawChunks.length) {
      throw Object.assign(new Error('Document produced no chunks.'), { code: 'NO_CHUNKS' });
    }

    const chunkRows = rawChunks.map((c) => ({
      id: uuid(),
      document_id: documentId,
      chunk_index: c.chunkIndex,
      content: c.content,
      page_number: c.pageNumber,
      token_count: c.tokenCount,
    }));
    chunks.insertMany(chunkRows);

    // 3. Embed (FR-04 / WBS 4.3) — batched
    const vectors = await embedBatch(chunkRows.map((c) => c.content));

    // 4. Store vectors (FR-05 / WBS 4.2)
    await vectorstore.upsert(
      chunkRows.map((c, i) => ({
        id: c.id,
        documentId,
        content: c.content,
        pageNumber: c.page_number,
        chunkIndex: c.chunk_index,
        vector: vectors[i],
      }))
    );

    // 5. Mark completed (UC-01 step 9)
    documents.updateStatus(documentId, 'completed');
    console.log(`[processing] document ${documentId} completed (${chunkRows.length} chunks)`);
  } catch (err) {
    console.error(`[processing] document ${documentId} failed:`, err.message);
    documents.updateStatus(documentId, 'failed', err.message);
  }
}

module.exports = { processDocument };
