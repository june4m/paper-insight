'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

export default function SummaryPanel({ documentId }) {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function generate() {
    setLoading(true);
    setError('');
    try {
      const res = await api.summarize(documentId);
      setSummary(res.summary);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-sm border border-rule bg-surface p-5 shadow-card">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-display text-lg font-medium text-ink">Abstract</h3>
        <button
          onClick={generate}
          disabled={loading}
          className="font-mono text-xs uppercase tracking-wide text-prussian-500 transition hover:text-prussian-700 disabled:opacity-50"
        >
          {loading ? 'Writing…' : summary ? 'Rewrite' : 'Generate'}
        </button>
      </div>

      <div className="mt-2 h-px bg-rule" />

      {error && (
        <p className="mt-3 border-l-2 border-red-400 bg-red-50/70 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}

      {summary ? (
        <p className="mt-3 whitespace-pre-wrap font-display text-[0.95rem] leading-relaxed text-ink-soft">
          {summary}
        </p>
      ) : (
        !error && (
          <p className="mt-3 text-sm leading-relaxed text-ink-faint">
            A short, AI-written overview of the whole document — useful before you
            start asking specific questions.
          </p>
        )
      )}
    </div>
  );
}
