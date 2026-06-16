# Paper Insight – AI Document Q&A Chatbot using RAG

## 1. Project Overview

**Paper Insight** is an MVP web application that allows a user to upload a PDF document and ask questions based on the document content.

The system uses **RAG (Retrieval-Augmented Generation)**. Instead of letting the AI answer only from its general knowledge, the system retrieves relevant chunks from the uploaded document and sends them to the AI model to generate a grounded answer with source citations.

## 2. MVP Goal

The goal of this MVP is to build a small but complete AI Document Q&A system that demonstrates the full RAG flow:

```text
Upload PDF
→ Extract text
→ Chunk document
→ Generate embeddings
→ Store vectors
→ Retrieve relevant chunks
→ Generate AI answer
→ Show source citations
```

## 3. Solo Project Note

This project is developed as a **solo project**.  
Therefore, all responsibilities such as requirement analysis, UI design, frontend development, backend development, AI integration, testing, and deployment are handled by one person.

## 4. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js / React |
| Backend | Node.js / Spring Boot |
| AI Model | OpenAI / Gemini |
| Embedding Model | OpenAI Embedding / Gemini Embedding |
| Vector Database | ChromaDB / PostgreSQL + pgvector |
| Storage | Local Storage / AWS S3 |
| Deployment | EC2 Ubuntu / Vercel / Docker / Nginx |

## 5. Main Modules

| Module | Description |
|---|---|
| Document Management | Upload, list, view, and delete PDF documents |
| Text Processing | Extract text from PDF and prepare content for chunking |
| Chunking | Split document content into smaller text chunks |
| Embedding | Convert text chunks into vector embeddings |
| Vector Storage | Store and search document vectors |
| Chatbot Q&A | Ask questions and generate AI answers from retrieved chunks |
| Citation Display | Show related source chunks and page numbers |
| Summary | Generate a basic summary of the uploaded document |

## 6. MVP Scope

### In Scope

- Upload PDF document
- Validate PDF file type and file size
- Extract text from PDF
- Split text into chunks
- Generate embeddings
- Store vectors in vector database
- Ask questions based on one document
- Retrieve relevant chunks
- Generate AI answer using OpenAI/Gemini
- Show source citations
- View uploaded documents
- Delete document and related data
- Generate basic document summary

### Out of Scope

- OCR for scanned PDFs
- DOCX/TXT support
- Multi-user permission system
- Admin dashboard
- Payment or subscription
- Fine-tuning custom AI model
- Real-time collaboration
- Multi-document Q&A in one question

## 7. Work Breakdown Structure (WBS)

## 1.0 Planning

| WBS ID | Level | Task | Description / Deliverable |
|---|---:|---|---|
| 1.0 | 1 | Planning | Define MVP scope, requirements, architecture, and implementation plan |
| 1.1 | 2 | Define MVP Scope | Finalize core features for the first version |
| 1.1.1 | 3 | Define main system flow | Upload PDF → Extract text → Chunking → Embedding → Vector DB → AI answer |
| 1.1.2 | 3 | Define must-have features | Upload PDF, process document, ask questions, show citations |
| 1.1.3 | 3 | Define out-of-scope features | OCR, payment, advanced roles, fine-tuning, multi-document chat |
| 1.2 | 2 | Analyze Requirements | Define functional and non-functional requirements |
| 1.2.1 | 3 | Write functional requirements | Document management, processing, embedding, chatbot, summary |
| 1.2.2 | 3 | Write non-functional requirements | Performance, security, simple UI |
| 1.2.3 | 3 | Write business rules | PDF only, file size limit, completed status required before Q&A |
| 1.3 | 2 | Design System Architecture | Define main components and interactions |
| 1.3.1 | 3 | Design overall architecture | Frontend, backend, AI API, vector DB, storage |
| 1.3.2 | 3 | Select tech stack | Next.js/React, Node.js/Spring Boot, OpenAI/Gemini, ChromaDB/pgvector |
| 1.3.3 | 3 | Design RAG data flow | Define data movement from upload to final AI answer |
| 1.4 | 2 | Design Data Model | Define required entities |
| 1.4.1 | 3 | Design Document entity | file_name, file_size, status, storage_path, created_at |
| 1.4.2 | 3 | Design DocumentChunk entity | chunk_index, content, page_number, token_count |
| 1.4.3 | 3 | Design ChatMessage entity | question, answer, sources, created_at |

