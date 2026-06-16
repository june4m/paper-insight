'use strict';

const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config');

let client = null;

function getClient() {
  if (!config.gemini.apiKey) {
    const err = new Error(
      'GEMINI_API_KEY is not configured. Set it in backend/.env (see .env.example).'
    );
    err.code = 'AI_NOT_CONFIGURED';
    throw err;
  }
  if (!client) client = new GoogleGenerativeAI(config.gemini.apiKey);
  return client;
}

/**
 * Generate a chat completion. (WBS 4.1.2)
 * @param {string} systemInstruction
 * @param {string} userPrompt
 * @returns {Promise<string>}
 */
async function generateAnswer(systemInstruction, userPrompt) {
  try {
    const model = getClient().getGenerativeModel({
      model: config.gemini.chatModel,
      systemInstruction,
    });
    const result = await model.generateContent(userPrompt);
    return result.response.text().trim();
  } catch (err) {
    throw wrapAiError(err, 'Failed to generate AI answer.');
  }
}

/**
 * Embed a single piece of text. (WBS 4.1.2 / FR-04)
 * @returns {Promise<number[]>}
 */
async function embedText(text) {
  const [vec] = await embedBatch([text]);
  return vec;
}

/**
 * Embed many texts. Gemini embedContent is per-item; we run them with a small
 * concurrency limit to stay within rate limits (WBS 4.3.2).
 * @param {string[]} texts
 * @returns {Promise<number[][]>}
 */
async function embedBatch(texts, concurrency = 5) {
  try {
    const model = getClient().getGenerativeModel({ model: config.gemini.embedModel });
    const results = new Array(texts.length);
    let cursor = 0;

    async function worker() {
      while (cursor < texts.length) {
        const i = cursor++;
        const res = await model.embedContent(texts[i]);
        results[i] = res.embedding.values;
      }
    }

    const workers = Array.from({ length: Math.min(concurrency, texts.length) }, worker);
    await Promise.all(workers);
    return results;
  } catch (err) {
    throw wrapAiError(err, 'Failed to generate embeddings.');
  }
}

function wrapAiError(err, message) {
  if (err.code === 'AI_NOT_CONFIGURED') return err;
  const wrapped = new Error(`${message} (${err.message})`);
  wrapped.code = 'AI_ERROR';
  wrapped.cause = err;
  return wrapped;
}

module.exports = { generateAnswer, embedText, embedBatch };
