import { useChat } from "@ai-sdk/react";
import { createFileRoute } from "@tanstack/react-router";
import { DefaultChatTransport, type FileUIPart, type UIMessage } from "ai";
import { AnimatePresence, motion } from "motion/react";
import { EyeOffIcon, PanelLeftOpenIcon, SparklesIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { Composer } from "@/components/chat/Composer";
import { MessageItem } from "@/components/chat/MessageItem";
import { DEFAULT_MODEL, MODELS, type ModelId } from "@/lib/mavis/models";
import type { PersonaId } from "@/lib/mavis/personas";
import {
  createThread,
  deriveTitle,
  loadThreads,
  saveThreads,
  type Thread,
} from "@/lib/mavis/threads";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Chat with Mavis — multimodal AI assistant" },
      {
        name: "description",
        content:
          "Open a Mavis thread: live web search with sources, file attachments, personas and locally saved conversations.",
      },
      { property: "og:title", content: "Chat with Mavis" },
      {
        property: "og:description",
        content: "Live web search, attachments and saved threads in one quiet workspace.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ChatPage,
});

const prompts = [
  "Summarize this PDF into five bullets",
  "What shipped in React this month?",
  "Refactor this component for accessibility",
  "Draft a warm follow-up email",
];

function ChatPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [incognito, setIncognito] = useState(false);
  const [persona, setPersona] = useState<PersonaId>("default");
  const [model, setModel] = useState<ModelId>(DEFAULT_MODEL);
  const [webSearch, setWebSearch] = useState(true);

  // localStorage only exists in the browser, so hydrate after mount.
  useEffect(() => {
    const stored = loadThreads();
    const initial = stored.length > 0 ? stored : [createThread()];
    setThreads(initial);
    setActiveId(initial[0].id);
  }, []);

  const active = threads.find((thread) => thread.id === activeId) ?? threads[0] ?? null;

  const persist = (next: Thread[]) => {
    setThreads(next);
    if (!incognito) saveThreads(next);
  };

  const handleMessages = (id: string, messages: UIMessage[]) => {
    setThreads((prev) => {
      const next = prev.map((thread) =>
        thread.id === id
          ? {
              ...thread,
              messages,
              title: deriveTitle(messages, thread.title),
              updatedAt: Date.now(),
            }
          : thread,
      );
      if (!incognito) saveThreads(next);
      return next;
    });
  };

  const handleNew = () => {
    const thread = createThread();
    persist([thread, ...threads]);
    setActiveId(thread.id);
  };

  const handleDelete = (id: string) => {
    let next = threads.filter((thread) => thread.id !== id);
    if (next.length === 0) next = [createThread()];
    persist(next);
    if (id === activeId) setActiveId(next[0].id);
  };

  const toggleIncognito = () => {
    setIncognito((prev) => {
      const value = !prev;
      if (value) {
        toast("Incognito on — this thread won't be saved");
      } else {
        saveThreads(threads);
        toast("Incognito off — threads are saved again");
      }
      return value;
    });
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-cream">
      <AnimatePresence initial={false}>
        {sidebarOpen && active && (
          <motion.aside
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="absolute z-40 h-full shrink-0 lg:relative"
          >
            <ChatSidebar
              threads={threads}
              activeId={active.id}
              onSelect={setActiveId}
              onDelete={handleDelete}
              onNew={handleNew}
              onClose={() => setSidebarOpen(false)}
            />
          </motion.aside>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between gap-3 border-b border-line bg-cream px-4 sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            {!sidebarOpen && (
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-ink transition-colors hover:bg-sand"
              >
                <PanelLeftOpenIcon className="h-4 w-4" />
              </button>
            )}
            <h1 className="truncate font-display text-lg text-ink">
              {active?.title ?? "New chat"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <label className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-ink">
              <span className="hidden sm:inline">Mode</span>
              <select
                value={model}
                onChange={(event) => setModel(event.target.value as ModelId)}
                aria-label="Model mode"
                className="rounded-full border border-line bg-cream px-2 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-ink outline-none transition-colors hover:border-tan"
              >
                {MODELS.map((option) => (
                  <option key={option.id} value={option.id} title={option.hint}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={toggleIncognito}
              aria-pressed={incognito}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors ${
                incognito
                  ? "border-ink bg-ink text-cream"
                  : "border-line bg-white text-muted-ink hover:text-ink"
              }`}
            >
              <EyeOffIcon className="h-3 w-3" />
              Incognito {incognito ? "on" : "off"}
            </button>
          </div>
        </header>

        {active ? (
          <ChatSurface
            key={active.id}
            thread={active}
            settings={{ persona, model, webSearch }}
            onMessages={(messages) => handleMessages(active.id, messages)}
            persona={persona}
            onPersonaChange={setPersona}
            webSearch={webSearch}
            onWebSearchChange={setWebSearch}
          />
        ) : (
          <div className="flex-1" />
        )}
      </div>
    </div>
  );
}

type Settings = { persona: PersonaId; model: ModelId; webSearch: boolean };

function ChatSurface({
  thread,
  settings,
  onMessages,
  persona,
  onPersonaChange,
  webSearch,
  onWebSearchChange,
}: {
  thread: Thread;
  settings: Settings;
  onMessages: (messages: UIMessage[]) => void;
  persona: PersonaId;
  onPersonaChange: (value: PersonaId) => void;
  webSearch: boolean;
  onWebSearchChange: (value: boolean) => void;
}) {
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, regenerate, status, error } = useChat({
    id: thread.id,
    messages: thread.messages,
    transport,
    onError: (err) => toast.error(err.message || "Mavis could not answer that"),
  });

  const isBusy = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (isBusy) return;
    onMessages(messages);
    // Persist once a turn settles; onMessages identity changes each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, isBusy]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isBusy]);

  const send = (text: string, files: FileUIPart[]) => {
    void sendMessage({ text, files }, { body: settings });
  };

  const lastAssistantId = [...messages].reverse().find((m) => m.role === "assistant")?.id;

  return (
    <>
      <div ref={scrollRef} className="scroll-slim flex-1 overflow-y-auto px-4 py-8 sm:px-8">
        {messages.length === 0 && !isBusy ? (
          <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center text-center">
            <span
              aria-hidden="true"
              className="flex h-12 w-12 items-center justify-center rounded-full border border-line bg-white"
            >
              <SparklesIcon className="h-5 w-5 text-peach" />
            </span>
            <h2 className="mt-6 font-display text-3xl tracking-[-0.01em] text-ink">
              What are we working on?
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-ink">
              Ask a question, paste a link, or attach a file. Mavis keeps the thread tidy.
            </p>
            <ul className="mt-8 grid w-full gap-2 sm:grid-cols-2">
              {prompts.map((prompt) => (
                <li key={prompt}>
                  <button
                    type="button"
                    onClick={() => send(prompt, [])}
                    className="w-full rounded-xl border border-line bg-white px-4 py-3 text-left text-sm text-ink transition-colors hover:border-tan hover:bg-sand"
                  >
                    {prompt}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-7">
            {messages.map((message) => (
              <MessageItem
                key={message.id}
                message={message}
                canRegenerate={!isBusy && message.id === lastAssistantId}
                onRegenerate={() => void regenerate({ body: settings })}
              />
            ))}

            {status === "submitted" && (
              <div className="flex items-center gap-3 pl-12" role="status" aria-live="polite">
                <span className="sr-only">Mavis is thinking</span>
                {[0, 1, 2].map((dot) => (
                  <motion.span
                    key={dot}
                    className="h-1.5 w-1.5 rounded-full bg-tan"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.1, repeat: Infinity, delay: dot * 0.18 }}
                  />
                ))}
              </div>
            )}

            {error && (
              <p className="mx-auto max-w-3xl rounded-xl border border-[#e3b7b3] bg-[#fdf1ef] px-4 py-3 text-sm text-[#8f3f38]">
                {error.message}
              </p>
            )}
          </div>
        )}
      </div>

      <Composer
        onSend={send}
        disabled={isBusy}
        persona={persona}
        onPersonaChange={onPersonaChange}
        webSearch={webSearch}
        onWebSearchChange={onWebSearchChange}
      />
    </>
  );
}
