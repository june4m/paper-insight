# 02 – RAG Data Flow (WBS 1.3.3)

## A. Ingestion flow (Upload → ready to query)

```
User selects PDF
   │
   ▼
POST /api/documents/upload  (multipart)
   │
   ├─ validate: mime == application/pdf, size <= 10MB      (BR-01, BR-02, NFR-02)
   ├─ save file → backend/storage/<documentId>.pdf
   ├─ insert Document row, processing_status = "processing" (FR-01)
   │
   ▼  (async, non-blocking response)
processing pipeline:
   1. extract text per page (pdf-parse)                    (FR-02)
        └─ if no text / parse error → status = "failed"    (NFR-03)
   2. chunk text → 300–800 tokens, with overlap            (FR-03)
        └─ persist DocumentChunk rows (content, page, index, token_count)
   3. embed each chunk via Gemini text-embedding-004       (FR-04)
        └─ batched to respect rate limits
   4. upsert vectors into ChromaDB collection              (FR-05)
        └─ id = chunkId, metadata = {documentId, page, chunkIndex}
   5. status = "completed"                                 (UC-01 step 9)
```

The upload endpoint returns immediately with the `documentId` and
`processing_status = "processing"`. The frontend polls `GET /api/documents/:id`
until the status becomes `completed` or `failed`.

## B. Query flow (Ask a question)

```
POST /api/chat/ask  { document_id, question }
   │
   ├─ load document; require status == "completed"          (BR-03)
   ├─ embed question via Gemini text-embedding-004          (FR-06)
   ├─ Chroma query: top-k (k=4) nearest chunks,
   │     filtered by metadata.documentId                    (4.4.2, 4.4.3)
   │
   ├─ if best similarity below threshold → answer =
   │     "Không tìm thấy thông tin này trong tài liệu."     (BR-04, AC-06)
   │
   ├─ build grounded prompt:
   │     system: answer ONLY from context, cite, else the
   │             "not found" sentence                        (4.5.1, 4.5.2)
   │     context: numbered chunks with page numbers
   │     user: the question
   ├─ Gemini chat completion → answer                        (FR-06)
   ├─ persist ChatMessage (question, answer, sources)
   │
   ▼
response { answer, sources: [{ chunkId, page, content, documentName }] }  (FR-07)
```

## C. Summary flow

```
POST /api/documents/:id/summary
   │
   ├─ require status == "completed"
   ├─ gather representative chunks (first N + evenly sampled)
   ├─ summary prompt → Gemini chat                            (FR-08)
   ▼
response { summary }
```

## Key parameters (config/constants)

| Param | Value | Source |
|---|---|---|
| MAX_FILE_BYTES | 10 MB | BR-02 |
| CHUNK_TOKENS | ~600 (range 300–800) | FR-03 |
| CHUNK_OVERLAP | ~80 tokens | FR-03 |
| EMBED_MODEL | text-embedding-004 (768-dim) | FR-04 |
| TOP_K | 4 | FR-06 / 4.4.2 |
| SIM_THRESHOLD | cosine distance gate for "not found" | BR-04 |
| CHAT_MODEL | gemini-2.0-flash | 4.1 |
