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

const TITLE_STOP_WORDS = new Set([
  "a", "an", "the", "how", "can", "i", "to", "build", "better", "my", "what",
  "is", "are", "do", "for", "with", "and", "of", "this", "that", "please", "me", "you",
]);

export function fallbackTitleFromMessage(message: string): string {
  const normalized = message.replace(/[^a-zA-Z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
  const lowered = normalized.toLowerCase();
  if (["hi", "hello", "hey", "good morning", "good afternoon", "good evening", "thanks", "thank you"].includes(lowered)) {
    return "Getting Started";
  }
  const words = normalized.split(" ").filter((word) => !TITLE_STOP_WORDS.has(word.toLowerCase()));
  const selected = (words.length ? words : normalized.split(" ")).slice(0, 4);
  return selected.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ") || "New chat";
}

export function normalizeStoredTitle(thread: Thread): string {
  const firstUser = thread.messages.find((m) => m.role === "user");
  const firstText = firstUser ? messageText(firstUser) : "";
  const title = thread.title.trim();
  const normalized = title.toLowerCase().replace(/[^a-z ]/g, " ").replace(/\s+/g, " ").trim();
  const firstNormalized = firstText.toLowerCase().replace(/[^a-z ]/g, " ").replace(/\s+/g, " ").trim();
  const isRawTitle = normalized === firstNormalized;
  const isGreetingTitle = /^(hi|hello|hey) (there )?(how can i (help|assist)|how may i help)/.test(normalized);
  const isAnswerTitle = /^(sure|here|of course|absolutely|hello there)[,! ]/i.test(title) || title.split(/\s+/).length > 7;
  if (isRawTitle || isGreetingTitle || isAnswerTitle) return fallbackTitleFromMessage(firstText);
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
