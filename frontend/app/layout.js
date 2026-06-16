import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'Paper Insight – AI Document Q&A',
  description: 'Upload a PDF and ask questions grounded in its content (RAG).',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl">📄</span>
              <span className="text-lg font-semibold text-slate-900">Paper Insight</span>
            </Link>
            <span className="text-sm text-slate-500">AI Document Q&amp;A · RAG</span>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
        <footer className="mx-auto max-w-5xl px-4 py-8 text-center text-xs text-slate-400">
          Paper Insight MVP · Upload PDF → ask grounded questions with citations
        </footer>
      </body>
    </html>
  );
}
