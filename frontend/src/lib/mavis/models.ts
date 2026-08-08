export type ModelId = "google/gemini-3.6-flash" | "google/gemini-3.1-pro-preview";

export const MODELS: { id: ModelId; label: string; hint: string }[] = [
  { id: "google/gemini-3.6-flash", label: "Fast", hint: "Quick everyday answers" },
  { id: "google/gemini-3.1-pro-preview", label: "Deep", hint: "Harder reasoning, slower" },
];

export const DEFAULT_MODEL: ModelId = "google/gemini-3.6-flash";

export function isModelId(value: unknown): value is ModelId {
  return MODELS.some((m) => m.id === value);
}