## 2.0 Backend Development

| WBS ID | Level | Task | Description / Deliverable |
|---|---:|---|---|
| 2.0 | 1 | Backend Development | Build API server and backend business logic |
| 2.1 | 2 | Setup Backend Project | Initialize backend project and environment |
| 2.1.1 | 3 | Initialize backend project | Create Node.js/Express or Spring Boot project |
| 2.1.2 | 3 | Configure project structure | Separate document, processing, embedding, chat, and summary modules |
| 2.1.3 | 3 | Configure environment variables | Create `.env` for API keys, DB URL, and storage path |
| 2.2 | 2 | Document Management Module | Handle upload, list, and delete document features |
| 2.2.1 | 3 | Create upload PDF API | Endpoint: `POST /api/documents/upload` |
| 2.2.2 | 3 | Validate uploaded file | Check PDF file type and file size |
| 2.2.3 | 3 | Store PDF file | Save file to local storage or cloud storage |
| 2.2.4 | 3 | Store document metadata | Save document information to database |
| 2.2.5 | 3 | Create document list API | Endpoint: `GET /api/documents` |
| 2.2.6 | 3 | Create delete document API | Delete document, chunks, and embeddings |
| 2.3 | 2 | Text Processing Module | Extract and prepare text from PDF |
| 2.3.1 | 3 | Integrate PDF parser | Use pdf-parse or equivalent library |
| 2.3.2 | 3 | Implement text extraction | Extract plain text from uploaded PDF |
| 2.3.3 | 3 | Handle page numbers | Attach page number metadata if available |
| 2.3.4 | 3 | Handle extraction errors | Mark document as failed if PDF cannot be read |
| 2.4 | 2 | Chunking Module | Split document text into smaller chunks |
| 2.4.1 | 3 | Implement chunking logic | Split text into chunks of around 300–800 tokens |
| 2.4.2 | 3 | Add chunk overlap | Keep context between chunks |
| 2.4.3 | 3 | Store chunks | Save content, page_number, and chunk_index |
| 2.5 | 2 | Summary Module | Generate basic document summary |
| 2.5.1 | 3 | Create summary API | Endpoint: `POST /api/documents/{id}/summary` |
| 2.5.2 | 3 | Design summary prompt | Create prompt for short and clear summary |
| 2.5.3 | 3 | Call AI model for summary | Use OpenAI/Gemini to generate summary |

## 3.0 Frontend Development

| WBS ID | Level | Task | Description / Deliverable |
|---|---:|---|---|
| 3.0 | 1 | Frontend Development | Build simple user interface for MVP |
| 3.1 | 2 | Setup Frontend Project | Initialize web client |
| 3.1.1 | 3 | Initialize Next.js/React project | Create frontend project |
| 3.1.2 | 3 | Configure routing | Create routes for upload, document detail, and chat |
| 3.1.3 | 3 | Configure API client | Setup Axios/fetch client for backend API |
| 3.2 | 2 | Upload UI | Allow user to upload PDF document |
| 3.2.1 | 3 | Create upload component | File input for PDF upload |
| 3.2.2 | 3 | Show validation errors | Display error for invalid file type or file size |
| 3.2.3 | 3 | Show upload/processing status | Display loading and processing state |
| 3.3 | 2 | Document List UI | Display uploaded documents |
| 3.3.1 | 3 | Integrate document list API | Call `GET /api/documents` |
| 3.3.2 | 3 | Show processing status | Display processing, completed, and failed |
| 3.3.3 | 3 | Add delete action | Call delete document API |
| 3.4 | 2 | Chatbot UI | Allow user to ask questions |
| 3.4.1 | 3 | Design chat box | Input question and display conversation |
| 3.4.2 | 3 | Integrate ask API | Call `POST /api/chat/ask` |
| 3.4.3 | 3 | Display AI answer | Render answer from backend |
| 3.4.4 | 3 | Display source chunks | Show related text chunks and page numbers |
| 3.5 | 2 | Summary UI | Allow user to summarize document |
| 3.5.1 | 3 | Add summarize button | Button to generate document summary |
| 3.5.2 | 3 | Integrate summary API | Call summary endpoint |
| 3.5.3 | 3 | Display summary result | Render generated summary |

