import type { UIMessage } from "ai";

export type Thread = {
  id: string;
  title: string;
  updatedAt: number;
  messages: UIMessage[];
};

const KEY = "mavis.threads.v2";

const isBrowser = () => typeof window !== "undefined";

export function newId() {
  if (isBrowser() && typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 12);
}

export function createThread(): Thread {
  return { id: newId(), title: "New chat", updatedAt: Date.now(), messages: [] };
}

export function loadThreads(): Thread[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Thread[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((t) => t && typeof t.id === "string" && Array.isArray(t.messages));
  } catch {
    return [];
  }
}

export function saveThreads(threads: Thread[]) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(threads));
  } catch {
    /* storage full or unavailable — keep the session usable */
  }
}

export function messageText(message: UIMessage): string {
  return message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("")
    .trim();
}

export function deriveTitle(messages: UIMessage[], fallback = "New chat"): string {
  const first = messages.find((m) => m.role === "user");
  if (!first) return fallback;
  const text = messageText(first);
  return text || fallback;
}

export function normalizeStoredTitle(thread: Thread): string {
  const firstUser = thread.messages.find((m) => m.role === "user");
  const firstText = firstUser ? messageText(firstUser) : "";
  const title = thread.title.trim();
  const normalized = title.toLowerCase().replace(/[^a-z ]/g, " ").replace(/\s+/g, " ").trim();
  const isGreeting = ["hi", "hello", "hey", "good morning", "good afternoon", "good evening"].includes(firstText.toLowerCase().trim());
  const isGreetingTitle = /^(hi|hello|hey) (there[ ,!]*)?(how can i (help|assist)|how may i help)/.test(normalized);
  if (isGreeting && (title.toLowerCase().trim() === firstText.toLowerCase().trim() || isGreetingTitle)) {
    return "Getting Started";
  }
  return title || "New chat";
}

export function toModelHistory(
  messages: UIMessage[],
): { role: "user" | "assistant"; content: string }[] {
  return messages
    .filter((message) => message.role === "user" || message.role === "assistant")
    .map((message) => ({
      role: message.role as "user" | "assistant",
      content: messageText(message),
    }))
    .filter((message) => message.content.length > 0);
}

export function relativeDay(timestamp: number): string {
  const now = new Date();
  const then = new Date(timestamp);
  const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((startOf(now) - startOf(then)) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return then.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
