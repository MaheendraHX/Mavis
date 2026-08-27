import {
  AlertTriangleIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  Code2Icon,
  FileCode2Icon,
  LoaderCircleIcon,
  PlayIcon,
  RotateCcwIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type {
  CodingProposal,
  CodingVerificationResult,
} from "@/lib/mavis/coding";

import { CodePreview } from "./CodePreview";

type WorkspaceFile = { path: string; size: number };

type CodingWorkspaceProps = {
  apiUrl: (path: string) => string;
  workspacePath?: string;
  workspaceKind?: "mavis" | "temporary";
  ownerSession: string;
  selectedFiles: string[];
  onSelectedFilesChange: (files: string[]) => void;
  proposal?: CodingProposal;
  disabled?: boolean;
  onApply: (proposalId: string) => Promise<void>;
  onVerify: (proposalId: string, command: string) => Promise<void>;
  onRollback: (proposalId: string) => Promise<void>;
};

const verificationLabels: Record<string, string> = {
  frontend_build: "Build frontend",
  backend_tests: "Run backend tests",
  deployment_tests: "Run deployment checks",
  project_scan: "Scan uploaded project",
  json_validate: "Validate JSON files",
};

export function CodingWorkspace({
  apiUrl,
  workspacePath = "/coding/workspace",
  workspaceKind = "mavis",
  ownerSession,
  selectedFiles,
  onSelectedFilesChange,
  proposal,
  disabled = false,
  onApply,
  onVerify,
  onRollback,
}: CodingWorkspaceProps) {
  const [files, setFiles] = useState<WorkspaceFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [workspaceError, setWorkspaceError] = useState("");
  const [openDiffs, setOpenDiffs] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState("");
  const [action, setAction] = useState<"apply" | "rollback" | string>("");

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setWorkspaceError("");
      try {
        const response = await fetch(apiUrl(workspacePath), {
          headers: { "X-Mavis-Session": ownerSession },
          signal: controller.signal,
        });
        const body = (await response.json().catch(() => ({}))) as {
          files?: WorkspaceFile[];
          detail?: string;
        };
        if (!response.ok)
          throw new Error(
            body.detail || "Mavis could not open the coding workspace.",
          );
        const nextFiles = (body.files ?? []).filter(
          (file) => file.path && Number.isFinite(file.size),
        );
        setFiles(nextFiles);
        onSelectedFilesChange(
          selectedFiles.filter((path) =>
            nextFiles.some((file) => file.path === path),
          ),
        );
      } catch (error) {
        if (controller.signal.aborted) return;
        setWorkspaceError(
          error instanceof Error
            ? error.message
            : "Mavis could not open the coding workspace.",
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void load();
    return () => controller.abort();
    // The callback only updates the active thread; refetch on mode/owner change instead.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiUrl, ownerSession, workspacePath]);

  const visibleFiles = useMemo(() => {
    const defaultFiles = files.filter(
      (file) =>
        /^(api|package|README|vite|tsconfig|tailwind|test_)/.test(file.path) ||
        /^frontend\/src\/(routes|components\/chat|lib\/mavis|data|hooks)\//.test(
          file.path,
        ),
    );
    const needle = filter.trim().toLowerCase();
    const pool = needle || workspaceKind === "temporary" ? files : defaultFiles;
    return pool
      .filter((file) => file.path.toLowerCase().includes(needle))
      .slice(0, 120);
  }, [files, filter, workspaceKind]);

  const toggleFile = (path: string) => {
    if (disabled) return;
    if (selectedFiles.includes(path)) {
      onSelectedFilesChange(selectedFiles.filter((item) => item !== path));
      return;
    }
    if (selectedFiles.length >= 6) return;
    onSelectedFilesChange([...selectedFiles, path]);
  };

  const requestAction = async (
    kind: "apply" | "rollback" | string,
    callback: () => Promise<void>,
    confirmation?: string,
  ) => {
    if (confirmation && !window.confirm(confirmation)) return;
    setAction(kind);
    try {
      await callback();
    } finally {
      setAction("");
    }
  };

  return (
    <section
      className="mavis-glass mx-auto mb-5 max-w-3xl overflow-hidden rounded-2xl border border-violet/35 bg-panel/75 shadow-soft"
      aria-label="Coding workspace"
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line/80 bg-violet/8 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-violet/35 bg-violet/15 text-violet">
            <Code2Icon className="h-4 w-4" />
          </span>
          <div>
            <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-violet">
              {workspaceKind === "temporary"
                ? "Temporary project mode"
                : "Mavis repository mode"}
            </p>
            <p className="mt-0.5 text-xs text-muted-ink">
              {workspaceKind === "temporary"
                ? "Isolated upload · plan · approve · download. Nothing touches Mavis’s repository."
                : "Generate or inspect → review → approve → verify. Mavis cannot write without your approval."}
            </p>
          </div>
        </div>
        <span className="rounded-full border border-line bg-cream/80 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.13em] text-muted-ink">
          {selectedFiles.length}/6 files
        </span>
      </header>

      {loading ? (
        <div className="flex items-center gap-2 px-4 py-5 text-sm text-muted-ink">
          <LoaderCircleIcon className="h-4 w-4 animate-spin text-violet" />
          {workspaceKind === "temporary"
            ? "Opening the uploaded project…"
            : "Opening the private workspace…"}
        </div>
      ) : workspaceError ? (
        <div className="flex gap-2 px-4 py-4 text-sm leading-relaxed text-[#8f3f38]">
          <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{workspaceError}</p>
        </div>
      ) : (
        <div className="p-3">
          <div className="flex flex-wrap items-center justify-between gap-2 px-1 pb-2">
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-ink">
              {workspaceKind === "mavis"
                ? "Select files to edit, or select none to generate new code"
                : "Select files to edit, or select none to generate a new file"}
            </p>
            <input
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              placeholder="Filter files…"
              className="w-36 rounded-lg border border-line bg-cream/70 px-2.5 py-1.5 text-xs text-ink outline-none placeholder:text-muted-ink focus:border-violet/60"
            />
          </div>
          <div className="scroll-slim max-h-48 overflow-y-auto rounded-xl border border-line/80 bg-cream/45 p-1.5">
            {visibleFiles.length ? (
              visibleFiles.map((file) => {
                const selected = selectedFiles.includes(file.path);
                return (
                  <button
                    key={file.path}
                    type="button"
                    disabled={disabled}
                    onClick={() => toggleFile(file.path)}
                    className={`flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-left transition-colors ${selected ? "bg-violet/13 text-ink" : "text-muted-ink hover:bg-panel-raised hover:text-ink"}`}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${selected ? "border-violet bg-violet text-cream" : "border-line bg-cream"}`}
                      >
                        {selected && <CheckIcon className="h-3 w-3" />}
                      </span>
                      <FileCode2Icon className="h-3.5 w-3.5 shrink-0 text-sage" />
                      <span className="truncate font-mono text-[11px]">
                        {file.path}
                      </span>
                    </span>
                    <span className="shrink-0 font-mono text-[9px] text-muted-ink">
                      {Math.max(1, Math.ceil(file.size / 1024))} KB
                    </span>
                  </button>
                );
              })
            ) : (
              <p className="px-2.5 py-3 text-sm text-muted-ink">
                No eligible source files were found in this workspace.
              </p>
            )}
          </div>
          <p className="px-1 pt-2 text-xs leading-relaxed text-muted-ink">
            {workspaceKind === "temporary"
              ? "Choose only the uploaded files relevant to this change. Mavis will create a reviewable proposal, never modify your Mavis repository, and let you download the edited project afterward."
              : "Need something from scratch? Select no files and describe what to build below. To change existing code, pick the smallest relevant set. Mavis will show the generated files and a reviewable proposal before writing anything."}
          </p>
        </div>
      )}

      {proposal && (
        <div className="border-t border-line/80 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="h-4 w-4 text-sage" />
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-sage">
                  Proposal {proposal.status.replace("_", " ")}
                </p>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-ink">
                {proposal.summary}
              </p>
            </div>
            <span className="rounded-full border border-line bg-cream/70 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.13em] text-muted-ink">
              {proposal.provider} plan
            </span>
          </div>

          <ol className="mt-3 space-y-1.5 border-l border-violet/25 pl-4 text-sm leading-relaxed text-muted-ink">
            {proposal.plan.map((step, index) => (
              <li key={`${index}-${step}`}>
                <span className="mr-2 font-mono text-[10px] text-violet">
                  {index + 1}.
                </span>
                {step}
              </li>
            ))}
          </ol>

          {proposal.questions.length > 0 && (
            <div className="mt-4 rounded-xl border border-tan/35 bg-tan/10 px-3 py-2.5 text-sm text-ink">
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-ink">
                Mavis needs clarification
              </p>
              <ul className="mt-1.5 space-y-1">
                {proposal.questions.map((question) => (
                  <li key={question}>— {question}</li>
                ))}
              </ul>
            </div>
          )}

          {proposal.proposedChanges.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-ink">
                Proposed changes
              </p>
              {proposal.proposedChanges.map((change) => (
                <div
                  key={change.path}
                  className="rounded-xl border border-line/80 bg-cream/45 p-3"
                >
                  <div className="flex gap-2">
                    <FileCode2Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sage" />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-mono text-[11px] text-ink">
                          {change.path}
                        </p>
                        {change.operation === "create" && (
                          <span className="rounded-full border border-mint/35 bg-mint/10 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.12em] text-sage">
                            New file
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-muted-ink">
                        {change.explanation}
                      </p>
                    </div>
                  </div>
                  {change.operation === "create" && change.content && (
                    <div className="mt-2">
                      <CodePreview
                        code={change.content}
                        language={change.path.split(".").pop() ?? "text"}
                        tone="light"
                      />
                    </div>
                  )}
                  {proposal.diffs.find((diff) => diff.path === change.path)
                    ?.diff && (
                    <button
                      type="button"
                      onClick={() =>
                        setOpenDiffs((current) => ({
                          ...current,
                          [change.path]: !current[change.path],
                        }))
                      }
                      className="mt-2 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.13em] text-violet hover:text-ink"
                    >
                      {openDiffs[change.path] ? (
                        <ChevronUpIcon className="h-3 w-3" />
                      ) : (
                        <ChevronDownIcon className="h-3 w-3" />
                      )}
                      {openDiffs[change.path] ? "Hide diff" : "Review diff"}
                    </button>
                  )}
                  {openDiffs[change.path] && (
                    <pre className="scroll-slim mt-2 max-h-56 overflow-auto rounded-lg bg-night p-3 text-left font-mono text-[11px] leading-relaxed text-cream/80">
                      {
                        proposal.diffs.find((diff) => diff.path === change.path)
                          ?.diff
                      }
                    </pre>
                  )}
                </div>
              ))}
            </div>
          )}

          {proposal.status === "pending" &&
            proposal.proposedChanges.length > 0 && (
              <button
                type="button"
                disabled={disabled || action === "apply"}
                onClick={() =>
                  void requestAction(
                    "apply",
                    () => onApply(proposal.proposalId),
                    workspaceKind === "temporary"
                      ? "Apply this reviewed proposal to the isolated temporary upload? Mavis will create a checkpoint first, and your original files on your computer remain unchanged."
                      : "Apply this reviewed proposal to the private workspace? A checkpoint will be created first, so you can undo it.",
                  )
                }
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-violet to-tan px-3.5 py-2.5 text-sm font-medium text-night shadow-soft transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {action === "apply" ? (
                  <LoaderCircleIcon className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckIcon className="h-4 w-4" />
                )}
                Approve &{" "}
                {proposal.proposedChanges.some(
                  (change) => change.operation === "create",
                )
                  ? "create / apply"
                  : "apply"}{" "}
                {proposal.proposedChanges.length} change
                {proposal.proposedChanges.length === 1 ? "" : "s"}
              </button>
            )}

          {proposal.status === "applied" && (
            <div className="mt-4 rounded-xl border border-sage/35 bg-sage/10 p-3">
              <p className="text-sm text-ink">
                {workspaceKind === "temporary"
                  ? "Changes applied to the isolated upload: "
                  : "Changes applied to "}
                <span className="font-mono text-xs">
                  {proposal.changedFiles.join(", ")}
                </span>
                . Run the recommended checks before trusting the result.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {proposal.verification.map((command) => (
                  <button
                    key={command}
                    type="button"
                    disabled={disabled || Boolean(action)}
                    onClick={() =>
                      void requestAction(command, () =>
                        onVerify(proposal.proposalId, command),
                      )
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg border border-sage/45 bg-cream/80 px-3 py-2 text-xs text-ink transition-colors hover:bg-panel-raised disabled:opacity-60"
                  >
                    {action === command ? (
                      <LoaderCircleIcon className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <PlayIcon className="h-3.5 w-3.5 text-sage" />
                    )}
                    {verificationLabels[command] ?? command}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={disabled || Boolean(action)}
                  onClick={() =>
                    void requestAction(
                      "rollback",
                      () => onRollback(proposal.proposalId),
                      "Undo this proposal and restore its checkpointed files?",
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg border border-peach/45 bg-cream/80 px-3 py-2 text-xs text-ink transition-colors hover:bg-panel-raised disabled:opacity-60"
                >
                  {action === "rollback" ? (
                    <LoaderCircleIcon className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RotateCcwIcon className="h-3.5 w-3.5 text-peach" />
                  )}
                  Undo changes
                </button>
              </div>
              {proposal.verificationResults.map(
                (result: CodingVerificationResult, index) => (
                  <pre
                    key={`${result.command}-${index}`}
                    className={`scroll-slim mt-3 max-h-52 overflow-auto rounded-lg border p-3 text-left font-mono text-[11px] leading-relaxed ${result.success === true ? "border-sage/30 bg-sage/8 text-ink" : result.success === false ? "border-peach/35 bg-peach/10 text-[#8f3f38]" : "border-violet/30 bg-violet/8 text-ink"}`}
                  >
                    {result.success === true
                      ? "PASS"
                      : result.success === false
                        ? "FAILED"
                        : "NOT RUN"}{" "}
                    · {verificationLabels[result.command] ?? result.command}
                    {"\n\n"}
                    {result.output}
                  </pre>
                ),
              )}
            </div>
          )}

          {proposal.status === "rolled_back" && (
            <p className="mt-4 rounded-xl border border-violet/30 bg-violet/8 px-3 py-2.5 text-sm text-ink">
              The proposal was undone and the checkpointed files were restored.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
