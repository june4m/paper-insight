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
        { role: 'assistant', content: e.message, sources: [], isError: true },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-[34rem] flex-col overflow-hidden rounded-sm border border-rule bg-surface shadow-card">
      <div
        ref={scrollRef}
        className="scroll-quiet flex-1 space-y-7 overflow-y-auto px-5 py-6"
      >
        {messages.length === 0 && !sending && (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <p className="font-display text-lg italic text-ink-soft">
              Begin the conversation.
            </p>
            <p className="mt-1 max-w-sm text-sm text-ink-faint">
              Ask anything about this document. Each answer is drawn from its text and
              footnoted to the page.
            </p>
          </div>
        )}

        {messages.map((m, i) =>
          m.role === 'user' ? (
            <div key={i} className="flex justify-end">
              <div className="max-w-[82%] rounded-sm rounded-tr-none bg-prussian-500 px-4 py-2.5 text-[0.95rem] leading-relaxed text-paper shadow-sm">
                <p className="whitespace-pre-wrap">{m.content}</p>
              </div>
            </div>
          ) : (
            <div key={i} className="animate-ink-in">
              <p className="eyebrow mb-2">{m.isError ? 'Could not answer' : 'Answer'}</p>
              <div
                className={`border-l-2 pl-4 ${
                  m.isError ? 'border-red-400' : 'border-prussian-200'
                }`}
              >
                <p
                  className={`whitespace-pre-wrap font-display text-[1.02rem] leading-relaxed ${
                    m.isError ? 'text-red-800' : 'text-ink'
                  }`}
                >
                  {m.content}
                </p>

                {m.sources?.length > 0 && (
                  <div className="mt-4">
                    <p className="eyebrow mb-2">
                      Footnotes · {m.sources.length}
                    </p>
                    <div className="space-y-2">
                      {m.sources.map((s, idx) => (
                        <SourceChunk key={s.chunk_id || idx} source={s} index={idx} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        )}

        {sending && (
          <div className="animate-ink-in">
            <p className="eyebrow mb-2">Reading the passages…</p>
            <div className="border-l-2 border-prussian-200 pl-4">
              <span className="inline-flex gap-1.5">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-prussian-400 [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-prussian-400 [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-prussian-400" />
              </span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="border-t border-red-200 bg-red-50/70 px-5 py-2 text-xs text-red-700">
          {error}
        </p>
      )}

      <form onSubmit={send} className="flex items-center gap-2 border-t border-rule bg-paper/60 p-3">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask this document a question…"
          className="flex-1 rounded-sm border border-rule bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink-faint focus:border-prussian-500"
        />
        <button
          type="submit"
          disabled={sending || !question.trim()}
          className="rounded-sm bg-prussian-500 px-4 py-2.5 text-sm font-medium text-paper transition hover:bg-prussian-600 disabled:opacity-40"
        >
          Ask
        </button>
      </form>
    </div>
  );
}
