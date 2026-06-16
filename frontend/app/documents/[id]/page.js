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

  if (loading) return <p className="text-sm text-slate-400">Loading…</p>;

  if (error || !doc) {
    return (
      <div className="space-y-4">
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error || 'Document not found.'}
        </p>
        <Link href="/" className="text-sm text-brand-600 hover:text-brand-700">
          ← Back to documents
        </Link>
      </div>
    );
  }

  const ready = doc.processing_status === 'completed';

  return (
    <div className="space-y-6">
      <div>
        <Link href="/" className="text-sm text-brand-600 hover:text-brand-700">
          ← Back to documents
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900">{doc.file_name}</h1>
          <StatusBadge status={doc.processing_status} />
        </div>
        <p className="mt-1 text-sm text-slate-400">
          {formatBytes(doc.file_size)}
          {doc.page_count ? ` · ${doc.page_count} pages` : ''}
        </p>
      </div>

      {!ready ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-500">
          {doc.processing_status === 'processing'
            ? 'This document is still being processed. Q&A becomes available once it is completed.'
            : `Processing failed${doc.error_message ? `: ${doc.error_message}` : ''}.`}
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="mb-2 text-lg font-semibold text-slate-900">Ask questions</h2>
            <ChatBox documentId={doc.id} />
          </div>
          <div className="lg:col-span-1">
            <SummaryPanel documentId={doc.id} />
          </div>
        </div>
      )}
    </div>
  );
}
