# 04 – API Contract (WBS, spec §10)

Base URL: `http://localhost:4000/api`

All responses are JSON. Errors use:
```json
{ "error": { "code": "STRING_CODE", "message": "human readable" } }
```

---

## POST /api/documents/upload  (FR-01, AC-01, AC-03)

Multipart form-data, field name `file`.

**Rules:** PDF only (BR-01), ≤ 10 MB (BR-02).

`201 Created`
```json
{
  "id": "uuid",
  "file_name": "paper.pdf",
  "file_size": 824123,
  "processing_status": "processing",
  "created_at": "2026-06-15T10:00:00.000Z"
}
```
`400` — `INVALID_FILE_TYPE` | `FILE_TOO_LARGE` | `NO_FILE`

---

## GET /api/documents  (FR-09)

`200 OK`
```json
[
  {
    "id": "uuid",
    "file_name": "paper.pdf",
    "file_size": 824123,
    "processing_status": "completed",
    "page_count": 12,
    "created_at": "2026-06-15T10:00:00.000Z"
  }
]
```

---

## GET /api/documents/:id

`200 OK` — single document object (same shape as list item, plus `error_message`).
`404` — `DOCUMENT_NOT_FOUND`

---

## DELETE /api/documents/:id  (FR-10, BR-05, AC-07)

Removes file, document row, chunks, embeddings, chat messages.

`200 OK`
```json
{ "deleted": true, "id": "uuid" }
```
`404` — `DOCUMENT_NOT_FOUND`

---

## POST /api/chat/ask  (FR-06, FR-07, AC-04, AC-05, AC-06)

```json
{ "document_id": "uuid", "question": "What is the chunk size?" }
```

`200 OK`
```json
{
  "answer": "The chunk size is about 300–800 tokens.",
  "sources": [
    {
      "chunk_id": "uuid",
      "document_name": "paper.pdf",
      "page_number": 3,
      "content": "Each chunk has length ~300-800 tokens..."
    }
  ]
}
```
When nothing relevant is found (BR-04, AC-06):
```json
{ "answer": "Không tìm thấy thông tin này trong tài liệu.", "sources": [] }
```
`400` — `MISSING_FIELDS` | `EMPTY_QUESTION`
`404` — `DOCUMENT_NOT_FOUND`
`409` — `DOCUMENT_NOT_READY` (status != completed, BR-03)

---

## POST /api/documents/:id/summary  (FR-08, UC-03)

`200 OK`
```json
{ "summary": "This document describes ..." }
```
`404` — `DOCUMENT_NOT_FOUND`
`409` — `DOCUMENT_NOT_READY`

---

## Health

## GET /api/health → `200 { "status": "ok" }`
