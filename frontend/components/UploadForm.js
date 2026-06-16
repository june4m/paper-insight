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
      return 'Only PDF files are accepted.';
    }
    if (file.size > MAX_BYTES) {
      return `File is ${formatBytes(file.size)}; the limit is 10 MB.`;
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
        onClick={() => !uploading && inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && !uploading && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition ${
          dragOver ? 'border-brand-500 bg-brand-50' : 'border-slate-300 bg-white hover:border-brand-400'
        } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
      >
        <span className="text-3xl">⬆️</span>
        <p className="mt-2 font-medium text-slate-700">
          {uploading ? 'Uploading…' : 'Drop a PDF here or click to browse'}
        </p>
        <p className="mt-1 text-xs text-slate-400">PDF only · max 10 MB</p>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
      </div>

      {uploading && (
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full bg-brand-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {error && (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
