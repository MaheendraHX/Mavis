import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PanelLeftOpenIcon, SparklesIcon, ZapIcon } from 'lucide-react';
import { Sidebar } from '../components/chat/Sidebar';
import { MessageItem } from '../components/chat/MessageItem';
import { Composer } from '../components/chat/Composer';
import { conversations as seedConversations, type Conversation } from '../data/conversations';

const prompts = [
  'Summarize this PDF into five bullets',
  'What shipped in React this month?',
  'Refactor this component for accessibility',
  'Draft a warm follow-up email',
];

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const DEFAULT_SESSION_KEY = 'mavis_session_id';

function getSessionId() {
  let sessionId = localStorage.getItem(DEFAULT_SESSION_KEY);
  if (!sessionId) {
    sessionId = `guest_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(DEFAULT_SESSION_KEY, sessionId);
  }
  return sessionId;
}

export function Chat() {
  const [threads, setThreads] = useState<Conversation[]>(seedConversations);
  const [activeId, setActiveId] = useState(seedConversations[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [thinking, setThinking] = useState(false);
  const [provider, setProvider] = useState<'groq' | 'gemini'>('groq');
  const scrollRef = useRef<HTMLDivElement>(null);

  const active = threads.find((thread) => thread.id === activeId) ?? threads[0];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [active?.messages.length, thinking]);

  const send = async (text: string) => {
    const userMessage = { id: `u-${Date.now()}`, role: 'user' as const, content: text };
    setThreads((prev) =>
      prev.map((thread) =>
        thread.id === activeId
          ? {
              ...thread,
              title: thread.messages.length === 0 ? text.slice(0, 42) : thread.title,
              messages: [...thread.messages, userMessage],
            }
          : thread,
      ),
    );
    setThinking(true);

    const sessionId = getSessionId();

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          user_type: 'guest',
          session_id: sessionId,
          incognito: false,
          web_search: true,
          persona: 'default',
          model_provider: provider,
          model_name: provider === 'groq' ? 'llama-3.3-70b-versatile' : 'gemini-2.0-flash',
        }),
      });

      if (!response.ok) {
        throw new Error(`Chat request failed: ${response.statusText}`);
      }

      const data = await response.json();
      const assistantMessage = data.response || 'Mavis did not return a response.';

      setThreads((prev) =>
        prev.map((thread) =>
          thread.id === activeId
            ? {
                ...thread,
                messages: [
                  ...thread.messages,
                  {
                    id: `a-${Date.now()}`,
                    role: 'assistant' as const,
                    content: assistantMessage,
                    sources: data.sources || [],
                  },
                ],
              }
            : thread,
        ),
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setThreads((prev) =>
        prev.map((thread) =>
          thread.id === activeId
            ? {
                ...thread,
                messages: [
                  ...thread.messages,
                  {
                    id: `a-${Date.now()}`,
                    role: 'assistant' as const,
                    content: `Error: ${errorMessage}`,
                  },
                ],
              }
            : thread,
        ),
      );
    } finally {
      setThinking(false);
    }
  };

  const newThread = () => {
    const thread: Conversation = {
      id: `c-${Date.now()}`,
      title: 'New chat',
      timestamp: 'Today',
      messages: []
    };
    setThreads((prev) => [thread, ...prev]);
    setActiveId(thread.id);
  };

  const remove = (id: string) => {
    setThreads((prev) => {
      const next = prev.filter((thread) => thread.id !== id);
      if (next.length === 0) {
        const fallback: Conversation = {
          id: `c-${Date.now()}`,
          title: 'New chat',
          timestamp: 'Today',
          messages: []
        };
        setActiveId(fallback.id);
        return [fallback];
      }
      if (id === activeId) setActiveId(next[0].id);
      return next;
    });
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-cream">
      <AnimatePresence initial={false}>
        {sidebarOpen &&
        <motion.aside
          initial={{ x: -280, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -280, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="absolute z-40 h-full shrink-0 lg:relative">
          
            <Sidebar
            conversations={threads}
            activeId={active.id}
            onSelect={(id) => setActiveId(id)}
            onDelete={remove}
            onNew={newThread}
            onClose={() => setSidebarOpen(false)} />
          
          </motion.aside>
        }
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-line bg-cream px-4 sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            {!sidebarOpen &&
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-ink transition-colors hover:bg-sand">
              
                <PanelLeftOpenIcon className="h-4 w-4" />
              </button>
            }
            <h1 className="truncate font-display text-lg text-ink">{active.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <label className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5 text-sm font-mono uppercase tracking-[0.14em] text-ink">
              <span className="font-semibold">Provider</span>
              <select
                value={provider}
                onChange={(event) => setProvider(event.target.value as 'groq' | 'gemini')}
                className="rounded-full border border-line bg-cream px-2 py-1 text-xs font-medium text-ink outline-none transition-colors hover:border-tan"
              >
                <option value="groq">Groq</option>
                <option value="gemini">Gemini</option>
              </select>
            </label>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
              Incognito off
            </span>
          </div>
        </header>

        <div ref={scrollRef} className="scroll-slim flex-1 overflow-y-auto px-4 py-8 sm:px-8">
          {active.messages.length === 0 && !thinking ?
          <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center text-center">
              <span
              aria-hidden="true"
              className="flex h-12 w-12 items-center justify-center rounded-full border border-line bg-white">
              
                <SparklesIcon className="h-5 w-5 text-peach" />
              </span>
              <h2 className="mt-6 font-display text-3xl tracking-[-0.01em] text-ink">
                What are we working on?
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
                Ask a question, paste a link, or attach a file. Mavis keeps the thread tidy.
              </p>
              <ul className="mt-8 grid w-full gap-2 sm:grid-cols-2">
                {prompts.map((prompt) =>
              <li key={prompt}>
                    <button
                  type="button"
                  onClick={() => send(prompt)}
                  className="w-full rounded-xl border border-line bg-white px-4 py-3 text-left text-sm text-ink transition-colors hover:border-tan hover:bg-sand">
                  
                      {prompt}
                    </button>
                  </li>
              )}
              </ul>
            </div> :

          <div className="mx-auto max-w-3xl space-y-7">
              {active.messages.map((message) =>
            <MessageItem key={message.id} message={message} />
            )}

              {thinking &&
            <div className="flex items-center gap-3 pl-12" role="status" aria-live="polite">
                  <span className="sr-only">Mavis is thinking</span>
                  {[0, 1, 2].map((dot) =>
              <motion.span
                key={dot}
                className="h-1.5 w-1.5 rounded-full bg-tan"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.1, repeat: Infinity, delay: dot * 0.18 }} />

              )}
                </div>
            }
            </div>
          }
        </div>

        <Composer onSend={send} disabled={thinking} />
      </div>
    </div>);

}