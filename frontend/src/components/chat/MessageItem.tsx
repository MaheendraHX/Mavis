import type { UIMessage } from "ai";
import { motion } from "motion/react";
import {
  CheckIcon,
  CopyIcon,
  DownloadIcon,
  LinkIcon,
  PaperclipIcon,
  RefreshCwIcon,
} from "lucide-react";
import { useState, type ComponentProps } from "react";
import { Streamdown } from "streamdown";

import mavisOrb from "@/assets/mavis-orb.jpg";
import type { SearchResult } from "@/lib/mavis/search-types";

import { CodePreview } from "./CodePreview";

type MessageItemProps = {
  message: UIMessage;
  sources?: SearchResult[];
  onRegenerate?: () => void;
  canRegenerate?: boolean;
};

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* use the compatibility path below */
  }
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    textarea.remove();
    return copied;
  } catch {
    return false;
  }
}

function CopyButton({
  text,
  label = "Copy",
}: {
  text: string;
  label?: string;
}) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  return (
    <button
      type="button"
      onClick={async () => {
        const copied = await copyText(text);
        setState(copied ? "copied" : "failed");
        setTimeout(() => setState("idle"), 1800);
      }}
      className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-ink transition-colors hover:text-ink"
      title={state === "failed" ? "Clipboard access was blocked" : label}
    >
      {state === "copied" ? (
        <CheckIcon className="h-3 w-3" />
      ) : (
        <CopyIcon className="h-3 w-3" />
      )}
      {state === "copied"
        ? "Copied"
        : state === "failed"
          ? "Copy failed"
          : label}
    </button>
  );
}

function DownloadButton({
  text,
  language,
}: {
  text: string;
  language: string;
}) {
  const [downloaded, setDownloaded] = useState(false);
  const extension =
    (
      {
        html: "html",
        css: "css",
        javascript: "js",
        js: "js",
        typescript: "ts",
        ts: "ts",
        python: "py",
        json: "json",
        markdown: "md",
        md: "md",
      } as Record<string, string>
    )[language.toLowerCase()] ?? "txt";
  return (
    <button
      type="button"
      onClick={() => {
        const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `mavis-code.${extension}`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        setDownloaded(true);
        window.setTimeout(() => setDownloaded(false), 1800);
      }}
      className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-ink transition-colors hover:text-ink"
      title={`Download ${extension.toUpperCase()} file`}
    >
      <DownloadIcon className="h-3 w-3" />
      {downloaded ? "Saved" : "Download"}
    </button>
  );
}

function CodeRenderer({
  className,
  children,
  inline,
  ...props
}: ComponentProps<"code"> & { inline?: boolean; node?: unknown }) {
  const code = String(children ?? "").replace(/\n$/, "");
  const language = className?.match(/language-([\w-]+)/)?.[1] ?? "code";
  if (inline || (!className && !code.includes("\n"))) {
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  }
  return (
    <div className="my-4 overflow-hidden rounded-2xl border border-line bg-night/95 text-cream shadow-soft">
      <div className="flex items-center justify-between border-b border-cream/10 px-3 py-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-cream/60">
          {language}
        </span>
        <div className="flex items-center gap-3">
          <CopyButton text={code} label="Copy code" />
          <CodePreview code={code} language={language} />
          <DownloadButton text={code} language={language} />
        </div>
      </div>
      <pre className="overflow-x-auto p-4 text-left text-[13px] leading-relaxed">
        <code className={className}>{children}</code>
      </pre>
    </div>
  );
}

export function MessageItem({
  message,
  sources: attachedSources = [],
  onRegenerate,
  canRegenerate,
}: MessageItemProps) {
  const isUser = message.role === "user";

  const text = message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("")
    .trim();

  const files = message.parts.filter((part) => part.type === "file");

  const toolSources: SearchResult[] = message.parts.flatMap((part) => {
    if (
      part.type === "tool-web_search" &&
      part.state === "output-available" &&
      part.output &&
      typeof part.output === "object" &&
      "results" in part.output
    ) {
      return ((part.output as { results?: SearchResult[] }).results ??
        []) as SearchResult[];
    }
    return [];
  });

  const sources = [
    ...new Map(
      [...attachedSources, ...toolSources].map((source) => [
        source.url,
        source,
      ]),
    ).values(),
  ];

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
          className="mavis-orb mt-1 flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-violet/40 bg-panel"
        >
          <img src={mavisOrb} alt="" className="h-full w-full object-cover" />
        </span>
      )}

      <div className={`max-w-[min(42rem,85%)] ${isUser ? "text-right" : ""}`}>
        {files.length > 0 && (
          <ul
            className={`mb-2 flex flex-wrap gap-2 ${isUser ? "justify-end" : ""}`}
          >
            {files.map((file, index) =>
              file.mediaType?.startsWith("image/") ? (
                <li key={index}>
                  <img
                    src={file.url}
                    alt={file.filename ?? "Attached image"}
                    className="max-h-44 rounded-2xl border border-violet/30 object-cover shadow-soft"
                  />
                </li>
              ) : (
                <li
                  key={index}
                  className="inline-flex items-center gap-2 rounded-full border border-line bg-panel px-3 py-1.5 text-xs text-muted-ink"
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
                ? "rounded-2xl rounded-br-md bg-gradient-to-br from-tan/95 to-peach/95 px-4 py-3 text-left text-[15px] leading-relaxed text-night shadow-soft"
                : "mavis-glass rounded-2xl rounded-tl-md px-4 py-3 text-[15px] leading-relaxed text-ink"
            }
          >
            {searching && !text && (
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-sage">
                Mavis is searching the web…
              </p>
            )}
            {isUser ? (
              <p className="whitespace-pre-wrap">{text}</p>
            ) : (
              <Streamdown
                className="[&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                components={{ code: CodeRenderer }}
                controls={{
                  table: { copy: true, download: true },
                  mermaid: { copy: true, download: true, fullscreen: true },
                }}
              >
                {text}
              </Streamdown>
            )}

            {sources.length > 0 && (
              <section
                className="mt-4 border-t border-line/70 pt-3"
                aria-label="Sources"
              >
                <div className="mb-2 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.18em] text-muted-ink">
                  <LinkIcon className="h-3 w-3 text-sage" />
                  Sources used
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {sources.map((source, index) => (
                    <a
                      key={source.url}
                      href={source.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="group flex min-w-0 items-start gap-2 rounded-xl border border-line/70 bg-panel/60 px-2.5 py-2 text-left transition-colors hover:border-sage/60 hover:bg-panel-raised"
                    >
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-sage/15 font-mono text-[9px] text-sage">
                        {index + 1}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-xs text-ink group-hover:text-sage">
                          {source.title}
                        </span>
                        <span className="mt-0.5 block truncate font-mono text-[9px] uppercase tracking-[0.1em] text-muted-ink">
                          {source.domain}
                        </span>
                      </span>
                    </a>
                  ))}
                </div>
              </section>
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
