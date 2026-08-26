import { createFileRoute } from "@tanstack/react-router";
import type { FileUIPart, UIMessage } from "ai";
import { AnimatePresence, motion } from "motion/react";
import {
  EyeOffIcon,
  KeyRoundIcon,
  PanelLeftOpenIcon,
  ShieldCheckIcon,
  XIcon,
} from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";

import mavisOrb from "@/assets/mavis-orb.jpg";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { Composer } from "@/components/chat/Composer";
import { MessageItem } from "@/components/chat/MessageItem";
import type { PersonaId } from "@/lib/mavis/personas";
import {
  createThread,
  deriveTitle,
  loadThreads,
  newId,
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
        content:
          "Live web search, attachments and saved threads in one quiet workspace.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ChatPage,
});

const OWNER_SESSION_KEY = "mavis.owner-session";

type Usage = {
  mode: "demo" | "owner";
  used: number;
  limit: number | null;
  remaining: number | null;
};

const prompts = [
  "Summarize this PDF into five bullets",
  "What shipped in React this month?",
  "Refactor this component for accessibility",
  "Draft a warm follow-up email",
];

const renderApiUrl = (path: string) => {
  const base = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");
  if (!base) {
    throw new Error(
      "Mavis is not connected yet. Set VITE_API_URL to your Render backend URL and redeploy the frontend.",
    );
  }
  return `${base}${path}`;
};

const toErrorMessage = async (response: Response) => {
  try {
    const body = (await response.json()) as { detail?: string };
    return body.detail || `The Mavis service returned ${response.status}.`;
  } catch {
    return `The Mavis service returned ${response.status}.`;
  }
};

const createMessage = (
  role: "user" | "assistant",
  text: string,
  files: FileUIPart[] = [],
): UIMessage =>
  ({
    id: newId(),
    role,
    parts: [...files, { type: "text", text }],
  }) as UIMessage;

const guestId = () => {
  const key = "mavis.guest-id";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const next = newId();
  window.localStorage.setItem(key, next);
  return next;
};

const dataUrlParts = (dataUrl: string) => {
  const match = dataUrl.match(/^data:([^;,]+);base64,(.*)$/s);
  return match ? { mime: match[1], base64: match[2] } : null;
};

function ChatPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [incognito, setIncognito] = useState(false);
  const [persona, setPersona] = useState<PersonaId>("default");
  const [webSearch, setWebSearch] = useState(true);
  const [ownerSession, setOwnerSession] = useState("");
  const [usage, setUsage] = useState<Usage | null>(null);
  const [ownerDialogOpen, setOwnerDialogOpen] = useState(false);

  useEffect(() => {
    const stored = loadThreads();
    const initial = stored.length > 0 ? stored : [createThread()];
    setThreads(initial);
    setActiveId(initial[0].id);
    setOwnerSession(window.sessionStorage.getItem(OWNER_SESSION_KEY) ?? "");
  }, []);

  const refreshUsage = async (session = ownerSession) => {
    const base = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");
    if (!base) return;
    try {
      const response = await fetch(`${base}/usage`, {
        headers: { "X-Guest-ID": guestId(), "X-Mavis-Session": session },
      });
      if (response.ok) setUsage((await response.json()) as Usage);
    } catch {
      /* The composer provides the actionable connection error. */
    }
  };

  useEffect(() => {
    void refreshUsage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerSession]);

  const active =
    threads.find((thread) => thread.id === activeId) ?? threads[0] ?? null;

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

  const activateOwner = async (passkey: string) => {
    const response = await fetch(renderApiUrl("/auth/owner"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passkey }),
    });
    if (!response.ok) throw new Error(await toErrorMessage(response));
    const result = (await response.json()) as {
      session_id: string;
      expires_in_seconds: number;
    };
    window.sessionStorage.setItem(OWNER_SESSION_KEY, result.session_id);
    setOwnerSession(result.session_id);
    setOwnerDialogOpen(false);
    toast.success(
      `Owner access enabled for ${Math.round(result.expires_in_seconds / 3600)} hours.`,
    );
    await refreshUsage(result.session_id);
  };

  const leaveOwner = () => {
    window.sessionStorage.removeItem(OWNER_SESSION_KEY);
    setOwnerSession("");
    toast("Returned to demo access.");
  };

  return (
    <div className="mavis-shell grain flex h-screen w-full overflow-hidden bg-cream">
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
        <header className="mavis-glass flex h-[4.5rem] items-center justify-between gap-3 border-x-0 border-t-0 px-4 sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            {!sidebarOpen && (
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-panel/70 text-ink transition-colors hover:border-tan hover:bg-panel-raised"
              >
                <PanelLeftOpenIcon className="h-4 w-4" />
              </button>
            )}
            <div className="min-w-0">
              <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-sage">
                Mavis · online
              </p>
              <h1 className="truncate font-display text-lg text-ink">
                {active?.title ?? "New conversation"}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden rounded-full border border-sage/30 bg-sage/10 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-sage lg:inline-flex">
              Gemini primary · Groq fallback
            </span>
            <span
              className={`hidden rounded-full border px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.14em] md:inline-flex ${ownerSession ? "border-sage/30 bg-sage/10 text-sage" : "border-violet/30 bg-violet/10 text-violet"}`}
            >
              {ownerSession
                ? "Unlimited owner session"
                : usage
                  ? `${usage.remaining ?? 0} demo messages left`
                  : "10-message demo"}
            </span>
            <button
              type="button"
              onClick={
                ownerSession ? leaveOwner : () => setOwnerDialogOpen(true)
              }
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors ${
                ownerSession
                  ? "border-sage/50 bg-sage/15 text-sage"
                  : "border-line bg-panel/80 text-muted-ink hover:border-violet/60 hover:text-ink"
              }`}
            >
              {ownerSession ? (
                <ShieldCheckIcon className="h-3 w-3" />
              ) : (
                <KeyRoundIcon className="h-3 w-3" />
              )}
              {ownerSession ? "Owner active" : "Owner access"}
            </button>
            <button
              type="button"
              onClick={toggleIncognito}
              aria-pressed={incognito}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors ${
                incognito
                  ? "border-violet bg-violet/20 text-ink"
                  : "border-line bg-panel/80 text-muted-ink hover:border-tan hover:text-ink"
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
            onMessages={(messages) => handleMessages(active.id, messages)}
            persona={persona}
            onPersonaChange={setPersona}
            webSearch={webSearch}
            onWebSearchChange={setWebSearch}
            ownerSession={ownerSession}
            onUsage={setUsage}
            incognito={incognito}
          />
        ) : (
          <div className="flex-1" />
        )}
      </div>
      <OwnerAccessDialog
        open={ownerDialogOpen}
        onClose={() => setOwnerDialogOpen(false)}
        onSubmit={activateOwner}
      />
    </div>
  );
}

type ChatSurfaceProps = {
  thread: Thread;
  onMessages: (messages: UIMessage[]) => void;
  persona: PersonaId;
  onPersonaChange: (value: PersonaId) => void;
  webSearch: boolean;
  onWebSearchChange: (value: boolean) => void;
  ownerSession: string;
  onUsage: (usage: Usage | null) => void;
  incognito: boolean;
};

function ChatSurface({
  thread,
  onMessages,
  persona,
  onPersonaChange,
  webSearch,
  onWebSearchChange,
  ownerSession,
  onUsage,
  incognito,
}: ChatSurfaceProps) {
  const [messages, setMessages] = useState(thread.messages);
  const [status, setStatus] = useState<"ready" | "submitted" | "streaming">(
    "ready",
  );
  const [error, setError] = useState<Error | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef(thread.messages);
  const isBusy = status !== "ready";

  const updateMessages = (updater: (current: UIMessage[]) => UIMessage[]) => {
    setMessages((current) => {
      const next = updater(current);
      messagesRef.current = next;
      return next;
    });
  };

  const appendAssistantText = (assistantId: string, text: string) => {
    updateMessages((current) =>
      current.map((message) =>
        message.id === assistantId
          ? ({ ...message, parts: [{ type: "text", text }] } as UIMessage)
          : message,
      ),
    );
  };

  const sendAttachment = async (text: string, file: FileUIPart) => {
    const dataUrl = typeof file.url === "string" ? file.url : "";
    const form = new FormData();
    form.set(
      "message",
      text || `Please analyze ${file.filename ?? "this attachment"}.`,
    );
    form.set("session_id", thread.id);
    form.set("owner_session", ownerSession);
    form.set("incognito", String(incognito));
    form.set("persona", persona);

    const headers = { "X-Guest-ID": guestId() };
    if (file.mediaType?.startsWith("image/")) {
      const image = dataUrlParts(dataUrl);
      if (!image) throw new Error("The image could not be prepared for Mavis.");
      form.set("base64_image", image.base64);
      form.set("mime", image.mime);
      const response = await fetch(renderApiUrl("/chat-with-image"), {
        method: "POST",
        headers,
        body: form,
      });
      if (!response.ok) throw new Error(await toErrorMessage(response));
      return (await response.json()) as {
        response?: string;
        usage?: Usage | null;
      };
    }

    const content = await fetch(dataUrl).then((response) => response.text());
    form.set("filename", file.filename ?? "attachment.txt");
    form.set("file_content", content.slice(0, 15_000));
    const response = await fetch(renderApiUrl("/chat-with-file"), {
      method: "POST",
      headers,
      body: form,
    });
    if (!response.ok) throw new Error(await toErrorMessage(response));
    return (await response.json()) as { response?: string };
  };

  const streamText = async (
    text: string,
    onText: (content: string) => void,
  ) => {
    const response = await fetch(renderApiUrl("/chat/stream"), {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Guest-ID": guestId() },
      body: JSON.stringify({
        message: text,
        session_id: thread.id,
        owner_session: ownerSession,
        incognito,
        web_search: webSearch,
        persona,
      }),
    });
    if (!response.ok) throw new Error(await toErrorMessage(response));
    if (!response.body)
      throw new Error("The Mavis service did not return a response stream.");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let answer = "";

    const consumeEvent = (event: string) => {
      const line = event.split("\n").find((item) => item.startsWith("data: "));
      if (!line) return;
      const data = JSON.parse(line.slice(6)) as {
        type?: string;
        content?: string | { title?: string; url?: string }[];
        usage?: Usage | null;
      };
      if (data.type === "text" && typeof data.content === "string") {
        answer += data.content;
        onText(answer);
      }
      if (data.type === "sources" && Array.isArray(data.content)) {
        const citations = data.content
          .filter((source) => source.title && source.url)
          .map((source) => `- [${source.title}](${source.url})`)
          .join("\n");
        if (citations) {
          answer += `${answer ? "\n\n" : ""}Sources:\n${citations}`;
          onText(answer);
        }
      }
      if (data.type === "done" && data.usage) {
        onUsage(data.usage);
      }
      if (data.type === "error") {
        throw new Error(
          typeof data.content === "string"
            ? data.content
            : "Mavis could not complete that response.",
        );
      }
    };

    while (true) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value ?? new Uint8Array(), { stream: !done });
      const events = buffer.split("\n\n");
      buffer = events.pop() ?? "";
      events.forEach(consumeEvent);
      if (done) break;
      setStatus("streaming");
    }
    if (buffer.trim()) consumeEvent(buffer);
  };

  const send = async (text: string, files: FileUIPart[]) => {
    if (isBusy) return;
    setError(null);
    setStatus("submitted");

    const userMessage = createMessage("user", text, files);
    const assistantId = newId();
    updateMessages((current) => [
      ...current,
      userMessage,
      {
        id: assistantId,
        role: "assistant",
        parts: [{ type: "text", text: "" }],
      } as UIMessage,
    ]);

    try {
      if (files[0]) {
        const result = await sendAttachment(text, files[0]);
        appendAssistantText(
          assistantId,
          result.response || "Mavis could not read that attachment.",
        );
        if (result.usage) onUsage(result.usage);
      } else {
        await streamText(text, (content) =>
          appendAssistantText(assistantId, content),
        );
      }
    } catch (requestError) {
      const nextError =
        requestError instanceof Error
          ? requestError
          : new Error("Mavis could not complete that response.");
      setError(nextError);
      appendAssistantText(assistantId, nextError.message);
      toast.error(nextError.message);
    } finally {
      setStatus("ready");
      onMessages(messagesRef.current);
    }
  };

  const regenerate = () => {
    const lastUser = [...messages]
      .reverse()
      .find((message) => message.role === "user");
    const text = lastUser?.parts
      .map((part) => (part.type === "text" ? part.text : ""))
      .join("")
      .trim();
    if (text) void send(text, []);
  };

  const lastAssistantId = [...messages]
    .reverse()
    .find((message) => message.role === "assistant")?.id;

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, status]);

  return (
    <>
      <div
        ref={scrollRef}
        className="scroll-slim flex-1 overflow-y-auto px-4 py-8 sm:px-8"
      >
        {messages.length === 0 && !isBusy ? (
          <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center text-center">
            <div
              aria-hidden="true"
              className="mavis-orb relative h-20 w-20 overflow-hidden rounded-[1.75rem] border border-violet/40 bg-panel"
            >
              <img
                src={mavisOrb}
                alt=""
                className="h-full w-full object-cover"
              />
              <span className="absolute inset-0 bg-gradient-to-tr from-violet/25 via-transparent to-sage/20" />
            </div>
            <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.28em] text-sage">
              Personal intelligence, tuned to you
            </p>
            <h2 className="mt-3 font-display text-4xl tracking-[-0.025em] text-ink sm:text-5xl">
              Where should we begin?
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-ink">
              Mavis can reason through an idea, explore the web, or make sense
              of a file — all in one focused space.
            </p>
            <ul className="mt-8 grid w-full gap-2 sm:grid-cols-2">
              {prompts.map((prompt) => (
                <li key={prompt}>
                  <button
                    type="button"
                    onClick={() => void send(prompt, [])}
                    className="mavis-glass w-full rounded-2xl px-4 py-3.5 text-left text-sm text-ink transition-all hover:-translate-y-0.5 hover:border-violet/60 hover:bg-panel-raised"
                  >
                    {prompt}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-8 pb-4">
            {messages.map((message) => (
              <MessageItem
                key={message.id}
                message={message}
                canRegenerate={!isBusy && message.id === lastAssistantId}
                onRegenerate={regenerate}
              />
            ))}
            {isBusy && (
              <div
                className="flex items-center gap-3 pl-12"
                role="status"
                aria-live="polite"
              >
                <span className="sr-only">Mavis is thinking</span>
                {[0, 1, 2].map((dot) => (
                  <motion.span
                    key={dot}
                    className="h-1.5 w-1.5 rounded-full bg-violet"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{
                      duration: 1.1,
                      repeat: Infinity,
                      delay: dot * 0.18,
                    }}
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

type OwnerAccessDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (passkey: string) => Promise<void>;
};

function OwnerAccessDialog({
  open,
  onClose,
  onSubmit,
}: OwnerAccessDialogProps) {
  const [passkey, setPasskey] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!passkey || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      await onSubmit(passkey);
      setPasskey("");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Owner access could not be enabled.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-night/75 px-4 backdrop-blur-sm">
      <form
        onSubmit={submit}
        className="mavis-glass w-full max-w-sm rounded-3xl p-6 shadow-lift"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-sage">
              Private mode
            </p>
            <h2 className="mt-2 font-display text-2xl text-ink">
              Owner access
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close owner access"
            className="rounded-xl p-2 text-muted-ink transition-colors hover:bg-panel-raised hover:text-ink"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-ink">
          Enter your private passkey to unlock a time-limited, unrestricted
          Mavis session on this browser.
        </p>
        <label
          htmlFor="owner-passkey"
          className="mt-5 block font-mono text-[10px] uppercase tracking-[0.14em] text-muted-ink"
        >
          Passkey
        </label>
        <input
          id="owner-passkey"
          type="password"
          autoComplete="current-password"
          value={passkey}
          onChange={(event) => setPasskey(event.target.value)}
          className="mt-2 w-full rounded-xl border border-line bg-night/70 px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-violet"
          disabled={submitting}
          autoFocus
        />
        {error && <p className="mt-3 text-sm text-peach">{error}</p>}
        <button
          type="submit"
          disabled={submitting || !passkey}
          className="mt-5 w-full rounded-xl bg-gradient-to-r from-violet to-tan px-4 py-3 text-sm font-semibold text-night transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Verifying…" : "Unlock Mavis"}
        </button>
      </form>
    </div>
  );
}
