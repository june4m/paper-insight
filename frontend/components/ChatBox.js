'use client';

import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import SourceChunk from './SourceChunk';

export default function ChatBox({ documentId }) {
  const [messages, setMessages] = useState([]); // { role, content, sources? }
  const [question, setQuestion] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef(null);

  // Load prior chat history (Should-Have: chat history).
  useEffect(() => {
    let active = true;
    api
      .getHistory(documentId)
      .then((history) => {
        if (!active) return;
        const flat = [];
        for (const m of history) {
          flat.push({ role: 'user', content: m.question });
          flat.push({ role: 'assistant', content: m.answer, sources: m.sources });
        }
        setMessages(flat);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [documentId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, sending]);

  async function send(e) {
    e?.preventDefault();
    const q = question.trim();
    if (!q || sending) return;

    setError('');
    setQuestion('');
    setMessages((m) => [...m, { role: 'user', content: q }]);
    setSending(true);
    try {
      const res = await api.ask(documentId, q);
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: res.answer, sources: res.sources || [] },
      ]);
    } catch (e) {
      setError(e.message);
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: `⚠️ ${e.message}`, sources: [], isError: true },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-[32rem] flex-col rounded-xl border border-slate-200 bg-white">
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && !sending && (
          <div className="flex h-full items-center justify-center text-center text-sm text-slate-400">
            Ask anything about this document. Answers are grounded in its content with citations.
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
            <div className={m.role === 'user' ? 'max-w-[80%]' : 'max-w-[90%] w-full'}>
              <div
                className={`rounded-2xl px-4 py-2 text-sm ${
                  m.role === 'user'
                    ? 'bg-brand-500 text-white'
                    : m.isError
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-slate-100 text-slate-800'
                }`}
              >
                <p className="whitespace-pre-wrap">{m.content}</p>
              </div>
              {m.role === 'assistant' && m.sources?.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  <p className="text-xs font-medium text-slate-400">Sources</p>
                  {m.sources.map((s, idx) => (
                    <SourceChunk key={s.chunk_id || idx} source={s} index={idx} />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-500">
              <span className="inline-flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
              </span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="border-t border-red-100 bg-red-50 px-4 py-2 text-xs text-red-600">{error}</p>
      )}

      <form onSubmit={send} className="flex items-center gap-2 border-t border-slate-200 p-3">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question…"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
        />
        <button
          type="submit"
          disabled={sending || !question.trim()}
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
