'use strict';

const config = require('../../config');

/**
 * Q&A prompt template (WBS 4.5). Enforces grounding + anti-hallucination
 * (BR-04 / AC-06): the model must answer ONLY from the provided context and
 * otherwise return the exact "not found" sentence.
 */
const SYSTEM_INSTRUCTION = [
  'You are a document question-answering assistant.',
  'Answer the user question USING ONLY the provided context excerpts from their document.',
  'Do not use outside knowledge and do not invent information.',
  `If the context does not contain enough information to answer, reply EXACTLY with: "${config.notFoundAnswer}"`,
  'Answer in the same language as the question.',
  'Keep the answer short, clear and easy to read. When useful, cite the page number(s) you used.',
].join(' ');

/**
 * Build the user-facing prompt with numbered, page-tagged context (WBS 4.5.1).
 * @param {string} question
 * @param {{content:string, page_number:number|null, chunk_index:number}[]} chunks
 */
function buildUserPrompt(question, chunks) {
  const context = chunks
    .map((c, i) => {
      const page = c.page_number != null ? ` (page ${c.page_number})` : '';
      return `[${i + 1}]${page}: ${c.content}`;
    })
    .join('\n\n');

  return `Context excerpts:\n${context}\n\nQuestion: ${question}\n\nAnswer:`;
}

module.exports = { SYSTEM_INSTRUCTION, buildUserPrompt };
