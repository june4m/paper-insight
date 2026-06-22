'use client';

import { useState } from 'react';

/** Renders one source citation as a footnote / index card (FR-07 / WBS 3.4.4). */
export default function SourceChunk({ source, index }) {
  const [open, setOpen] = useState(false);
  const long = source.content.length > 160;
  const preview = long && !open ? `${source.content.slice(0, 160)}…` : source.content;

  return (
    <div className="group relative flex gap-3 border-l-2 border-highlight bg-surface/80 py-2 pl-3 pr-3">
      {/* Footnote marker — the number you'd see in superscript, given room to breathe. */}
      <span className="mt-0.5 font-mono text-xs font-semibold text-prussian-500">
        {index + 1}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-wide text-ink-faint">
          <span className="truncate text-ink-soft">{source.document_name}</span>
          {source.page_number != null && (
            <span className="shrink-0 rounded-sm bg-prussian-50 px-1.5 py-px text-prussian-600">
              p. {source.page_number}
            </span>
          )}
        </div>

        <p className="mt-1 whitespace-pre-wrap font-display text-[0.92rem] leading-relaxed text-ink-soft">
          {preview}
        </p>

        {long && (
          <button
            onClick={() => setOpen((o) => !o)}
            className="mt-1 font-mono text-[0.68rem] uppercase tracking-wide text-prussian-500 transition hover:text-prussian-700"
          >
            {open ? 'Less' : 'Read passage'}
          </button>
        )}
      </div>
    </div>
  );
}
