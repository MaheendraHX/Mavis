import {
  DownloadIcon,
  FileArchiveIcon,
  LoaderCircleIcon,
  ShieldCheckIcon,
  Trash2Icon,
  UploadCloudIcon,
} from "lucide-react";
import { useRef, useState, type ChangeEvent } from "react";
import { toast } from "sonner";

import type { TemporaryProject } from "@/lib/mavis/coding";

type TemporaryProjectWorkspaceProps = {
  apiUrl: (path: string) => string;
  ownerSession: string;
  project?: TemporaryProject;
  disabled?: boolean;
  onProjectChange: (project?: TemporaryProject) => void;
  onSelectedFilesChange: (files: string[]) => void;
};

const MAX_PROJECT_FILES = 60;
const MAX_FILE_BYTES = 120 * 1024;

const requestError = async (response: Response) => {
  const body = (await response.json().catch(() => ({}))) as { detail?: string };
  return body.detail || "Mavis could not process that temporary project.";
};

export function TemporaryProjectWorkspace({
  apiUrl,
  ownerSession,
  project,
  disabled = false,
  onProjectChange,
  onSelectedFilesChange,
}: TemporaryProjectWorkspaceProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [action, setAction] = useState<"upload" | "download" | "delete" | "">(
    "",
  );

  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length || disabled) return;
    if (files.length > MAX_PROJECT_FILES) {
      toast.error(`Choose no more than ${MAX_PROJECT_FILES} files.`);
      return;
    }
    const oversized = files.find((file) => file.size > MAX_FILE_BYTES);
    if (oversized) {
      toast.error(
        `${oversized.name} is larger than 120 KB. Choose smaller source files.`,
      );
      return;
    }

    setAction("upload");
    try {
      if (project) {
        await fetch(
          apiUrl(`/temporary-projects/${project.projectId}?confirm=true`),
          {
            method: "DELETE",
            headers: { "X-Mavis-Session": ownerSession },
          },
        );
      }
      const form = new FormData();
      files.forEach((file) => form.append("files", file, file.name));
      const response = await fetch(apiUrl("/temporary-projects"), {
        method: "POST",
        headers: { "X-Mavis-Session": ownerSession },
        body: form,
      });
      if (!response.ok) throw new Error(await requestError(response));
      const body = (await response.json()) as {
        project_id?: string;
        files?: unknown[];
        expires_in_seconds?: number;
      };
      if (!body.project_id)
        throw new Error("Mavis did not return a temporary project identifier.");
      onSelectedFilesChange([]);
      onProjectChange({
        projectId: body.project_id,
        fileCount: Array.isArray(body.files) ? body.files.length : files.length,
        expiresInSeconds:
          typeof body.expires_in_seconds === "number"
            ? body.expires_in_seconds
            : 7_200,
      });
      toast.success(
        "Temporary project ready. Choose the files Mavis may inspect.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Mavis could not upload that temporary project.",
      );
    } finally {
      setAction("");
    }
  };

  const download = async () => {
    if (!project || disabled) return;
    setAction("download");
    try {
      const response = await fetch(
        apiUrl(`/temporary-projects/${project.projectId}/download`),
        { headers: { "X-Mavis-Session": ownerSession } },
      );
      if (!response.ok) throw new Error(await requestError(response));
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "mavis-edited-project.zip";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Edited temporary project downloaded.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Mavis could not download that project.",
      );
    } finally {
      setAction("");
    }
  };

  const remove = async () => {
    if (!project || disabled) return;
    if (
      !window.confirm(
        "Delete this temporary upload now? This cannot be undone, but your original files on your computer are unchanged.",
      )
    )
      return;
    setAction("delete");
    try {
      const response = await fetch(
        apiUrl(`/temporary-projects/${project.projectId}?confirm=true`),
        { method: "DELETE", headers: { "X-Mavis-Session": ownerSession } },
      );
      if (!response.ok && response.status !== 404)
        throw new Error(await requestError(response));
      onSelectedFilesChange([]);
      onProjectChange(undefined);
      toast.success("Temporary upload deleted.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Mavis could not delete that temporary project.",
      );
    } finally {
      setAction("");
    }
  };

  return (
    <section
      className="mavis-glass mx-auto mb-3 max-w-3xl rounded-2xl border border-sage/35 bg-panel/75 p-4 shadow-soft"
      aria-label="Temporary project upload"
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".html,.css,.js,.jsx,.ts,.tsx,.py,.json,.md,.yaml,.yml,.toml,.txt,.sh"
        onChange={upload}
        className="hidden"
      />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-sage/35 bg-sage/12 text-sage">
            <FileArchiveIcon className="h-4 w-4" />
          </span>
          <div>
            <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-sage">
              Temporary project
            </p>
            <p className="mt-0.5 max-w-xl text-xs leading-relaxed text-muted-ink">
              Upload a small set of code files for an isolated, time-limited
              workspace. Mavis never changes your original files or her own
              repository.
            </p>
          </div>
        </div>
        {project && (
          <span className="rounded-full border border-line bg-cream/80 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.13em] text-muted-ink">
            {project.fileCount} files · expires in{" "}
            {Math.max(1, Math.ceil(project.expiresInSeconds / 3_600))}h
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={disabled || Boolean(action)}
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-xl border border-sage/40 bg-sage/10 px-3 py-2 text-xs font-medium text-ink transition-colors hover:bg-sage/18 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {action === "upload" ? (
            <LoaderCircleIcon className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <UploadCloudIcon className="h-3.5 w-3.5 text-sage" />
          )}
          {project ? "Replace upload" : "Upload project files"}
        </button>
        {project && (
          <>
            <button
              type="button"
              disabled={disabled || Boolean(action)}
              onClick={() => void download()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-cream/80 px-3 py-2 text-xs text-ink transition-colors hover:bg-panel-raised disabled:opacity-60"
            >
              {action === "download" ? (
                <LoaderCircleIcon className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <DownloadIcon className="h-3.5 w-3.5 text-sage" />
              )}
              Download current copy
            </button>
            <button
              type="button"
              disabled={disabled || Boolean(action)}
              onClick={() => void remove()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-peach/45 bg-cream/80 px-3 py-2 text-xs text-ink transition-colors hover:bg-panel-raised disabled:opacity-60"
            >
              {action === "delete" ? (
                <LoaderCircleIcon className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2Icon className="h-3.5 w-3.5 text-peach" />
              )}
              Delete upload
            </button>
          </>
        )}
      </div>
      <p className="mt-3 flex items-start gap-1.5 text-xs leading-relaxed text-muted-ink">
        <ShieldCheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sage" />
        Up to 60 UTF-8 text files, 120 KB each, 1.2 MB total. Secret files,
        environment files, dependencies, binaries, archives, and executable
        checks are blocked.
      </p>
    </section>
  );
}
