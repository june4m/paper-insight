import './globals.css';
import Link from 'next/link';
import { Newsreader, Hanken_Grotesk, JetBrains_Mono } from 'next/font/google';

const display = Newsreader({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  style: ['normal', 'italic'],
});

const sans = Hanken_Grotesk({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata = {
  title: 'Paper Insight — read papers, verify every answer',
  description: 'Upload a PDF and ask questions answered straight from its text, each one footnoted to the page it came from.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body className="font-sans">
        <header className="sticky top-0 z-20 border-b border-rule bg-paper/85 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3.5">
            <Link href="/" className="group flex items-baseline gap-2.5">
              <span className="font-display text-[1.4rem] font-medium leading-none tracking-tight text-ink">
                Paper
                <span className="italic text-prussian-500">Insight</span>
              </span>
              <span
                aria-hidden
                className="hidden h-3.5 w-px bg-rule sm:block"
              />
              <span className="eyebrow hidden sm:inline">grounded Q&amp;A</span>
            </Link>
            <span className="eyebrow">RAG · cited to the page</span>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-5 py-10 md:py-14">{children}</main>

        <footer className="mx-auto max-w-5xl px-5 pb-12 pt-6">
          <div className="flex flex-col items-start gap-2 border-t border-rule pt-5 text-ink-faint sm:flex-row sm:items-center sm:justify-between">
            <span className="font-display italic text-ink-soft">
              Every answer keeps its footnotes.
            </span>
            <span className="eyebrow">Paper Insight · upload → ask → verify</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
