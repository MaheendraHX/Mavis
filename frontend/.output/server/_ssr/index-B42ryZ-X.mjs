import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { m as motion } from "../_libs/motion.mjs";
import { W as Wordmark } from "./Wordmark-BLmfL50g.mjs";
import { A as ArrowUpRight, X, M as Menu, a as ArrowRight, S as Sparkles, P as Paperclip, G as Globe, Z as Zap, b as ShieldCheck, C as Code, B as Brain, c as Search, L as Layers } from "../_libs/lucide-react.mjs";
import { A as AnimatePresence } from "../_libs/framer-motion.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/unenv.mjs";



import "../_libs/seroval-plugins.mjs";


import "../_libs/react-dom.mjs";
import "../_libs/scheduler.mjs";
import "../_libs/isbot.mjs";
import "../_libs/motion-dom.mjs";
import "../_libs/motion-utils.mjs";
function Reveal({ children, delay = 0, className = "" }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    motion.div,
    {
      className,
      initial: { opacity: 0, y: 18 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true, margin: "-80px" },
      transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
      children
    }
  );
}
function CallToAction() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "bg-night py-24 sm:py-32", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto max-w-3xl px-6 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Reveal, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-display text-[clamp(2.25rem,5.5vw,3.75rem)] leading-[1.02] tracking-[-0.02em] text-cream", children: [
      "Ask it something",
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-tan italic", children: " hard." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-cream/60", children: "The demo is open. No account, no credit card — just a thread and a blinking cursor." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Link,
      {
        to: "/chat",
        className: "group mt-10 inline-flex items-center gap-2 rounded-full bg-cream px-7 py-3.5 text-sm font-medium text-ink transition-colors hover:bg-peach hover:text-cream",
        children: [
          "Open Mavis",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4 transition-transform group-hover:translate-x-1" })
        ]
      }
    )
  ] }) }) });
}
const features = [
  {
    index: "01",
    title: "Multimodal understanding",
    description: "Drop in an image, a PDF or a text file. Mavis reads the attachment and answers in the same breath.",
    icon: "layers"
  },
  {
    index: "02",
    title: "Real-time web search",
    description: "Toggle the web on and Mavis searches live, then shows the exact pages the answer came from.",
    icon: "search"
  },
  {
    index: "03",
    title: "Threads that stick",
    description: "Every conversation is saved in your browser, renamed from your first message, and yours to delete.",
    icon: "brain"
  },
  {
    index: "04",
    title: "Code that renders",
    description: "Syntax-highlighted markdown, copyable code blocks and a one-tap regenerate when a reply misses.",
    icon: "code"
  },
  {
    index: "05",
    title: "Incognito mode",
    description: "Flip incognito and the thread never touches storage — it disappears when you close the tab.",
    icon: "shield"
  },
  {
    index: "06",
    title: "Fast or deep",
    description: "Switch between a fast model and a deeper reasoning model mid-conversation without losing the thread.",
    icon: "zap"
  }
];
const steps = [
  {
    step: "One",
    title: "Start a conversation",
    description: "Open a thread. No account, no setup, no onboarding maze."
  },
  {
    step: "Two",
    title: "Attach or ask",
    description: "Type a question, paste a link, or attach a file. Pick a persona if you like."
  },
  {
    step: "Three",
    title: "Get results",
    description: "Cited answers, runnable code, organized by thread and saved locally."
  }
];
const techStack = [
  "React 19",
  "TanStack Start",
  "Lovable AI",
  "Gemini",
  "Tailwind",
  "Motion",
  "Vite",
  "TypeScript"
];
const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Tech", href: "#tech" }
];
const icons = {
  layers: Layers,
  search: Search,
  brain: Brain,
  code: Code,
  shield: ShieldCheck,
  zap: Zap
};
function Features() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "features", className: "scroll-mt-24 border-b border-line bg-cream py-24 sm:py-32", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-6xl px-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Reveal, { className: "max-w-2xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[11px] uppercase tracking-[0.2em] text-peach", children: "Features" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 font-display text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.05] tracking-[-0.02em] text-ink", children: "Everything an assistant should have already done." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-16 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3", children: features.map((feature, i) => {
      const Icon = icons[feature.icon];
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Reveal, { delay: i * 0.05, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "group h-full bg-cream p-8 transition-colors hover:bg-white", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-ink transition-colors group-hover:border-peach group-hover:text-peach", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[11px] tracking-[0.14em] text-line group-hover:text-tan", children: feature.index })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-6 font-display text-xl text-ink", children: feature.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm leading-relaxed text-muted-ink", children: feature.description })
      ] }) }, feature.index);
    }) })
  ] }) });
}
function Footer() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("footer", { className: "border-t border-line bg-cream", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "text-sm", "aria-label": "Mavis home", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Wordmark, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { "aria-label": "Footer", className: "flex flex-wrap items-center gap-6", children: [
      navLinks.map((link) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "a",
        {
          href: link.href,
          className: "text-xs text-muted-ink transition-colors hover:text-ink",
          children: link.label
        },
        link.href
      )),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/chat", className: "text-xs text-muted-ink transition-colors hover:text-ink", children: "Demo" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-mono text-[10px] uppercase tracking-[0.16em] text-muted-ink", children: [
      "© ",
      (/* @__PURE__ */ new Date()).getFullYear(),
      " Mavis"
    ] })
  ] }) });
}
const orb = "/assets/mavis-orb-BjYjbZdY.jpg";
const ease = [0.22, 1, 0.36, 1];
function Hero() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "relative overflow-hidden border-b border-line bg-cream pt-32 sm:pt-40", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hairline-grid pointer-events-none absolute inset-x-0 top-0 hidden h-full opacity-60 lg:block" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mx-auto grid max-w-6xl items-center gap-16 px-6 pb-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:pb-28", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            initial: { opacity: 0, y: 12 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.5, ease },
            className: "inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "relative flex h-1.5 w-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute inline-flex h-full w-full animate-ping rounded-full bg-sage opacity-75" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "relative inline-flex h-1.5 w-1.5 rounded-full bg-sage" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[11px] uppercase tracking-[0.18em] text-muted-ink", children: "Now in public demo" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.h1,
          {
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.7, delay: 0.06, ease },
            className: "mt-7 font-display text-[clamp(3rem,7.5vw,5.25rem)] leading-[0.95] font-normal tracking-[-0.02em] text-ink",
            children: [
              "Your AI,",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-peach italic", children: "amplified." })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.p,
          {
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.7, delay: 0.14, ease },
            className: "mt-7 max-w-lg text-[17px] leading-relaxed text-muted-ink",
            children: "Mavis searches the live web, reads your files, writes code, and keeps every conversation organized in one warm, quiet workspace."
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.7, delay: 0.22, ease },
            className: "mt-10 flex flex-wrap items-center gap-3",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Link,
                {
                  to: "/chat",
                  className: "group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-medium text-cream shadow-soft transition-colors hover:bg-peach",
                  children: [
                    "Start chatting",
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4 transition-transform group-hover:translate-x-1" })
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "a",
                {
                  href: "#features",
                  className: "inline-flex items-center gap-2 rounded-full border border-line bg-white px-6 py-3.5 text-sm font-medium text-ink transition-colors hover:bg-sand",
                  children: "See features"
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.dl,
          {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            transition: { duration: 0.8, delay: 0.35 },
            className: "mt-14 flex flex-wrap gap-x-12 gap-y-6 border-t border-line pt-8",
            children: [
              { value: "Two", label: "model modes" },
              { value: "4", label: "personas" },
              { value: "0", label: "setup steps" }
            ].map((stat) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "font-display text-2xl text-ink", children: stat.value }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-ink", children: stat.label })
            ] }, stat.label))
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          initial: { opacity: 0, scale: 0.97 },
          animate: { opacity: 1, scale: 1 },
          transition: { duration: 0.9, delay: 0.1, ease },
          className: "relative",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grain relative overflow-hidden rounded-[28px] border border-line bg-sand shadow-lift", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              motion.img,
              {
                src: orb,
                alt: "A soft sculptural sphere in tan and peach, lit from one edge",
                className: "aspect-square w-full object-cover",
                animate: { y: [0, -10, 0] },
                transition: { duration: 7, repeat: Infinity, ease: "easeInOut" }
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              motion.div,
              {
                initial: { opacity: 0, y: 16 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 0.7, delay: 0.5, ease },
                className: "absolute -bottom-6 -left-4 w-[85%] max-w-sm rounded-2xl border border-line bg-white p-4 shadow-lift sm:-left-8",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 border-b border-line pb-3", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3.5 w-3.5 text-peach" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[10px] uppercase tracking-[0.16em] text-muted-ink", children: "Live thread" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-[13px] leading-relaxed text-ink", children: "“Read this contract and flag anything unusual about the renewal terms.”" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-center gap-3 text-muted-ink", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em]", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: "h-3 w-3" }),
                      " contract.pdf"
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em]", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { className: "h-3 w-3" }),
                      " web on"
                    ] })
                  ] })
                ]
              }
            )
          ]
        }
      )
    ] })
  ] });
}
function HowItWorks() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "section",
    {
      id: "how-it-works",
      className: "scroll-mt-24 border-b border-line bg-sand py-24 sm:py-32",
      children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto max-w-6xl px-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Reveal, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[11px] uppercase tracking-[0.2em] text-peach", children: "How it works" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 font-display text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.05] tracking-[-0.02em] text-ink", children: "Three steps, then out of your way." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { className: "relative border-l border-line/80", children: steps.map((step, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Reveal, { delay: i * 0.08, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "relative pb-12 pl-8 last:pb-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -left-[7px] top-1.5 h-3 w-3 rounded-full border border-tan bg-cream" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono text-[11px] uppercase tracking-[0.18em] text-muted-ink", children: [
            "Step ",
            step.step
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-2 font-display text-2xl text-ink", children: step.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 max-w-md text-sm leading-relaxed text-muted-ink", children: step.description })
        ] }) }, step.step)) })
      ] }) })
    }
  );
}
function Nav() {
  const [open, setOpen] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "fixed inset-x-0 top-0 z-50 border-b border-line/70 bg-cream/85 backdrop-blur-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex h-16 max-w-6xl items-center justify-between px-6 sm:h-20", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "text-base sm:text-lg", "aria-label": "Mavis home", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Wordmark, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { "aria-label": "Main", className: "hidden items-center gap-9 md:flex", children: [
        navLinks.map((link) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "a",
          {
            href: link.href,
            className: "text-sm text-muted-ink transition-colors hover:text-ink",
            children: link.label
          },
          link.href
        )),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Link,
          {
            to: "/chat",
            className: "group inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-peach",
            children: [
              "Try Mavis",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpRight, { className: "h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => setOpen((v) => !v),
          "aria-expanded": open,
          "aria-label": open ? "Close menu" : "Open menu",
          className: "flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink transition-colors hover:bg-sand md:hidden",
          children: open ? /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Menu, { className: "h-4 w-4" })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: open && /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { height: 0, opacity: 0 },
        animate: { height: "auto", opacity: 1 },
        exit: { height: 0, opacity: 0 },
        transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
        className: "overflow-hidden border-t border-line/70 bg-cream md:hidden",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { "aria-label": "Mobile", className: "flex flex-col gap-1 px-6 py-4", children: [
          navLinks.map((link) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "a",
            {
              href: link.href,
              onClick: () => setOpen(false),
              className: "rounded-xl px-2 py-3 text-sm text-muted-ink transition-colors hover:bg-sand hover:text-ink",
              children: link.label
            },
            link.href
          )),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Link,
            {
              to: "/chat",
              onClick: () => setOpen(false),
              className: "mt-2 inline-flex items-center justify-center gap-1.5 rounded-full bg-ink px-5 py-3 text-sm font-medium text-cream",
              children: [
                "Try Mavis",
                /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpRight, { className: "h-3.5 w-3.5" })
              ]
            }
          )
        ] })
      }
    ) })
  ] });
}
function TechStack() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "tech", className: "scroll-mt-24 border-b border-line bg-cream py-20 sm:py-24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto max-w-6xl px-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Reveal, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[11px] uppercase tracking-[0.2em] text-peach", children: "Built with" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-3 max-w-sm font-display text-2xl leading-snug text-ink", children: "A small, sharp stack — nothing you have to babysit." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Reveal, { delay: 0.08, className: "sm:max-w-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "flex flex-wrap gap-2", children: techStack.map((tech) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "li",
      {
        className: "rounded-full border border-line bg-white px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-ink transition-colors hover:border-tan hover:text-ink",
        children: tech
      },
      tech
    )) }) })
  ] }) }) });
}
function LandingPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen w-full bg-cream", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Nav, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Hero, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Features, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(HowItWorks, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TechStack, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CallToAction, {})
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, {})
  ] });
}
export {
  LandingPage as component
};
