'use strict';

const { ChromaClient } = require('chromadb');
const config = require('../../config');

let collection = null;

/**
 * A no-op embedding function: we always pass our own precomputed vectors,
 * so Chroma should never try to embed text itself.
 */
const passthroughEmbedder = {
  generate: async (texts) => texts.map(() => []),
};

async function init() {
  const client = new ChromaClient({ path: config.vector.chromaUrl });
  // Throws if the server is unreachable -> caller falls back to memory store.
  collection = await client.getOrCreateCollection({
    name: config.vector.collection,
    embeddingFunction: passthroughEmbedder,
    metadata: { 'hnsw:space': 'cosine' },
  });
  return collection;
}

async function upsert(records) {
  if (!records.length) return;
  await collection.upsert({
    ids: records.map((r) => r.id),
    embeddings: records.map((r) => r.vector),
    documents: records.map((r) => r.content),
    metadatas: records.map((r) => ({
      documentId: r.documentId,
      chunkIndex: r.chunkIndex,
      pageNumber: r.pageNumber ?? null,
      modelName: config.gemini.embedModel,
    })),
  });
}

async function query(vector, { topK, documentId }) {
  const res = await collection.query({
    queryEmbeddings: [vector],
    nResults: topK,
    where: documentId ? { documentId } : undefined,
  });

  const ids = res.ids?.[0] || [];
  const distances = res.distances?.[0] || [];
  const metadatas = res.metadatas?.[0] || [];

  return ids.map((id, i) => ({
    chunkId: id,
    distance: distances[i],
    metadata: metadatas[i] || {},
  }));
}

async function deleteByDocument(documentId) {
  await collection.delete({ where: { documentId } });
}

module.exports = { init, upsert, query, deleteByDocument };
