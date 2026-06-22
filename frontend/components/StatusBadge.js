const STYLES = {
  processing: 'text-amber-700 border-amber-300 bg-amber-50',
  completed: 'text-prussian-600 border-prussian-200 bg-prussian-50',
  failed: 'text-red-700 border-red-300 bg-red-50',
};

const LABELS = {
  processing: 'Reading',
  completed: 'Ready',
  failed: 'Failed',
};

export default function StatusBadge({ status }) {
  const cls = STYLES[status] || 'text-ink-soft border-rule bg-surface';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-[0.12em] ${cls}`}
    >
      {status === 'processing' && (
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
      )}
      {LABELS[status] || status}
    </span>
  );
}
