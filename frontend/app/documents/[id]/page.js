'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api, formatBytes } from '@/lib/api';
import StatusBadge from '@/components/StatusBadge';
import ChatBox from '@/components/ChatBox';
import SummaryPanel from '@/components/SummaryPanel';

export default function DocumentDetailPage() {
  const { id } = useParams();
  const [doc, setDoc] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api
      .getDocument(id)
      .then((d) => active && setDoc(d))
      .catch((e) => active && setError(e.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) return <p className="font-mono text-sm text-ink-faint">Opening document…</p>;

  if (error || !doc) {
    return (
      <div className="space-y-5">
        <p className="border-l-2 border-red-400 bg-red-50/70 px-4 py-2.5 text-sm text-red-800">
          {error || 'That document could not be found.'}
        </p>
        <Link
          href="/"
          className="font-mono text-xs uppercase tracking-wide text-prussian-500 transition hover:text-prussian-700"
        >
          ← Back to library
        </Link>
      </div>
    );
  }

  const ready = doc.processing_status === 'completed';

  return (
    <div className="space-y-8">
      <div className="animate-fade-up">
        <Link
          href="/"
          className="font-mono text-xs uppercase tracking-wide text-prussian-500 transition hover:text-prussian-700"
        >
          ← Library
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-[2rem] font-medium leading-tight tracking-tight text-ink">
            {doc.file_name}
          </h1>
          <StatusBadge status={doc.processing_status} />
        </div>
        <p className="mt-1.5 font-mono text-xs text-ink-faint">
          {formatBytes(doc.file_size)}
          {doc.page_count ? ` · ${doc.page_count} pages` : ''}
        </p>
      </div>

      {!ready ? (
        <div className="border border-dashed border-rule bg-surface/60 px-6 py-12 text-center">
          {doc.processing_status === 'processing' ? (
            <>
              <p className="font-display text-lg italic text-ink-soft">
                Still reading this one.
              </p>
              <p className="mt-1 text-sm text-ink-faint">
                Questions open up the moment it finishes processing.
              </p>
            </>
          ) : (
            <>
              <p className="font-display text-lg italic text-red-800">Processing failed.</p>
              {doc.error_message && (
                <p className="mt-1 font-mono text-xs text-ink-faint">{doc.error_message}</p>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="grid gap-7 lg:grid-cols-3">
          <div className="animate-fade-up lg:col-span-2">
            <p className="eyebrow mb-3">The conversation</p>
            <ChatBox documentId={doc.id} />
          </div>
          {/* Marginalia: the abstract sits in the margin, like notes beside the text. */}
          <aside className="animate-fade-up [animation-delay:80ms] lg:col-span-1">
            <p className="eyebrow mb-3">In the margin</p>
            <SummaryPanel documentId={doc.id} />
          </aside>
        </div>
      )}
    </div>
  );
}
