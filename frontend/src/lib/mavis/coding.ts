export type CodingChange = {
  path: string;
  operation: "replace" | "create";
  explanation: string;
};

export type CodingDiff = {
  path: string;
  diff: string;
};

export type CodingVerificationResult = {
  command: string;
  label: string;
  success: boolean;
  exit_code: number | null;
  output: string;
};

export type CodingProposal = {
  proposalId: string;
  summary: string;
  plan: string[];
  questions: string[];
  proposedChanges: CodingChange[];
  diffs: CodingDiff[];
  verification: string[];
  provider: string;
  status: "pending" | "applied" | "rolled_back";
  changedFiles: string[];
  checkpointId?: string | null;
  verificationResults: CodingVerificationResult[];
};

export type CodingState = {
  enabled: boolean;
  selectedFiles: string[];
  proposal?: CodingProposal;
};

export const emptyCodingState = (): CodingState => ({
  enabled: false,
  selectedFiles: [],
});

type UnknownRecord = Record<string, unknown>;

const asRecord = (value: unknown): UnknownRecord =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : {};

const stringList = (value: unknown, max = 12) =>
  Array.isArray(value)
    ? value
        .filter(
          (item): item is string =>
            typeof item === "string" && item.trim().length > 0,
        )
        .slice(0, max)
    : [];

export function codingProposalFromApi(value: unknown): CodingProposal {
  const data = asRecord(value);
  const proposedChanges = Array.isArray(data.proposed_changes)
    ? data.proposed_changes
        .map(asRecord)
        .filter((change) => typeof change.path === "string")
        .map((change) => ({
          path: String(change.path),
          operation: change.operation === "create" ? "create" : "replace",
          explanation:
            typeof change.explanation === "string"
              ? change.explanation
              : "Focused code update.",
        }))
    : [];
  const diffs = Array.isArray(data.diffs)
    ? data.diffs
        .map(asRecord)
        .filter(
          (diff) =>
            typeof diff.path === "string" && typeof diff.diff === "string",
        )
        .map((diff) => ({ path: String(diff.path), diff: String(diff.diff) }))
    : [];
  return {
    proposalId: typeof data.proposal_id === "string" ? data.proposal_id : "",
    summary:
      typeof data.summary === "string"
        ? data.summary
        : "Mavis reviewed the selected files.",
    plan: stringList(data.plan, 8),
    questions: stringList(data.questions, 5),
    proposedChanges,
    diffs,
    verification: stringList(data.verification, 3),
    provider: typeof data.provider === "string" ? data.provider : "Mavis",
    status:
      data.status === "applied" || data.status === "rolled_back"
        ? data.status
        : "pending",
    changedFiles: stringList(data.changed_files, 12),
    checkpointId:
      typeof data.checkpoint_id === "string" ? data.checkpoint_id : null,
    verificationResults: [],
  };
}

export function codingVerificationFromApi(
  value: unknown,
): CodingVerificationResult {
  const data = asRecord(value);
  return {
    command: typeof data.command === "string" ? data.command : "verification",
    label: typeof data.label === "string" ? data.label : "Verification",
    success: data.success === true,
    exit_code: typeof data.exit_code === "number" ? data.exit_code : null,
    output:
      typeof data.output === "string"
        ? data.output
        : "Mavis did not return verification output.",
  };
}
