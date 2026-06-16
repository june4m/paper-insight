# 01 – System Architecture (WBS 1.3)

> Paper Insight – AI Document Q&A Chatbot using RAG (MVP)
> Stack decided for this build: **Node.js + Express · Google Gemini · ChromaDB · Next.js**

## 1.3.1 Overall Architecture

```
┌──────────────┐        HTTP/JSON        ┌───────────────────────────────┐
│              │  ───────────────────▶   │        Backend (Express)       │
│  Frontend    │                         │                               │
│  Next.js +   │   POST /documents/upload│  ┌─────────────────────────┐  │
│  React +     │   GET  /documents       │  │ document module         │  │
│  Tailwind    │   DELETE /documents/:id │  │ processing module       │  │
│              │   POST /chat/ask        │  │ chunking (in processing)│  │
│              │   POST /documents/:id/  │  │ embedding module        │  │
│              │        summary          │  │ chat module             │  │
│              │ ◀───────────────────    │  │ summary module          │  │
└──────────────┘        answer+sources   │  └───────────┬─────────────┘  │
                                          └──────────────┼────────────────┘
                                                         │
                    ┌────────────────────────────────────┼───────────────────────┐
                    │                    │                │                       │
                    ▼                    ▼                ▼                       ▼
            ┌──────────────┐   ┌──────────────┐   ┌──────────────┐      ┌──────────────┐
            │ Metadata DB  │   │  Local file  │   │   ChromaDB   │      │  Gemini API  │
            │ (SQLite for  │   │   storage    │   │ (vector DB,  │      │ chat +       │
            │  MVP)        │   │ backend/     │   │ persisted    │      │ embeddings   │
            │ documents,   │   │ storage/)    │   │ on disk)     │      │              │
            │ chunks,      │   └──────────────┘   └──────────────┘      └──────────────┘
            │ chat_msgs    │
            └──────────────┘
```

### Components

| Component | Responsibility | Technology |
|---|---|---|
| Frontend | Upload UI, document list, chat UI, summary UI | Next.js (App Router), React, Tailwind, Axios |
| Backend API | REST endpoints, orchestration, business rules | Node.js + Express |
| Metadata DB | Documents, chunks, chat messages | SQLite (via better-sqlite3) — zero-config for solo MVP |
| File Storage | Original PDF bytes | Local disk (`backend/storage/`); swappable to S3 later |
| Vector DB | Embedding vectors + chunk metadata, similarity search | ChromaDB (local persistent client) |
| AI Provider | Chat completion + text embeddings | Google Gemini API |

> **Note on metadata DB:** The spec lists "PostgreSQL + pgvector / ChromaDB" as the *vector* store. We chose ChromaDB for vectors. For the relational metadata (Document / DocumentChunk / ChatMessage entities) the spec stays open, so for a solo MVP we use **SQLite** — no server to run, file-based, trivial to reset. This keeps the demo to a single `npm run dev` with no external DB process.

## 1.3.2 Tech Stack Selection (decisions)

| Layer | Chosen | Why |
|---|---|---|
| Frontend | Next.js + React + Tailwind | Spec-suggested; fast UI, same language as backend |
| Backend | Node.js + Express | Lightest path for a solo MVP; shared JS with frontend |
| AI model | Gemini `gemini-2.0-flash` | Free tier, fast, good enough for grounded Q&A/summary |
| Embeddings | Gemini `text-embedding-004` (768-dim) | Same provider, one API key |
| Vector DB | ChromaDB | Spec calls it best for small scope; easiest demo |
| Metadata DB | SQLite | Zero-config, file-based; satisfies entity storage |
| Storage | Local disk | MVP scope; S3 is out of scope |

## 1.3.3 RAG Data Flow

See [02-rag-flow.md](02-rag-flow.md).

## Module boundaries (NFR-04 Maintainability)

```
backend/src/
  modules/
    document/     # upload, list, get, delete, metadata persistence
    processing/   # PDF text extraction + chunking, status transitions
    embedding/    # Gemini embedding calls, batch logic
    vectorstore/  # ChromaDB wrapper (insert, query, delete by document)
    chat/         # retrieval + prompt + Gemini answer + citations
    summary/      # summary prompt + Gemini call
  ai/             # Gemini client wrapper (chat + embed)
  db/             # SQLite connection + schema + repositories
  config/         # env loading, constants (file size, chunk size, top-k)
  middleware/     # upload (multer), error handler, validation
  routes/         # express routers mapping to module controllers
```

## Non-functional targets (NFR-01)

| Metric | Target |
|---|---|
| PDF < 10 MB processing | 30–60 s |
| Answer latency | 5–15 s |
| Vector search | < 2 s (small data) |
