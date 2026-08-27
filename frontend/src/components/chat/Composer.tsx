import type { FileUIPart } from "ai";
import {
  ArrowUpIcon,
  Code2Icon,
  GlobeIcon,
  PaperclipIcon,
  XIcon,
} from "lucide-react";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { toast } from "sonner";

import { PERSONAS, PERSONA_IDS, type PersonaId } from "@/lib/mavis/personas";

type ComposerProps = {
  onSend: (text: string, files: FileUIPart[]) => void;
  disabled?: boolean;
  webSearch: boolean;
  onWebSearchChange: (value: boolean) => void;
  persona: PersonaId;
  onPersonaChange: (value: PersonaId) => void;
  codingMode?: boolean;
  codingAvailable?: boolean;
  onCodingModeChange?: (value: boolean) => void;
};

const MAX_FILE_BYTES = 5 * 1024 * 1024;

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
    reader.readAsDataURL(file);
  });
}

export function Composer({
  onSend,
  disabled = false,
  webSearch,
  onWebSearchChange,
  persona,
  onPersonaChange,
  codingMode = false,
  codingAvailable = false,
  onCodingModeChange,
}: ComposerProps) {
  const [value, setValue] = useState("");
  const [attachments, setAttachments] = useState<FileUIPart[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    if (codingMode) {
      event.target.value = "";
      toast(
        "Coding Mode uses the project files selected above. Turn off Code to attach external files.",
      );
      return;
    }
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    const accepted: FileUIPart[] = [];
    for (const file of files) {
      if (file.size > MAX_FILE_BYTES) {
        toast.error(`${file.name} is larger than 5 MB`);
        continue;
      }
      try {
        accepted.push({
          type: "file",
          mediaType: file.type || "application/octet-stream",
          filename: file.name,
          url: await readAsDataUrl(file),
        });
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Could not read that file",
        );
      }
    }
    if (accepted.length) setAttachments((prev) => [...prev, ...accepted]);
  };

  const submit = (event?: FormEvent) => {
    event?.preventDefault();
    const text = value.trim();
    if ((!text && attachments.length === 0) || disabled) return;
    onSend(text, codingMode ? [] : attachments);
    setValue("");
    setAttachments([]);
  };

  return (
    <div className="border-t border-line/70 bg-cream/80 px-4 py-4 backdrop-blur-xl sm:px-8 sm:py-6">
      <form
        onSubmit={submit}
        className="mavis-glass mx-auto max-w-3xl rounded-[1.5rem] p-2.5 transition-colors focus-within:border-violet/70"
      >
        {attachments.length > 0 && (
          <ul className="flex flex-wrap gap-2 px-2 pb-1 pt-1">
            {attachments.map((file, index) => (
              <li
                key={`${file.filename}-${index}`}
                className="inline-flex items-center gap-2 rounded-full border border-line bg-night/70 px-3 py-1.5 text-xs text-ink"
              >
                <PaperclipIcon className="h-3 w-3 text-muted-ink" />
                <span className="max-w-[12rem] truncate">{file.filename}</span>
                <button
                  type="button"
                  aria-label={`Remove ${file.filename}`}
                  onClick={() =>
                    setAttachments((prev) => prev.filter((_, i) => i !== index))
                  }
                  className="text-muted-ink transition-colors hover:text-ink"
                >
                  <XIcon className="h-3 w-3" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <label htmlFor="composer" className="sr-only">
          Message Mavis
        </label>
        <textarea
          id="composer"
          rows={2}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              submit();
            }
          }}
          placeholder={
            codingMode
              ? "Describe the change Mavis should plan for the selected project files…"
              : "Ask anything, paste a link, or attach a file…"
          }
          className="scroll-slim w-full resize-none bg-transparent px-3 py-2.5 text-[15px] leading-relaxed text-ink outline-none placeholder:text-muted-ink/70"
        />

        <div className="flex items-center justify-between gap-2 px-1 pt-1">
          <div className="flex items-center gap-1.5">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,application/pdf,text/*,.md,.csv,.json"
              onChange={handleFiles}
              className="hidden"
            />
            {codingMode ? (
              <span
                title="Coding Mode reads the project files selected in the workspace panel above."
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-violet/25 bg-violet/8 px-3 font-mono text-[9px] uppercase tracking-[0.12em] text-violet"
              >
                <Code2Icon className="h-3.5 w-3.5" /> Workspace files
              </span>
            ) : (
              <button
                type="button"
                aria-label="Attach a file"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted-ink transition-colors hover:bg-panel-raised hover:text-sage"
              >
                <PaperclipIcon className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => onWebSearchChange(!webSearch)}
              aria-pressed={webSearch}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors ${
                webSearch
                  ? "border-sage/50 bg-sage/15 text-sage"
                  : "border-line bg-night/30 text-muted-ink hover:border-violet/60 hover:text-ink"
              }`}
            >
              <GlobeIcon className="h-3 w-3" /> Web
            </button>
            <button
              type="button"
              onClick={() => {
                if (!codingAvailable) {
                  toast("Coding Mode is available with owner access.");
                  return;
                }
                const enabling = !codingMode;
                if (enabling && attachments.length > 0) {
                  setAttachments([]);
                  toast(
                    "Attachments cleared. Coding Mode uses the project files selected above.",
                  );
                }
                onCodingModeChange?.(enabling);
              }}
              aria-pressed={codingMode}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors ${
                codingMode
                  ? "border-violet bg-violet/15 text-violet"
                  : "border-line bg-night/30 text-muted-ink hover:border-violet/60 hover:text-ink"
              }`}
              title={
                codingAvailable
                  ? "Owner-only Coding Mode"
                  : "Owner access required for Coding Mode"
              }
            >
              <Code2Icon className="h-3 w-3" /> Code
            </button>
            <label htmlFor="persona" className="sr-only">
              Persona
            </label>
            <select
              id="persona"
              value={persona}
              onChange={(event) =>
                onPersonaChange(event.target.value as PersonaId)
              }
              className="rounded-full border border-line bg-night/30 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-ink outline-none transition-colors hover:border-violet/60 hover:text-ink"
            >
              {PERSONA_IDS.map((id) => (
                <option key={id} value={id}>
                  {PERSONAS[id].label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={disabled || (!value.trim() && attachments.length === 0)}
            aria-label="Send message"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet to-tan text-night shadow-soft transition-all hover:scale-105 hover:brightness-110 disabled:cursor-not-allowed disabled:bg-line disabled:text-muted-ink disabled:shadow-none"
          >
            <ArrowUpIcon className="h-4 w-4" />
          </button>
        </div>
      </form>
      <p className="mx-auto mt-3 max-w-3xl text-center font-mono text-[9px] uppercase tracking-[0.18em] text-muted-ink">
        {codingMode
          ? "Coding Mode reads selected workspace files · review every diff before applying"
          : "Mavis can make mistakes · Enter to send · Shift + Enter for a new line"}
      </p>
    </div>
  );
}
