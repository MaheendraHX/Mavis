export type Feature = {
  index: string;
  title: string;
  description: string;
  icon: "layers" | "search" | "brain" | "code" | "shield" | "zap";
};

export const features: Feature[] = [
  {
    index: "01",
    title: "Multimodal understanding",
    description:
      "Drop in an image, a PDF or a text file. Mavis reads the attachment and answers in the same breath.",
    icon: "layers",
  },
  {
    index: "02",
    title: "Real-time web search",
    description:
      "Toggle the web on and Mavis searches live, then shows the exact pages the answer came from.",
    icon: "search",
  },
  {
    index: "03",
    title: "Threads that stick",
    description:
      "Every conversation is saved in your browser, renamed from your first message, and yours to delete.",
    icon: "brain",
  },
  {
    index: "04",
    title: "Code that renders",
    description:
      "Syntax-highlighted markdown, copyable code blocks and a one-tap regenerate when a reply misses.",
    icon: "code",
  },
  {
    index: "05",
    title: "Incognito mode",
    description:
      "Flip incognito and the thread never touches storage — it disappears when you close the tab.",
    icon: "shield",
  },
  {
    index: "06",
    title: "Fast or deep",
    description:
      "Switch between a fast model and a deeper reasoning model mid-conversation without losing the thread.",
    icon: "zap",
  },
];

export const steps = [
  {
    step: "One",
    title: "Start a conversation",
    description: "Open a thread. No account, no setup, no onboarding maze.",
  },
  {
    step: "Two",
    title: "Attach or ask",
    description: "Type a question, paste a link, or attach a file. Pick a persona if you like.",
  },
  {
    step: "Three",
    title: "Get results",
    description: "Cited answers, runnable code, organized by thread and saved locally.",
  },
];

export const techStack = [
  "React 19",
  "TanStack Start",
  "Lovable AI",
  "Gemini",
  "Tailwind",
  "Motion",
  "Vite",
  "TypeScript",
];

export const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Tech", href: "#tech" },
];
