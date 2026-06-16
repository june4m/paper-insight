'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { api, formatBytes } from '@/lib/api';
import UploadForm from '@/components/UploadForm';
import StatusBadge from '@/components/StatusBadge';

export default function HomePage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const pollRef = useRef(null);

  const refresh = useCallback(async () => {
    try {
      const docs = await api.listDocuments();
      setDocuments(docs);
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Poll while any document is still processing (WBS 3.3.2).
  useEffect(() => {
    const anyProcessing = documents.some((d) => d.processing_status === 'processing');
    if (anyProcessing && !pollRef.current) {
      pollRef.current = setInterval(refresh, 2500);
    } else if (!anyProcessing && pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    return () => {
      if (pollRef.current && !anyProcessing) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [documents, refresh]);

  async function handleDelete(id) {
    if (!confirm('Delete this document and all its data?')) return;
    setDeletingId(id);
    try {
      await api.deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (e) {
      setError(e.message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-bold text-slate-900">Upload a document</h1>
        <p className="mt-1 text-sm text-slate-500">
          Upload a PDF, wait for processing, then ask questions grounded in its content.
        </p>
        <div className="mt-4">
          <UploadForm onUploaded={refresh} />
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Your documents</h2>
          <button
            onClick={refresh}
            className="text-sm text-brand-600 hover:text-brand-700"
          >
            ↻ Refresh
          </button>
        </div>

        {error && (
          <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-sm text-slate-400">Loading…</p>
        ) : documents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-400">
            No documents yet. Upload your first PDF above.
          </div>
        ) : (
          <ul className="space-y-2">
            {documents.map((doc) => {
              const ready = doc.processing_status === 'completed';
              return (
                <li
                  key={doc.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium text-slate-800">{doc.file_name}</span>
                      <StatusBadge status={doc.processing_status} />
                    </div>
                    <div className="mt-0.5 text-xs text-slate-400">
                      {formatBytes(doc.file_size)}
                      {doc.page_count ? ` · ${doc.page_count} pages` : ''}
                      {doc.processing_status === 'failed' && doc.error_message
                        ? ` · ${doc.error_message}`
                        : ''}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {ready ? (
                      <Link
                        href={`/documents/${doc.id}`}
                        className="rounded-lg bg-brand-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-600"
                      >
                        Open
                      </Link>
                    ) : (
                      <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm text-slate-400">
                        Open
                      </span>
                    )}
                    <button
                      onClick={() => handleDelete(doc.id)}
                      disabled={deletingId === doc.id}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                    >
                      {deletingId === doc.id ? '…' : 'Delete'}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