## 4.0 RAG Pipeline Integration

| WBS ID | Level | Task | Description / Deliverable |
|---|---:|---|---|
| 4.0 | 1 | RAG Pipeline Integration | Build complete Retrieval-Augmented Generation pipeline |
| 4.1 | 2 | AI Service Configuration | Connect OpenAI/Gemini service |
| 4.1.1 | 3 | Configure API key | Store API key in environment variables |
| 4.1.2 | 3 | Create AI service wrapper | Function for chat model and embedding model |
| 4.1.3 | 3 | Handle AI API errors | Add error handling and clear response messages |
| 4.2 | 2 | Vector Database Configuration | Store and search vector embeddings |
| 4.2.1 | 3 | Setup ChromaDB or pgvector | Install and configure vector database |
| 4.2.2 | 3 | Design vector collection/table | Store document_id, chunk_id, content, vector, metadata |
| 4.2.3 | 3 | Test vector insert | Verify embedding can be stored |
| 4.3 | 2 | Document Embedding | Convert text chunks into vector embeddings |
| 4.3.1 | 3 | Call embedding model for each chunk | Generate vector from chunk content |
| 4.3.2 | 3 | Implement batch embedding | Optimize processing for many chunks |
| 4.3.3 | 3 | Store embedding with metadata | Save page_number, document_id, and chunk_index |
| 4.4 | 2 | Retrieval Logic | Find relevant chunks for a question |
| 4.4.1 | 3 | Generate question embedding | Convert user question into vector |
| 4.4.2 | 3 | Search top-k chunks | Retrieve top 3–5 most similar chunks |
| 4.4.3 | 3 | Filter by document_id | Search only inside the selected document |
| 4.5 | 2 | Prompt Engineering | Create prompt for grounded AI answer |
| 4.5.1 | 3 | Create Q&A prompt template | Include context, question, and instructions |
| 4.5.2 | 3 | Add anti-hallucination rule | Reply “Không tìm thấy trong tài liệu” if context is insufficient |
| 4.5.3 | 3 | Optimize answer format | Make answer short, clear, and easy to read |
| 4.6 | 2 | Chatbot Q&A API | Build main Q&A endpoint |
| 4.6.1 | 3 | Create ask API | Endpoint: `POST /api/chat/ask` |
| 4.6.2 | 3 | Integrate retrieval into chat API | Retrieve chunks before calling AI |
| 4.6.3 | 3 | Return answer and sources | Response includes answer and citations |
| 4.7 | 2 | Citation Logic | Display source references |
| 4.7.1 | 3 | Attach source chunks to answer | Return related text chunks |
| 4.7.2 | 3 | Show page number if available | Include page number metadata |
| 4.7.3 | 3 | Standardize citation format | Document name, page, chunk content |

## 5.0 Testing

