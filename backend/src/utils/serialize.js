'use strict';

/** Shape a documents row for API responses (spec §10 / FR-09). */
function serializeDocument(doc) {
  if (!doc) return null;
  return {
    id: doc.id,
    file_name: doc.file_name,
    file_size: doc.file_size,
    file_type: doc.file_type,
    processing_status: doc.processing_status,
    page_count: doc.page_count ?? null,
    error_message: doc.error_message ?? null,
    created_at: doc.created_at,
    updated_at: doc.updated_at,
  };
}

module.exports = { serializeDocument };
