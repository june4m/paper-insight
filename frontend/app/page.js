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
    if (!confirm('Delete this document and everything indexed from it?')) return;
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
    <div className="space-y-14">
      {/* Hero — the thesis: answers you can check against the page. */}
      <section className="animate-fade-up">
        <p className="eyebrow">Retrieval-grounded reading</p>
        <h1 className="mt-3 max-w-3xl font-display text-[2.6rem] font-medium leading-[1.08] tracking-tight text-ink sm:text-[3.25rem]">
          Ask a paper anything.{' '}
          <span className="marker-underline italic">Check every word</span> against
          the page it came from.
        </h1>
        <p className="mt-4 max-w-xl font-display text-lg leading-relaxed text-ink-soft">
          Drop in a PDF. Paper Insight reads it, answers your questions from its own
          text, and footnotes each reply to the exact passage — nothing invented,
          nothing unsourced.
        </p>
      </section>

      {/* Intake */}
      <section className="animate-fade-up [animation-delay:60ms]">
        <div className="mb-4 flex items-baseline gap-3">
          <span className="font-mono text-sm text-prussian-500">01</span>
          <h2 className="font-display text-xl font-medium text-ink">Add a document</h2>
        </div>
        <UploadForm onUploaded={refresh} />
      </section>

      {/* Catalog */}
      <section className="animate-fade-up [animation-delay:120ms]">
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-sm text-prussian-500">02</span>
            <h2 className="font-display text-xl font-medium text-ink">Your library</h2>
            {documents.length > 0 && (
              <span className="font-mono text-xs text-ink-faint">
                {documents.length} {documents.length === 1 ? 'entry' : 'entries'}
              </span>
            )}
          </div>
          <button
            onClick={refresh}
            className="font-mono text-xs uppercase tracking-wide text-prussian-500 transition hover:text-prussian-700"
          >
            Refresh
          </button>
        </div>

        {error && (
          <p className="mb-4 border-l-2 border-red-400 bg-red-50/70 px-4 py-2.5 text-sm text-red-800">
            {error}
          </p>
        )}

        {loading ? (
          <p className="font-mono text-sm text-ink-faint">Reading the shelf…</p>
        ) : documents.length === 0 ? (
          <div className="border border-dashed border-rule bg-surface/60 px-6 py-12 text-center">
            <p className="font-display text-lg italic text-ink-soft">The shelf is empty.</p>
            <p className="mt-1 text-sm text-ink-faint">
              Your first upload will be catalogued here.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-rule border-y border-rule">
            {documents.map((doc, i) => {
              const ready = doc.processing_status === 'completed';
              return (
                <li
                  key={doc.id}
                  className="group flex items-center gap-4 py-4 transition-colors hover:bg-surface/70"
                >
                  <span className="w-8 shrink-0 text-center font-mono text-xs text-ink-faint">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="truncate font-display text-lg leading-snug text-ink">
                        {doc.file_name}
                      </span>
                      <StatusBadge status={doc.processing_status} />
                    </div>
                    <div className="mt-1 font-mono text-xs text-ink-faint">
                      {formatBytes(doc.file_size)}
                      {doc.page_count ? ` · ${doc.page_count} pp` : ''}
                      {doc.processing_status === 'failed' && doc.error_message
                        ? ` · ${doc.error_message}`
                        : ''}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {ready ? (
                      <Link
                        href={`/documents/${doc.id}`}
                        className="rounded-sm bg-prussian-500 px-3.5 py-1.5 text-sm font-medium text-paper transition hover:bg-prussian-600"
                      >
                        Open
                      </Link>
                    ) : (
                      <span className="rounded-sm border border-rule px-3.5 py-1.5 text-sm text-ink-faint">
                        Open
                      </span>
                    )}
                    <button
                      onClick={() => handleDelete(doc.id)}
                      disabled={deletingId === doc.id}
                      className="rounded-sm px-2.5 py-1.5 text-sm text-ink-faint transition hover:text-red-700 disabled:opacity-50"
                      aria-label={`Delete ${doc.file_name}`}
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
