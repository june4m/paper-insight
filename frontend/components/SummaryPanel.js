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
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">Summary</h3>
        <button
          onClick={generate}
          disabled={loading}
          className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {loading ? 'Summarizing…' : summary ? 'Regenerate' : 'Summarize'}
        </button>
      </div>

      {error && (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {summary ? (
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{summary}</p>
      ) : (
        !error && (
          <p className="mt-3 text-sm text-slate-400">
            Generate a short, AI-written summary of this document.
          </p>
        )
      )}
    </div>
  );
}