| WBS ID | Level | Task | Description / Deliverable |
|---|---:|---|---|
| 5.0 | 1 | Testing | Test functionality, performance, security, and UI |
| 5.1 | 2 | Unit Testing | Test backend modules |
| 5.1.1 | 3 | Test upload validation | Valid PDF, wrong format, file too large |
| 5.1.2 | 3 | Test text extraction | PDF with text, invalid PDF, empty PDF |
| 5.1.3 | 3 | Test chunking logic | Check chunk size and overlap |
| 5.1.4 | 3 | Test embedding service | Check embedding generation and error handling |
| 5.2 | 2 | Integration Testing | Test end-to-end flow |
| 5.2.1 | 3 | Test upload to processing | Upload PDF and check completed status |
| 5.2.2 | 3 | Test processing to vector DB | Verify chunks and embeddings are stored |
| 5.2.3 | 3 | Test question to answer | Ask a question and receive answer from AI |
| 5.2.4 | 3 | Test answer with citation | Verify response includes source chunks |
| 5.3 | 2 | Performance Testing | Check MVP performance targets |
| 5.3.1 | 3 | Test PDF processing time | Target: PDF under 10MB processed under 60 seconds |
| 5.3.2 | 3 | Test answer response time | Target: answer returned within 5–15 seconds |
| 5.3.3 | 3 | Test vector search time | Target: vector search under 2 seconds for small data |
| 5.4 | 2 | Security Testing | Check basic security requirements |
| 5.4.1 | 3 | Check API key exposure | Ensure keys are not hard-coded in source code |
| 5.4.2 | 3 | Test input validation | Block invalid file and empty question |
| 5.4.3 | 3 | Test file size limit | Reject files larger than allowed size |
| 5.5 | 2 | UI Testing | Test user interface flow |
| 5.5.1 | 3 | Test upload flow | Upload UI is simple and shows loading |
| 5.5.2 | 3 | Test Q&A flow | Chat UI works clearly |
| 5.5.3 | 3 | Test error display | Processing, completed, and failed states display correctly |

## 6.0 Deployment

| WBS ID | Level | Task | Description / Deliverable |
|---|---:|---|---|
| 6.0 | 1 | Deployment | Deploy MVP to a runnable environment |
| 6.1 | 2 | Prepare Deployment Environment | Setup server and production configuration |
| 6.1.1 | 3 | Prepare EC2/VPS/local server | Ubuntu server for backend deployment |
| 6.1.2 | 3 | Install runtime | Install Node.js or Java runtime |
| 6.1.3 | 3 | Configure production environment variables | AI API key, DB URL, storage path |
| 6.2 | 2 | Deploy Backend | Publish backend service |
| 6.2.1 | 3 | Build backend project | Install dependencies and build project |
| 6.2.2 | 3 | Run backend with PM2/Docker | Keep backend service running |
| 6.2.3 | 3 | Configure Nginx reverse proxy | Expose API through HTTP/HTTPS |
| 6.3 | 2 | Deploy Frontend | Publish web application |
| 6.3.1 | 3 | Build Next.js/React app | Create production build |
| 6.3.2 | 3 | Configure frontend API base URL | Point frontend to backend API |
| 6.3.3 | 3 | Deploy frontend | Deploy to Vercel, Netlify, or EC2 |
| 6.4 | 2 | Configure Database and Vector DB | Prepare metadata DB and vector storage |
| 6.4.1 | 3 | Configure metadata database | Create Document, Chunk, ChatMessage tables/collections |
| 6.4.2 | 3 | Configure vector database | Initialize ChromaDB collection or pgvector table |
| 6.4.3 | 3 | Verify production connections | Backend connects to DB and vector DB |
| 6.5 | 2 | Post-deployment Testing | Verify production system |
| 6.5.1 | 3 | Test PDF upload in production | Upload real PDF and check processing |
| 6.5.2 | 3 | Test Q&A in production | Ask question and check answer |
| 6.5.3 | 3 | Test citation in production | Verify source chunks and page numbers |
| 6.5.4 | 3 | Check runtime logs | Review backend, Nginx, and AI API logs |

## 8. Summary by Phase

| Phase | Main Goal |
|---|---|
| Planning | Define MVP scope, requirements, architecture, and data model |
| Backend Development | Build APIs, document processing, summary, and backend logic |
| Frontend Development | Build upload UI, document list, chatbot UI, and summary UI |
| RAG Pipeline Integration | Integrate embedding, vector search, prompt, answer generation, and citation |
| Testing | Validate functionality, performance, security, and UI |
| Deployment | Deploy backend, frontend, database, vector DB, and verify production flow |

## 9. Solo Responsibility Summary

Because this is a solo project, all work items are owned by the project developer.

| Area | Owner |
|---|---|
| Requirement Analysis | Solo Developer |
| UI/UX Design | Solo Developer |
| Frontend Development | Solo Developer |
| Backend Development | Solo Developer |
| AI/RAG Integration | Solo Developer |
| Testing | Solo Developer |
| Deployment | Solo Developer |
| Documentation | Solo Developer |
