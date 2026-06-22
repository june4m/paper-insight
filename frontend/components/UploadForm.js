'use client';

import { useRef, useState } from 'react';
import { api, formatBytes } from '@/lib/api';

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB (BR-02)

export default function UploadForm({ onUploaded }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  function validate(file) {
    // Client-side mirror of BR-01 / BR-02 for instant feedback (WBS 3.2.2).
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      return 'That file is not a PDF. Paper Insight reads PDFs only.';
    }
    if (file.size > MAX_BYTES) {
      return `That file is ${formatBytes(file.size)}. Keep it under 10 MB.`;
    }
    return '';
  }

  async function handleFile(file) {
    setError('');
    const v = validate(file);
    if (v) {
      setError(v);
      return;
    }
    setUploading(true);
    setProgress(0);
    try {
      const doc = await api.uploadDocument(file, setProgress);
      onUploaded?.(doc);
      if (inputRef.current) inputRef.current.value = '';
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }

  function onDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload a PDF: drop a file here or press Enter to browse"
        onClick={() => !uploading && inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && !uploading && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`group relative flex cursor-pointer items-center gap-5 rounded-sm border border-dashed px-6 py-7 text-left transition ${
          dragOver
            ? 'border-prussian-500 bg-prussian-50'
            : 'border-rule bg-surface hover:border-prussian-400 hover:bg-surface'
        } ${uploading ? 'pointer-events-none opacity-70' : ''}`}
      >
        {/* Intake slot mark — a filing tab, not a cloud icon. */}
        <span
          aria-hidden
          className={`flex h-12 w-10 shrink-0 flex-col justify-end rounded-[3px] border-2 transition ${
            dragOver ? 'border-prussian-500' : 'border-ink/30 group-hover:border-prussian-400'
          }`}
        >
          <span className="mx-1 mb-1 h-0.5 rounded bg-current opacity-40" />
          <span className="mx-1 mb-1 h-0.5 w-2/3 rounded bg-current opacity-40" />
        </span>

        <div className="min-w-0">
          <p className="font-display text-lg text-ink">
            {uploading ? 'Filing your document…' : 'Drop a PDF here, or click to browse'}
          </p>
          <p className="mt-0.5 font-mono text-xs text-ink-faint">PDF · up to 10 MB</p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
      </div>

      {uploading && (
        <div className="mt-3 flex items-center gap-3">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-rule">
            <div
              className="h-full bg-prussian-500 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="font-mono text-xs tabular-nums text-ink-faint">{progress}%</span>
        </div>
      )}

      {error && (
        <p className="mt-3 border-l-2 border-red-400 bg-red-50/70 px-4 py-2.5 text-sm text-red-800">
          {error}
        </p>
      )}
    </div>
  );
}
