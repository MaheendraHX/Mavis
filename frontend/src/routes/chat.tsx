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
import { CodingWorkspace } from "@/components/chat/CodingWorkspace";
import { TemporaryProjectWorkspace } from "@/components/chat/TemporaryProjectWorkspace";
import { Composer } from "@/components/chat/Composer";
import { MessageItem } from "@/components/chat/MessageItem";
import {
  codingProposalFromApi,
  codingVerificationFromApi,
  emptyCodingState,
  type CodingProposal,
  type CodingState,
} from "@/lib/mavis/coding";
import type { PersonaId } from "@/lib/mavis/personas";
import type { SearchResult } from "@/lib/mavis/search-types";
import {
  createThread,
  deriveTitle,
  loadThreads,
  newId,
  normalizeStoredTitle,
  saveThreads,
  toModelHistory,
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

const OWNER_SESSION_KEY = "mavis.owner.session";

function cleanAssistantText(text: string): string {
  const sourceMarker = text.search(
    /\n(?:---\s*\n)?\s*\*{0,2}sources?(?: used)?\s*:/i,
  );
  return sourceMarker >= 0 ? text.slice(0, sourceMarker).trimEnd() : text;
}

type Usage = {
  mode: "demo" | "owner";
  used: number;
  limit: number | null;
  remaining: number | null;
};

type ServiceStatus = "checking" | "ready" | "waking" | "unconfigured";

const prompts = [
  "Summarize this PDF into five bullets",
  "What shipped in React this month?",
  "Refactor this component for accessibility",
  "Draft a warm follow-up email",
];

const codingPrompts = [
  "Explain this component's state flow",
  "Find the likely source of this bug",
  "Refactor this selected file for accessibility",
  "Reduce duplication without changing behavior",
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
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus>("checking");

  useEffect(() => {
    const storedOwnerSession =
      window.sessionStorage.getItem(OWNER_SESSION_KEY) ?? "";
    const stored = loadThreads().map((thread) => ({
      ...thread,
      title: normalizeStoredTitle(thread),
      coding: storedOwnerSession
        ? thread.coding
        : { ...(thread.coding ?? emptyCodingState()), enabled: false },
    }));
    const initial = stored.length > 0 ? stored : [createThread()];
    setThreads(initial);
    setActiveId(initial[0].id);
    setOwnerSession(storedOwnerSession);
    if (!storedOwnerSession) saveThreads(initial);
  }, []);

  const refreshUsage = async (session = ownerSession) => {
    const base = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");
    if (!base) return;
    try {
      const response = await fetch(`${base}/usage`, {
        headers: { "X-Guest-ID": guestId(), "X-Mavis-Session": session },
      });
      if (response.ok) {
        const nextUsage = (await response.json()) as Usage;
        setUsage(nextUsage);
        if (session && nextUsage.mode !== "owner") {
          window.sessionStorage.removeItem(OWNER_SESSION_KEY);
          setOwnerSession("");
          setThreads((previous) => {
            const next = previous.map((thread) =>
              thread.coding?.enabled
                ? { ...thread, coding: { ...thread.coding, enabled: false } }
                : thread,
            );
            if (!incognito) saveThreads(next);
            return next;
          });
          toast("Your owner session expired. Please sign in again.");
        }
      }
    } catch {
      /* The composer provides the actionable connection error. */
    }
  };

  useEffect(() => {
    void refreshUsage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerSession]);

  useEffect(() => {
    const base = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");
    if (!base) {
      setServiceStatus("unconfigured");
      return;
    }
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 12_000);
    fetch(`${base}/health`, { signal: controller.signal })
      .then((response) => setServiceStatus(response.ok ? "ready" : "waking"))
      .catch(() => setServiceStatus("waking"))
      .finally(() => window.clearTimeout(timeout));
    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, []);

  const active =
    threads.find((thread) => thread.id === activeId) ?? threads[0] ?? null;

  const persist = (next: Thread[]) => {
    setThreads(next);
    if (!incognito) saveThreads(next);
  };

  const handleMessages = (
    id: string,
    messages: UIMessage[],
    generatedTitle?: string,
  ) => {
    setThreads((prev) => {
      const next = prev.map((thread) =>
        thread.id === id
          ? {
              ...thread,
              messages,
              title:
                generatedTitle?.trim() ||
                (thread.title === "New chat"
                  ? deriveTitle(messages, thread.title)
                  : thread.title),
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

        {serviceStatus !== "ready" && (
          <div
            className={`mx-4 mt-4 rounded-2xl border px-4 py-3 text-sm sm:mx-8 ${serviceStatus === "unconfigured" ? "border-peach/35 bg-peach/10 text-peach" : "border-violet/35 bg-violet/10 text-ink"}`}
            role="status"
          >
            <p className="font-medium">
              {serviceStatus === "unconfigured"
                ? "Mavis is not connected yet."
                : serviceStatus === "checking"
                  ? "Checking whether Mavis is ready…"
                  : "Mavis is waking up."}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-ink">
              {serviceStatus === "unconfigured"
                ? "This deployment is missing its API address. Please try again after the site owner completes setup."
                : "This free portfolio demo pauses after quiet periods. The first connection can take about a minute; you can start writing while she wakes."}
            </p>
          </div>
        )}

        {active ? (
          <ChatSurface
            key={active.id}
            thread={active}
            onMessages={(messages, generatedTitle) =>
              handleMessages(active.id, messages, generatedTitle)
            }
            persona={persona}
            onPersonaChange={setPersona}
            webSearch={webSearch}
            onWebSearchChange={setWebSearch}
            ownerSession={ownerSession}
            onUsage={setUsage}
            incognito={incognito}
            coding={active.coding ?? emptyCodingState()}
            onCodingChange={(coding) => {
              setThreads((previous) => {
                const next = previous.map((thread) =>
                  thread.id === active.id
                    ? { ...thread, coding, updatedAt: Date.now() }
                    : thread,
                );
                if (!incognito) saveThreads(next);
                return next;
              });
            }}
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
  onMessages: (messages: UIMessage[], generatedTitle?: string) => void;
  persona: PersonaId;
  onPersonaChange: (value: PersonaId) => void;
  webSearch: boolean;
  onWebSearchChange: (value: boolean) => void;
  ownerSession: string;
  onUsage: (usage: Usage | null) => void;
  incognito: boolean;
  coding: CodingState;
  onCodingChange: (coding: CodingState) => void;
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
  coding,
  onCodingChange,
}: ChatSurfaceProps) {
  const [messages, setMessages] = useState(thread.messages);
  const [status, setStatus] = useState<"ready" | "submitted" | "streaming">(
    "ready",
  );
  const [error, setError] = useState<Error | null>(null);
  const [sourcesByMessage, setSourcesByMessage] = useState<
    Record<string, SearchResult[]>
  >({});
  const [codingState, setCodingState] = useState<CodingState>(coding);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef(thread.messages);
  const isBusy = status !== "ready";

  const updateCoding = (updater: (current: CodingState) => CodingState) => {
    setCodingState((current) => {
      const next = updater(current);
      onCodingChange(next);
      return next;
    });
  };

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

  const setAssistantSources = (
    assistantId: string,
    sources: SearchResult[],
  ) => {
    setSourcesByMessage((current) => ({ ...current, [assistantId]: sources }));
  };

  const sendAttachment = async (
    text: string,
    file: FileUIPart,
    history: { role: "user" | "assistant"; content: string }[],
  ) => {
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
    form.set("history", JSON.stringify(history));

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
    history: { role: "user" | "assistant"; content: string }[],
    onText: (content: string) => void,
    onSources: (sources: SearchResult[]) => void,
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
        history,
      }),
    });
    if (!response.ok) throw new Error(await toErrorMessage(response));
    if (!response.body)
      throw new Error("The Mavis service did not return a response stream.");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let answer = "";
    let generatedTitle: string | undefined;

    const consumeEvent = (event: string) => {
      const line = event.split("\n").find((item) => item.startsWith("data: "));
      if (!line) return;
      const data = JSON.parse(line.slice(6)) as {
        type?: string;
        content?: string | { title?: string; url?: string; domain?: string }[];
        title?: string | null;
        usage?: Usage | null;
      };
      if (data.type === "text" && typeof data.content === "string") {
        answer += data.content;
        onText(cleanAssistantText(answer));
      }
      if (data.type === "sources" && Array.isArray(data.content)) {
        const unique = new Map<string, SearchResult>();
        data.content.forEach((source) => {
          if (!source.title || !source.url || unique.has(source.url)) return;
          let domain = source.domain || source.url;
          try {
            domain = new URL(source.url).hostname.replace(/^www\\./, "");
          } catch {
            /* keep the URL as a safe label */
          }
          unique.set(source.url, {
            title: source.title,
            url: source.url,
            domain,
            snippet: "",
          });
        });
        onSources([...unique.values()]);
      }
      if (data.type === "done") {
        if (data.title?.trim()) generatedTitle = data.title.trim();
        if (data.usage) onUsage(data.usage);
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
    return generatedTitle;
  };

  const proposeCoding = async (
    text: string,
    history: { role: "user" | "assistant"; content: string }[],
  ): Promise<CodingProposal> => {
    if (!ownerSession) throw new Error("Coding Mode requires owner access.");
    if (codingState.selectedFiles.length === 0) {
      throw new Error(
        codingState.workspace === "temporary"
          ? "Upload a temporary project and choose at least one file before asking Mavis to plan a code change."
          : "Choose at least one project file before asking Mavis to plan a code change.",
      );
    }
    const temporaryProjectId =
      codingState.workspace === "temporary"
        ? codingState.temporaryProject?.projectId
        : undefined;
    if (codingState.workspace === "temporary" && !temporaryProjectId) {
      throw new Error(
        "Upload a temporary project before asking Mavis to plan a code change.",
      );
    }
    if (text.length > 12_000)
      throw new Error("Coding tasks are limited to 12,000 characters.");
    const response = await fetch(
      renderApiUrl(
        temporaryProjectId
          ? `/temporary-projects/${temporaryProjectId}/propose`
          : "/coding/propose",
      ),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Guest-ID": guestId(),
        },
        body: JSON.stringify({
          message: text,
          session_id: thread.id,
          owner_session: ownerSession,
          files: codingState.selectedFiles,
          history,
          ...(temporaryProjectId ? { project_id: temporaryProjectId } : {}),
        }),
      },
    );
    const body = await response.json().catch(() => ({}));
    if (!response.ok)
      throw new Error(
        (body as { detail?: string }).detail ||
          "Mavis could not prepare a coding proposal.",
      );
    const proposal = codingProposalFromApi(body);
    if (!proposal.proposalId)
      throw new Error(
        "Mavis returned an incomplete coding proposal. Please try again.",
      );
    updateCoding((current) => ({ ...current, proposal }));
    return proposal;
  };

  const applyCoding = async (proposalId: string) => {
    try {
      const temporaryProjectId =
        codingState.workspace === "temporary"
          ? codingState.temporaryProject?.projectId
          : undefined;
      if (codingState.workspace === "temporary" && !temporaryProjectId) {
        throw new Error(
          "That temporary project has expired. Upload it again to continue.",
        );
      }
      const response = await fetch(
        renderApiUrl(
          temporaryProjectId
            ? `/temporary-projects/${temporaryProjectId}/apply`
            : "/coding/apply",
        ),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Mavis-Session": ownerSession,
          },
          body: JSON.stringify({
            proposal_id: proposalId,
            confirm: true,
            ...(temporaryProjectId ? { project_id: temporaryProjectId } : {}),
          }),
        },
      );
      const body = (await response.json().catch(() => ({}))) as {
        detail?: string;
        checkpoint_id?: string;
        changed_files?: string[];
      };
      if (!response.ok)
        throw new Error(body.detail || "Mavis could not apply that proposal.");
      updateCoding((current) =>
        current.proposal?.proposalId === proposalId
          ? {
              ...current,
              proposal: {
                ...current.proposal,
                status: "applied",
                checkpointId: body.checkpoint_id ?? null,
                changedFiles: body.changed_files ?? [],
              },
            }
          : current,
      );
      toast.success("Changes applied. Mavis created a checkpoint first.");
    } catch (applyError) {
      const message =
        applyError instanceof Error
          ? applyError.message
          : "Mavis could not apply that proposal.";
      toast.error(message);
    }
  };

  const verifyCoding = async (proposalId: string, command: string) => {
    try {
      const temporaryProjectId =
        codingState.workspace === "temporary"
          ? codingState.temporaryProject?.projectId
          : undefined;
      if (codingState.workspace === "temporary" && !temporaryProjectId) {
        throw new Error(
          "That temporary project has expired. Upload it again to continue.",
        );
      }
      const response = await fetch(
        renderApiUrl(
          temporaryProjectId
            ? `/temporary-projects/${temporaryProjectId}/verify`
            : "/coding/verify",
        ),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Mavis-Session": ownerSession,
          },
          body: JSON.stringify({
            proposal_id: proposalId,
            command,
            ...(temporaryProjectId ? { project_id: temporaryProjectId } : {}),
          }),
        },
      );
      const body = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(
          (body as { detail?: string }).detail ||
            "Mavis could not run that check.",
        );
      const result = codingVerificationFromApi(body);
      updateCoding((current) =>
        current.proposal?.proposalId === proposalId
          ? {
              ...current,
              proposal: {
                ...current.proposal,
                verificationResults: [
                  ...current.proposal.verificationResults,
                  result,
                ],
              },
            }
          : current,
      );
      if (result.success) {
        toast.success(`${result.label} passed.`);
      } else {
        toast.error(`${result.label} failed — review the output.`);
      }
    } catch (verificationError) {
      toast.error(
        verificationError instanceof Error
          ? verificationError.message
          : "Mavis could not run that check.",
      );
    }
  };

  const rollbackCoding = async (proposalId: string) => {
    try {
      const temporaryProjectId =
        codingState.workspace === "temporary"
          ? codingState.temporaryProject?.projectId
          : undefined;
      if (codingState.workspace === "temporary" && !temporaryProjectId) {
        throw new Error(
          "That temporary project has expired. Upload it again to continue.",
        );
      }
      const response = await fetch(
        renderApiUrl(
          temporaryProjectId
            ? `/temporary-projects/${temporaryProjectId}/rollback`
            : "/coding/rollback",
        ),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Mavis-Session": ownerSession,
          },
          body: JSON.stringify({
            proposal_id: proposalId,
            confirm: true,
            ...(temporaryProjectId ? { project_id: temporaryProjectId } : {}),
          }),
        },
      );
      const body = (await response.json().catch(() => ({}))) as {
        detail?: string;
      };
      if (!response.ok)
        throw new Error(
          body.detail || "Mavis could not restore that checkpoint.",
        );
      updateCoding((current) =>
        current.proposal?.proposalId === proposalId
          ? {
              ...current,
              proposal: { ...current.proposal, status: "rolled_back" },
            }
          : current,
      );
      toast.success("Checkpoint restored.");
    } catch (rollbackError) {
      toast.error(
        rollbackError instanceof Error
          ? rollbackError.message
          : "Mavis could not restore that checkpoint.",
      );
    }
  };

  const send = async (text: string, files: FileUIPart[]) => {
    if (isBusy) return;
    setError(null);
    setStatus("submitted");

    const history = toModelHistory(messagesRef.current);
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

    let generatedTitle: string | undefined;
    try {
      if (codingState.enabled) {
        if (files.length > 0)
          throw new Error(
            "Coding Mode uses selected workspace files, not chat attachments.",
          );
        const proposal = await proposeCoding(text, history);
        const changeLabel =
          proposal.proposedChanges.length === 1
            ? "1 reviewable change"
            : `${proposal.proposedChanges.length} reviewable changes`;
        appendAssistantText(
          assistantId,
          `${proposal.summary}\n\n**Coding plan ready.** I prepared ${changeLabel}. Review the plan and diff in the Coding Mode panel, then approve it only if it looks right.`,
        );
      } else if (files[0]) {
        const result = await sendAttachment(text, files[0], history);
        generatedTitle = result.title?.trim() || undefined;
        appendAssistantText(
          assistantId,
          result.response || "Mavis could not read that attachment.",
        );
        if (result.usage) onUsage(result.usage);
      } else {
        generatedTitle = await streamText(
          text,
          history,
          (content) => appendAssistantText(assistantId, content),
          (sources) => setAssistantSources(assistantId, sources),
        );
      }
    } catch (requestError) {
      const nextError =
        requestError instanceof Error
          ? requestError
          : new Error("Mavis could not complete that response.");
      setError(nextError);
      if (codingState.enabled) {
        updateMessages((current) =>
          current.filter((message) => message.id !== assistantId),
        );
      } else {
        appendAssistantText(assistantId, nextError.message);
      }
      toast.error(nextError.message);
    } finally {
      setStatus("ready");
      onMessages(messagesRef.current, generatedTitle);
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
              {codingState.enabled
                ? codingState.workspace === "temporary"
                  ? "What should we improve in this upload?"
                  : "What should we improve?"
                : "Where should we begin?"}
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-ink">
              {codingState.enabled
                ? codingState.workspace === "temporary"
                  ? "Upload a small external project, choose only the relevant files, then describe the change. Mavis will plan it before anything is edited."
                  : "Choose the smallest relevant set of source files above, then describe the change. Mavis will plan it before anything is edited."
                : "Mavis can reason through an idea, explore the web, or make sense of a file — all in one focused space."}
            </p>
            <p className="mt-4 inline-flex max-w-md items-center rounded-full border border-line bg-panel/60 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.13em] text-muted-ink">
              {codingState.enabled
                ? codingState.workspace === "temporary"
                  ? "Isolated upload · your original files stay unchanged"
                  : "Owner coding mode · nothing changes without approval"
                : "Free demo note · first connection after quiet time can take about a minute"}
            </p>

            <ul className="mt-8 grid w-full gap-2 sm:grid-cols-2">
              {(codingState.enabled ? codingPrompts : prompts).map((prompt) => (
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
                sources={sourcesByMessage[message.id]}
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

      {codingState.enabled && workspaceOpen && (
        <section
          className="border-t border-line/80 bg-[#eff4ed]/94 px-4 py-3 shadow-[0_-12px_28px_rgba(20,49,32,0.08)] backdrop-blur-xl sm:px-8"
          aria-label="Coding workspace dock"
        >
          <div className="mx-auto max-w-3xl">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
              <div>
                <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-violet">
                  Coding workspace
                </p>
                <p className="mt-0.5 text-xs text-muted-ink">
                  Select project files here before sending your coding request.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setWorkspaceOpen(false)}
                className="rounded-full border border-line bg-panel/80 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.13em] text-muted-ink transition-colors hover:border-violet/45 hover:text-ink"
              >
                Hide workspace
              </button>
            </div>

            <div className="scroll-slim max-h-[min(58vh,32rem)] overflow-y-auto pr-1">
              <div
                className="mb-3 flex flex-wrap gap-2"
                role="tablist"
                aria-label="Coding workspace type"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={codingState.workspace === "mavis"}
                  onClick={() =>
                    updateCoding((current) => ({
                      ...current,
                      workspace: "mavis",
                      selectedFiles: [],
                      proposal: undefined,
                    }))
                  }
                  className={`rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.13em] transition-colors ${
                    codingState.workspace === "mavis"
                      ? "border-violet/55 bg-violet/12 text-ink"
                      : "border-line bg-panel/70 text-muted-ink hover:border-violet/35 hover:text-ink"
                  }`}
                >
                  Mavis repository
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={codingState.workspace === "temporary"}
                  onClick={() =>
                    updateCoding((current) => ({
                      ...current,
                      workspace: "temporary",
                      selectedFiles: [],
                      proposal: undefined,
                    }))
                  }
                  className={`rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.13em] transition-colors ${
                    codingState.workspace === "temporary"
                      ? "border-sage/55 bg-sage/12 text-ink"
                      : "border-line bg-panel/70 text-muted-ink hover:border-sage/35 hover:text-ink"
                  }`}
                >
                  Temporary project
                </button>
              </div>

              {codingState.workspace === "temporary" && (
                <TemporaryProjectWorkspace
                  apiUrl={renderApiUrl}
                  ownerSession={ownerSession}
                  project={codingState.temporaryProject}
                  disabled={isBusy}
                  onSelectedFilesChange={(selectedFiles) =>
                    updateCoding((current) => ({ ...current, selectedFiles }))
                  }
                  onProjectChange={(temporaryProject) =>
                    updateCoding((current) => ({
                      ...current,
                      temporaryProject,
                      selectedFiles: [],
                      proposal: undefined,
                    }))
                  }
                />
              )}

              {(codingState.workspace === "mavis" ||
                codingState.temporaryProject) && (
                <CodingWorkspace
                  apiUrl={renderApiUrl}
                  workspaceKind={codingState.workspace}
                  workspacePath={
                    codingState.workspace === "temporary" &&
                    codingState.temporaryProject
                      ? `/temporary-projects/${codingState.temporaryProject.projectId}`
                      : "/coding/workspace"
                  }
                  ownerSession={ownerSession}
                  selectedFiles={codingState.selectedFiles}
                  onSelectedFilesChange={(selectedFiles) =>
                    updateCoding((current) => ({ ...current, selectedFiles }))
                  }
                  proposal={codingState.proposal}
                  disabled={isBusy}
                  onApply={applyCoding}
                  onVerify={verifyCoding}
                  onRollback={rollbackCoding}
                />
              )}
            </div>
          </div>
        </section>
      )}

      <Composer
        onSend={send}
        disabled={isBusy}
        persona={persona}
        onPersonaChange={onPersonaChange}
        webSearch={webSearch}
        onWebSearchChange={onWebSearchChange}
        codingMode={codingState.enabled}
        codingWorkspace={codingState.workspace}
        codingWorkspaceOpen={workspaceOpen}
        onCodingWorkspaceToggle={() => setWorkspaceOpen((open) => !open)}
        codingAvailable={Boolean(ownerSession)}
        onCodingModeChange={(enabled) => {
          if (enabled) onWebSearchChange(false);
          setWorkspaceOpen(enabled);
          updateCoding((current) => ({
            ...current,
            enabled,
            selectedFiles: enabled ? current.selectedFiles : [],
            proposal: enabled ? current.proposal : undefined,
          }));
        }}
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
          className="mt-2 w-full rounded-xl border border-line bg-panel px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-violet"
          disabled={submitting}
          autoFocus
        />
        {error && <p className="mt-3 text-sm text-peach">{error}</p>}
        <button
          type="submit"
          disabled={submitting || !passkey}
          className="mt-5 w-full rounded-xl bg-gradient-to-r from-[#7765d5] to-[#087b66] px-4 py-3 text-sm font-semibold text-[#f8fff8] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Verifying…" : "Unlock Mavis"}
        </button>
      </form>
    </div>
  );
}
