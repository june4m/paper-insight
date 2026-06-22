'use strict';

const fs = require('fs');
const path = require('path');
const { v4: uuid } = require('uuid');
const config = require('../../config');
const AppError = require('../../utils/AppError');
const { serializeDocument } = require('../../utils/serialize');
const { documents } = require('../../db/repositories');
const vectorstore = require('../vectorstore');
const { processDocument } = require('../processing/pipeline');

/** POST /api/documents/upload (FR-01, AC-01, AC-03) */
async function upload(req, res) {
  if (!req.file) {
    throw new AppError(400, 'NO_FILE', 'No file uploaded. Use form field "file".');
  }

  // multer fileFilter already enforces PDF + size, but double-check type (BR-01).
  if (!config.acceptedMimeTypes.includes(req.file.mimetype)) {
    safeUnlink(req.file.path);
    throw new AppError(400, 'INVALID_FILE_TYPE', 'Only PDF files are accepted.');
  }

  const id = uuid();
  const ext = '.pdf';
  const storagePath = path.join(config.storageDir, `${id}${ext}`);
  fs.mkdirSync(config.storageDir, { recursive: true });
  moveFile(req.file.path, storagePath);

  const doc = documents.insert({
    id,
    file_name: req.file.originalname,
    file_type: req.file.mimetype,
    file_size: req.file.size,
    storage_path: storagePath,
  });

  // Kick off async processing (does not block the response).
  processDocument(id, storagePath);

  res.status(201).json(serializeDocument(doc));
}

/** GET /api/documents (FR-09) */
async function list(req, res) {
  res.json(documents.list().map(serializeDocument));
}

/** GET /api/documents/:id */
async function getOne(req, res) {
  const doc = documents.getById(req.params.id);
  if (!doc) throw new AppError(404, 'DOCUMENT_NOT_FOUND', 'Document not found.');
  res.json(serializeDocument(doc));
}

/** DELETE /api/documents/:id (FR-10, BR-05, AC-07) */
async function remove(req, res) {
  const doc = documents.getById(req.params.id);
  if (!doc) throw new AppError(404, 'DOCUMENT_NOT_FOUND', 'Document not found.');

  // Remove vectors first (external store), then file, then DB rows (cascade).
  await vectorstore.deleteByDocument(doc.id);
  safeUnlink(doc.storage_path);
  documents.delete(doc.id); // cascades chunks + chat_messages

  res.json({ deleted: true, id: doc.id });
}

/**
 * Move a file into permanent storage. Uses rename (fast, atomic) when source and
 * destination are on the same volume; falls back to copy+unlink when they are not
 * (e.g. OS temp dir on C: and storage on D: -> rename throws EXDEV on Windows).
 */
function moveFile(src, dest) {
  try {
    fs.renameSync(src, dest);
  } catch (err) {
    if (err.code !== 'EXDEV') throw err;
    fs.copyFileSync(src, dest);
    safeUnlink(src);
  }
}

function safeUnlink(p) {
  try {
    if (p && fs.existsSync(p)) fs.unlinkSync(p);
  } catch (e) {
    console.warn(`[document] could not delete file ${p}: ${e.message}`);
  }
}

module.exports = { upload, list, getOne, remove };
