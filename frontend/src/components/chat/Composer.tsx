import type { FileUIPart } from "ai";
import { ArrowUpIcon, GlobeIcon, PaperclipIcon, XIcon } from "lucide-react";
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
}: ComposerProps) {
  const [value, setValue] = useState("");
  const [attachments, setAttachments] = useState<FileUIPart[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (event: ChangeEvent<HTMLInputElement>) => {
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
        toast.error(error instanceof Error ? error.message : "Could not read that file");
      }
    }
    if (accepted.length) setAttachments((prev) => [...prev, ...accepted]);
  };

  const submit = (event?: FormEvent) => {
    event?.preventDefault();
    const text = value.trim();
    if ((!text && attachments.length === 0) || disabled) return;
    onSend(text, attachments);
    setValue("");
    setAttachments([]);
  };

  return (
    <div className="border-t border-line bg-cream px-4 py-4 sm:px-8 sm:py-6">
      <form
        onSubmit={submit}
        className="mx-auto max-w-3xl rounded-2xl border border-line bg-white p-2 shadow-soft focus-within:border-tan"
      >
        {attachments.length > 0 && (
          <ul className="flex flex-wrap gap-2 px-2 pb-1 pt-1">
            {attachments.map((file, index) => (
              <li
                key={`${file.filename}-${index}`}
                className="inline-flex items-center gap-2 rounded-full border border-line bg-sand px-3 py-1 text-xs text-ink"
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
          placeholder="Ask anything, paste a link, or attach a file…"
          className="scroll-slim w-full resize-none bg-transparent px-3 py-2 text-[15px] leading-relaxed text-ink outline-none placeholder:text-muted-ink/70"
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
            <button
              type="button"
              aria-label="Attach a file"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted-ink transition-colors hover:bg-sand hover:text-ink"
            >
              <PaperclipIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onWebSearchChange(!webSearch)}
              aria-pressed={webSearch}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors ${
                webSearch
                  ? "border-sage bg-sage/20 text-ink"
                  : "border-line text-muted-ink hover:text-ink"
              }`}
            >
              <GlobeIcon className="h-3 w-3" /> Web
            </button>
            <label htmlFor="persona" className="sr-only">
              Persona
            </label>
            <select
              id="persona"
              value={persona}
              onChange={(event) => onPersonaChange(event.target.value as PersonaId)}
              className="rounded-full border border-line bg-white px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-ink outline-none transition-colors hover:text-ink"
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
            className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-cream transition-colors hover:bg-peach disabled:cursor-not-allowed disabled:bg-line disabled:text-muted-ink"
          >
            <ArrowUpIcon className="h-4 w-4" />
          </button>
        </div>
      </form>
      <p className="mx-auto mt-3 max-w-3xl text-center font-mono text-[10px] uppercase tracking-[0.14em] text-muted-ink">
        Enter to send · Shift + Enter for a new line
      </p>
    </div>
  );
}
