import { Link } from "@tanstack/react-router";
import {
  PanelLeftCloseIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react";
import { useMemo, useState } from "react";

import mavisOrb from "@/assets/mavis-orb.jpg";
import { Wordmark } from "@/components/mavis/Wordmark";
import { relativeDay, type Thread } from "@/lib/mavis/threads";

type SidebarProps = {
  threads: Thread[];
  activeId: string;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
  onClose: () => void;
};

export function ChatSidebar({
  threads,
  activeId,
  onSelect,
  onDelete,
  onNew,
  onClose,
}: SidebarProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return threads;
    return threads.filter((thread) => {
      if (thread.title.toLowerCase().includes(q)) return true;
      return thread.messages.some((message) =>
        message.parts.some(
          (part) => part.type === "text" && part.text.toLowerCase().includes(q),
        ),
      );
    });
  }, [threads, query]);

  const totalMessages = threads.reduce(
    (sum, thread) => sum + thread.messages.length,
    0,
  );

  return (
    <div className="mavis-glass flex h-full w-[296px] flex-col border-y-0 border-l-0 bg-sand/75">
      <div className="flex items-center justify-between px-5 py-5">
        <Link
          to="/"
          className="flex items-center gap-3 text-sm"
          aria-label="Back to Mavis home"
        >
          <img
            src={mavisOrb}
            alt=""
            className="mavis-orb h-8 w-8 rounded-xl object-cover"
          />
          <span className="flex flex-col gap-0.5">
            <Wordmark />
            <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-sage">
              Private workspace
            </span>
          </span>
        </Link>
        <button
          type="button"
          onClick={onClose}
          aria-label="Collapse sidebar"
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-transparent text-muted-ink transition-colors hover:border-line hover:bg-panel hover:text-ink"
        >
          <PanelLeftCloseIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-2 px-4">
        <button
          type="button"
          onClick={onNew}
          className="flex w-full items-center gap-2 rounded-2xl bg-gradient-to-r from-violet to-tan px-4 py-3 text-sm font-semibold text-night shadow-soft transition-all hover:-translate-y-0.5 hover:brightness-110"
        >
          <PlusIcon className="h-4 w-4" />
          New chat
        </button>
        <div className="flex items-center gap-2 rounded-2xl border border-line bg-night/55 px-3 py-2.5 focus-within:border-violet/70">
          <SearchIcon className="h-3.5 w-3.5 shrink-0 text-muted-ink" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search threads"
            aria-label="Search threads"
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted-ink/70"
          />
        </div>
      </div>

      <nav
        aria-label="Conversations"
        className="scroll-slim mt-6 flex-1 overflow-y-auto px-4 pb-6"
      >
        <p className="px-2 pb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-ink">
          {query
            ? `${filtered.length} match${filtered.length === 1 ? "" : "es"}`
            : "Threads"}
        </p>
        {filtered.length === 0 ? (
          <p className="px-2 py-4 text-xs text-muted-ink">
            No threads match “{query}”.
          </p>
        ) : (
          <ul className="space-y-0.5">
            {filtered.map((thread) => {
              const isActive = thread.id === activeId;
              return (
                <li key={thread.id} className="group relative">
                  <button
                    type="button"
                    onClick={() => onSelect(thread.id)}
                    aria-current={isActive ? "true" : undefined}
                    className={`w-full rounded-xl px-3 py-2.5 pr-9 text-left transition-colors ${
                      isActive
                        ? "border border-violet/30 bg-panel-raised shadow-soft"
                        : "border border-transparent hover:bg-panel/80"
                    }`}
                  >
                    <span className="block truncate text-sm text-ink">
                      {thread.title}
                    </span>
                    <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-muted-ink">
                      {relativeDay(thread.updatedAt)}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(thread.id)}
                    aria-label={`Delete ${thread.title}`}
                    className="absolute right-2 top-3 flex h-6 w-6 items-center justify-center rounded-lg text-muted-ink opacity-0 transition-all hover:bg-night hover:text-peach focus:opacity-100 group-hover:opacity-100"
                  >
                    <Trash2Icon className="h-3.5 w-3.5" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </nav>

      <div className="border-t border-line/70 px-5 py-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-ink">
          Stored in this browser
        </p>
        <p className="mt-1 text-xs text-muted-ink">
          {threads.length} thread{threads.length === 1 ? "" : "s"} ·{" "}
          {totalMessages} message
          {totalMessages === 1 ? "" : "s"}
        </p>
      </div>
    </div>
  );
}
