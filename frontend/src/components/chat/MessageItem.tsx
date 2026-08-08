import type { UIMessage } from "ai";
import { motion } from "motion/react";
import { CheckIcon, CopyIcon, LinkIcon, PaperclipIcon, RefreshCwIcon } from "lucide-react";
import { useState } from "react";
import { Streamdown } from "streamdown";

import type { SearchResult } from "@/lib/mavis/search-types";

type MessageItemProps = {
  message: UIMessage;
  onRegenerate?: () => void;
  canRegenerate?: boolean;
};

function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          /* clipboard blocked */
        }
      }}
      className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-ink transition-colors hover:text-ink"
    >
      {copied ? <CheckIcon className="h-3 w-3" /> : <CopyIcon className="h-3 w-3" />}
      {copied ? "Copied" : label}
    </button>
  );
}

export function MessageItem({ message, onRegenerate, canRegenerate }: MessageItemProps) {
  const isUser = message.role === "user";

  const text = message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("")
    .trim();

  const files = message.parts.filter((part) => part.type === "file");

  const sources: SearchResult[] = message.parts.flatMap((part) => {
    if (
      part.type === "tool-web_search" &&
      part.state === "output-available" &&
      part.output &&
      typeof part.output === "object" &&
      "results" in part.output
    ) {
      return ((part.output as { results?: SearchResult[] }).results ?? []) as SearchResult[];
    }
    return [];
  });

  const searching = message.parts.some(
    (part) =>
      (part.type === "tool-web_search" || part.type === "tool-read_url") &&
      (part.state === "input-streaming" || part.state === "input-available"),
  );

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`flex gap-4 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <span
          aria-hidden="true"
          className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line bg-white font-display text-sm text-peach"
        >
          M
        </span>
      )}

      <div className={`max-w-[min(42rem,85%)] ${isUser ? "text-right" : ""}`}>
        {files.length > 0 && (
          <ul className={`mb-2 flex flex-wrap gap-2 ${isUser ? "justify-end" : ""}`}>
            {files.map((file, index) =>
              file.mediaType?.startsWith("image/") ? (
                <li key={index}>
                  <img
                    src={file.url}
                    alt={file.filename ?? "Attached image"}
                    className="max-h-44 rounded-xl border border-line object-cover"
                  />
                </li>
              ) : (
                <li
                  key={index}
                  className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1 text-xs text-muted-ink"
                >
                  <PaperclipIcon className="h-3 w-3" />
                  {file.filename ?? "Attachment"}
                </li>
              ),
            )}
          </ul>
        )}

        {(text || searching) && (
          <div
            className={
              isUser
                ? "rounded-2xl rounded-br-md bg-ink px-4 py-3 text-left text-[15px] leading-relaxed text-cream"
                : "rounded-2xl rounded-tl-md border border-line bg-white px-4 py-3 text-[15px] leading-relaxed text-ink shadow-soft"
            }
          >
            {searching && !text && (
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-ink">
                Searching the web…
              </p>
            )}
            {isUser ? (
              <p className="whitespace-pre-wrap">{text}</p>
            ) : (
              <Streamdown className="[&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                {text}
              </Streamdown>
            )}

            {sources.length > 0 && (
              <ul className="mt-4 space-y-1.5 border-t border-line pt-3">
                {sources.map((source) => (
                  <li key={source.url} className="flex items-start gap-2 text-left">
                    <LinkIcon className="mt-0.5 h-3 w-3 shrink-0 text-tan" />
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-xs text-muted-ink transition-colors hover:text-ink"
                    >
                      {source.title}
                      <span className="ml-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-tan">
                        {source.domain}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {!isUser && text && (
          <div className="mt-2 flex items-center gap-3 pl-1">
            <CopyButton text={text} />
            {canRegenerate && (
              <button
                type="button"
                onClick={onRegenerate}
                className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-ink transition-colors hover:text-ink"
              >
                <RefreshCwIcon className="h-3 w-3" /> Regenerate
              </button>
            )}
          </div>
        )}
      </div>
    </motion.article>
  );
}
