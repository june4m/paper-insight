# 03 – Data Model (WBS 1.4)

Relational metadata lives in **SQLite**. Embedding vectors live in **ChromaDB**
(the `Embedding` entity from the spec is represented by Chroma records, not a
SQLite table). Mapping of spec entities → storage is noted per table.

## documents  (spec: Document — FR-09, §9)

| Column | Type | Notes |
|---|---|---|
| id | TEXT PK | UUID |
| file_name | TEXT | original name |
| file_type | TEXT | always `application/pdf` in MVP |
| file_size | INTEGER | bytes |
| storage_path | TEXT | `storage/<id>.pdf` |
| processing_status | TEXT | `processing` \| `completed` \| `failed` (BR-03, NFR-03) |
| error_message | TEXT NULL | set when status = failed |
| page_count | INTEGER NULL | filled after extraction |
| created_at | TEXT | ISO timestamp |
| updated_at | TEXT | ISO timestamp |

## document_chunks  (spec: DocumentChunk — FR-03, §9)

| Column | Type | Notes |
|---|---|---|
| id | TEXT PK | UUID = Chroma record id |
| document_id | TEXT FK → documents.id | ON DELETE CASCADE |
| chunk_index | INTEGER | order within document |
| content | TEXT | chunk text |
| page_number | INTEGER NULL | source page |
| token_count | INTEGER | approx tokens |
| created_at | TEXT | ISO timestamp |

## chat_messages  (spec: ChatMessage — §9)

| Column | Type | Notes |
|---|---|---|
| id | TEXT PK | UUID |
| document_id | TEXT FK → documents.id | ON DELETE CASCADE |
| question | TEXT | user question |
| answer | TEXT | AI answer |
| sources | TEXT (JSON) | serialized array of source chunks |
| created_at | TEXT | ISO timestamp |

## Embedding (spec entity) → ChromaDB record

Stored in Chroma, not SQLite:

```
collection: "paper_insight_chunks"
  id:        <chunkId>            // == document_chunks.id
  embedding: <768-dim vector>     // Gemini text-embedding-004
  document:  <chunk content>      // for convenience on retrieval
  metadata:  {
    documentId,
    chunkIndex,
    pageNumber,
    modelName: "text-embedding-004"
  }
```

## Delete cascade (BR-05, FR-10, AC-07)

Deleting a document must remove: the stored PDF file, the `documents` row,
its `document_chunks` rows (SQLite cascade), its `chat_messages` rows
(SQLite cascade), and all Chroma records where `metadata.documentId == id`.

## Status state machine (NFR-03)

```
processing ──(extract+chunk+embed+store ok)──▶ completed
     │
     └────────(extract/embed/store error)────▶ failed (error_message set)
```
Q&A and summary are only allowed from the `completed` state (BR-03).
