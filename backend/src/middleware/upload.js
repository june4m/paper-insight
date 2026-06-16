'use strict';

const os = require('os');
const multer = require('multer');
const config = require('../config');

/**
 * Multer upload middleware (FR-01). Enforces PDF type (BR-01) and size (BR-02).
 * Files land in the OS temp dir first; the controller moves accepted files into
 * permanent storage.
 */
const upload = multer({
  dest: os.tmpdir(),
  limits: { fileSize: config.maxFileBytes },
  fileFilter: (req, file, cb) => {
    if (config.acceptedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      const err = new Error('Only PDF files are accepted.');
      err.code = 'INVALID_FILE_TYPE';
      cb(err);
    }
  },
});

module.exports = upload.single('file');
