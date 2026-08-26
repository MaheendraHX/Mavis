export type ModelId = "llama-3.1-8b-instant" | "llama-3.3-70b-versatile";

export const MODELS: { id: ModelId; label: string; hint: string }[] = [
  {
    id: "llama-3.1-8b-instant",
    label: "Swift",
    hint: "Fast, lightweight responses",
  },
  {
    id: "llama-3.3-70b-versatile",
    label: "Deep",
    hint: "More considered reasoning",
  },
];

export const DEFAULT_MODEL: ModelId = "llama-3.3-70b-versatile";

export function isModelId(value: unknown): value is ModelId {
  return MODELS.some((model) => model.id === value);
}
