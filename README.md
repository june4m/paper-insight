# Paper Insight

> AI Document Q&A Chatbot using **RAG** (Retrieval-Augmented Generation) — MVP

Upload a PDF, then ask questions about it and get **grounded answers with page-level
citations**, or generate an automatic **summary**. The bot answers *only* from the
document's content (and says so when the answer isn't there), so it doesn't hallucinate.

**Stack:** Node.js + Express · Google Gemini · ChromaDB · Next.js + React + Tailwind · SQLite

---

## Features

- 📄 **Upload PDF** (≤ 10 MB) — async processing pipeline with live status (`processing` → `completed` / `failed`)
- 💬 **Ask questions** — grounded Q&A over the document with cited sources (page number + source chunk)
- 🧾 **Auto summary** — one-click document summary
- 🗂️ **Document library** — list, view, delete (cascade-deletes file, chunks, embeddings, chat history)
- 🔒 **No-hallucination guard** — returns `"Không tìm thấy thông tin này trong tài liệu."` when nothing relevant is found

## Architecture

```
┌──────────────┐      HTTP/JSON      ┌──────────────────────────────┐
│  Frontend    │ ──────────────────▶ │      Backend (Express)        │
│  Next.js +   │  /documents/upload  │  document · processing ·      │
│  React +     │  /documents         │  chunking · embedding ·       │
│  Tailwind    │  /chat/ask          │  chat · summary modules       │
│              │ ◀────────────────── │                               │
└──────────────┘   answer + sources  └───────┬──────────────────────┘
                                             │
            ┌──────────────┬─────────────────┼─────────────────┐
            ▼              ▼                  ▼                 ▼
     ┌────────────┐ ┌────────────┐   ┌──────────────┐  ┌────────────┐
     │ SQLite     │ │ Local file │   │  ChromaDB    │  │ Gemini API │
     │ (metadata) │ │ storage    │   │ (vectors)    │  │ chat+embed │
     └────────────┘ └────────────┘   └──────────────┘  └────────────┘
```

### How RAG works here

**Ingestion:** PDF → extract text per page (`pdf-parse`) → chunk (~600 tokens, 80 overlap)
→ embed each chunk with Gemini `text-embedding-004` (768-dim) → store vectors in ChromaDB,
metadata in SQLite.

**Query:** question → embed → top-`k` (k=4) nearest chunks for that document → build a
grounded prompt → Gemini `gemini-2.0-flash` answers and cites pages. If the best match is
below the similarity threshold, it returns the "not found" answer instead of guessing.

See [`docs/`](docs/) for the full design: [architecture](docs/01-architecture.md) ·
[RAG flow](docs/02-rag-flow.md) · [data model](docs/03-data-model.md) ·
[API contract](docs/04-api-contract.md).

---

## Project structure

```
pet-project/
├─ backend/                  # Node.js + Express API
│  └─ src/
│     ├─ modules/
│     │  ├─ document/        # upload, list, get, delete
│     │  ├─ processing/      # PDF extract + chunk + pipeline
│     │  ├─ vectorstore/     # ChromaDB wrapper (+ in-memory fallback)
│     │  ├─ chat/            # retrieval + prompt + answer + citations
│     │  └─ summary/         # summary prompt + Gemini call
│     ├─ ai/                 # Gemini client (chat + embeddings)
│     ├─ db/                 # SQLite connection, schema, repositories
│     ├─ config/             # env + constants
│     ├─ middleware/         # upload (multer), error handler
│     └─ routes/             # Express routers
├─ frontend/                 # Next.js (App Router) + React + Tailwind
│  ├─ app/                   # pages (home, document detail)
│  ├─ components/            # UploadForm, ChatBox, SummaryPanel, ...
│  └─ lib/api.js             # Axios API client
└─ docs/                     # design docs (WBS)
```

---

## Getting started

### Prerequisites

- **Node.js ≥ 18**
- A **Google Gemini API key** — get one free at <https://aistudio.google.com/app/apikey>
- *(Optional)* **ChromaDB** running locally. If you don't want to run it, set
  `VECTOR_BACKEND=memory` to use the built-in in-memory cosine store (dev/demo only —
  vectors are not persisted across restarts).

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env        # then edit .env and set GEMINI_API_KEY
npm run dev                  # http://localhost:4000  (nodemon)
```

Key environment variables (see [`backend/.env.example`](backend/.env.example)):

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `4000` | API port |
| `GEMINI_API_KEY` | — | **Required** Gemini key |
| `CHAT_MODEL` | `gemini-2.0-flash` | Chat completion model |
| `EMBED_MODEL` | `text-embedding-004` | Embedding model (768-dim) |
| `VECTOR_BACKEND` | `chroma` | `chroma` or `memory` |
| `CHROMA_URL` | `http://localhost:8000` | ChromaDB server URL |
| `MAX_FILE_BYTES` | `10485760` | Upload limit (10 MB) |
| `TOP_K` | `4` | Chunks retrieved per query |
| `SIM_MAX_DISTANCE` | `0.75` | Relevance gate for "not found" |

Running ChromaDB (if `VECTOR_BACKEND=chroma`), e.g. with Docker:

```bash
docker run -p 8000:8000 chromadb/chroma
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local   # NEXT_PUBLIC_API_BASE_URL defaults to backend
npm run dev                         # http://localhost:3000
```

Open <http://localhost:3000>, upload a PDF, wait for `completed`, then ask away.

---

## API

Base URL: `http://localhost:4000/api`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/documents/upload` | Upload a PDF (multipart, field `file`) |
| `GET` | `/documents` | List documents |
| `GET` | `/documents/:id` | Get one document |
| `DELETE` | `/documents/:id` | Delete document + all related data |
| `POST` | `/documents/:id/summary` | Generate a summary |
| `POST` | `/chat/ask` | Ask a question `{ document_id, question }` |
| `GET` | `/chat/:documentId/history` | Chat history for a document |

Full request/response shapes and error codes: [`docs/04-api-contract.md`](docs/04-api-contract.md).

---

## Performance targets (MVP)

| Metric | Target |
|---|---|
| PDF < 10 MB processing | 30–60 s |
| Answer latency | 5–15 s |
| Vector search | < 2 s (small data) |

---

## Notes

- This is a solo **MVP**: SQLite + local disk are chosen for zero-config setup; they can be
  swapped for Postgres / S3 later.
- Never commit your real `GEMINI_API_KEY` — `.env` is git-ignored; use `.env.example` as the template.
