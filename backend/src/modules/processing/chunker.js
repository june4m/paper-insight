'use strict';

const config = require('../../config');

/**
 * Rough token estimate. We avoid a heavy tokenizer dependency for the MVP and
 * approximate ~4 characters per token (typical for English/Latin scripts).
 */
function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

function tokensToChars(tokens) {
  return tokens * 4;
}

/**
 * Split page-aware text into overlapping chunks of ~300–800 tokens (FR-03 /
 * WBS 2.4). Chunks are built by accumulating sentences so we don't cut mid-word,
 * and each chunk carries the page number where it started.
 *
 * @param {{pageNumber:number, text:string}[]} pages
 * @param {{chunkTokens?:number, overlap?:number}} [opts]
 * @returns {{content:string, pageNumber:number, chunkIndex:number, tokenCount:number}[]}
 */
function chunkPages(pages, opts = {}) {
  const chunkTokens = opts.chunkTokens || config.rag.chunkTokens;
  const overlapTokens = opts.overlap ?? config.rag.chunkOverlap;
  const maxChars = tokensToChars(chunkTokens);
  const overlapChars = tokensToChars(overlapTokens);

  // Flatten into sentence-like segments tagged with their page number.
  const segments = [];
  for (const page of pages) {
    const clean = page.text.replace(/\s+/g, ' ').trim();
    if (!clean) continue;
    const parts = clean.match(/[^.!?]+[.!?]*\s*/g) || [clean];
    for (const part of parts) {
      segments.push({ text: part, pageNumber: page.pageNumber });
    }
  }

  const chunks = [];
  let buffer = '';
  let bufferPage = segments.length ? segments[0].pageNumber : 1;
  let chunkIndex = 0;

  const flush = () => {
    const content = buffer.trim();
    if (!content) return;
    chunks.push({
      content,
      pageNumber: bufferPage,
      chunkIndex: chunkIndex++,
      tokenCount: estimateTokens(content),
    });
  };

  for (const seg of segments) {
    if (buffer === '') bufferPage = seg.pageNumber;

    if ((buffer + seg.text).length > maxChars && buffer !== '') {
      flush();
      // Start next chunk with an overlap tail of the previous chunk (WBS 2.4.2).
      const tail = buffer.slice(-overlapChars);
      buffer = tail + seg.text;
      bufferPage = seg.pageNumber;
    } else {
      buffer += seg.text;
    }
  }
  flush();

  return chunks;
}

module.exports = { chunkPages, estimateTokens };
