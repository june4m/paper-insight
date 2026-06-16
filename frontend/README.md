# Paper Insight – Frontend

Next.js (App Router) + React + Tailwind + Axios. Implements WBS phase 3.0.

## Setup

```bash
cd frontend
npm install
cp .env.local.example .env.local   # set NEXT_PUBLIC_API_BASE_URL if backend isn't on :4000
```

## Run

```bash
npm run dev     # http://localhost:3000  (backend must be running on :4000)
npm run build && npm start
```

## Pages

| Route | Purpose | WBS |
|---|---|---|
| `/` | Upload PDF + document list (status, delete) | 3.2, 3.3 |
| `/documents/[id]` | Chatbot Q&A with citations + summary | 3.4, 3.5 |

## Components

- `UploadForm` — drag/drop + click upload, client-side PDF/size validation, progress bar
- `StatusBadge` — processing / completed / failed
- `ChatBox` — question input, answer bubbles, loads chat history, renders sources
- `SourceChunk` — one citation (document name, page, expandable content)
- `SummaryPanel` — generate/regenerate AI summary
- `lib/api.js` — Axios client wrapping all backend endpoints

The document list auto-polls every 2.5s while any document is still processing,
so the status flips to **Completed** without a manual refresh.
