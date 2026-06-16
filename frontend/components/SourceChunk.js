'use client';

import { useState } from 'react';

/** Renders one source citation (FR-07 / WBS 3.4.4). */
export default function SourceChunk({ source, index }) {
  const [open, setOpen] = useState(false);
  const preview =
    source.content.length > 160 && !open ? `${source.content.slice(0, 160)}…` : source.content;

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
      <div className="mb-1 flex items-center gap-2 font-medium text-slate-500">
        <span className="rounded bg-brand-100 px-1.5 py-0.5 text-brand-700">#{index + 1}</span>
        <span className="truncate">{source.document_name}</span>
        {source.page_number != null && (
          <span className="text-slate-400">· page {source.page_number}</span>
        )}
      </div>
      <p className="whitespace-pre-wrap text-slate-600">{preview}</p>
      {source.content.length > 160 && (
        <button
          onClick={() => setOpen((o) => !o)}
          className="mt-1 text-brand-600 hover:text-brand-700"
        >
          {open ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  );
}
