const STYLES = {
  processing: 'bg-amber-100 text-amber-700 border-amber-200',
  completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  failed: 'bg-red-100 text-red-700 border-red-200',
};

const LABELS = {
  processing: 'Processing',
  completed: 'Completed',
  failed: 'Failed',
};

export default function StatusBadge({ status }) {
  const cls = STYLES[status] || 'bg-slate-100 text-slate-600 border-slate-200';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${cls}`}
    >
      {status === 'processing' && (
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
      )}
      {LABELS[status] || status}
    </span>
  );
}
