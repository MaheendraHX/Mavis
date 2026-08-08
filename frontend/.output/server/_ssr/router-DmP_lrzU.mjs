import process from "node:process";
import { Q as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { Q as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { c as createRouter, a as createRootRouteWithContext, u as useRouter, L as Link, O as Outlet, H as HeadContent, S as Scripts, b as createFileRoute, l as lazyRouteComponent } from "../_libs/tanstack__react-router.mjs";
import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { T as Toaster$1 } from "../_libs/sonner.mjs";
import { s as streamText, c as convertToModelMessages, a as stepCountIs } from "../_libs/ai.mjs";
import { c as createOpenAICompatible } from "../_libs/ai-sdk__openai-compatible.mjs";
import { Q as tool } from "../_libs/ai-sdk__provider-utils.mjs";
import { o as object, c as string } from "../_libs/zod.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/unenv.mjs";


import "../_libs/seroval-plugins.mjs";


import "../_libs/react-dom.mjs";
import "../_libs/scheduler.mjs";
import "../_libs/isbot.mjs";
import "../_libs/ai-sdk__gateway.mjs";
import "../_libs/ai-sdk__provider.mjs";
import "../_libs/@vercel/oidc.mjs";



import "../_libs/opentelemetry__api.mjs";
import "../_libs/eventsource-parser.mjs";
const appCss = "/assets/styles-DjfogjNE.css";
const Toaster = ({ ...props }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Toaster$1,
    {
      className: "toaster group",
      toastOptions: {
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
        }
      },
      ...props
    }
  );
};
function reportLovableError(error, context = {}) {
  if (typeof window === "undefined") return;
  window.__lovableEvents?.captureException?.(
    error,
    {
      source: "react_error_boundary",
      route: window.location.pathname,
      ...context
    },
    {
      mechanism: "react_error_boundary",
      handled: false,
      severity: "error"
    }
  );
}
function NotFoundComponent() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-7xl font-bold text-foreground", children: "404" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 text-xl font-semibold text-foreground", children: "Page not found" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "The page you're looking for doesn't exist or has been moved." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Link,
      {
        to: "/",
        className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
        children: "Go home"
      }
    ) })
  ] }) });
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  const router2 = useRouter();
  reactExports.useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold tracking-tight text-foreground", children: "This page didn't load" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Something went wrong on our end. You can try refreshing or head back home." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => {
            router2.invalidate();
            reset();
          },
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
          children: "Try again"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "a",
        {
          href: "/",
          className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
          children: "Go home"
        }
      )
    ] })
  ] }) });
}
const Route$3 = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Mavis — Your AI, amplified" },
      {
        name: "description",
        content: "Mavis is a multimodal AI assistant with live web search, file reading and saved threads."
      },
      { name: "author", content: "Mavis" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" }
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..800;1,400..700&family=Inter:wght@300..700&family=JetBrains+Mono:wght@400;500&display=swap"
      }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("head", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  const { queryClient } = Route$3.useRouteContext();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(QueryClientProvider, { client: queryClient, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Toaster, { position: "top-center" })
  ] });
}
const $$splitComponentImporter$1 = () => import("./index-B42ryZ-X.mjs");
const Route$2 = createFileRoute()({
  head: () => ({
    meta: [{
      title: "Mavis — Your AI, amplified"
    }, {
      name: "description",
      content: "Mavis is a multimodal AI assistant that searches the live web, reads your files, writes code and keeps every thread organized."
    }, {
      property: "og:title",
      content: "Mavis — Your AI, amplified"
    }, {
      property: "og:description",
      content: "A multimodal AI assistant with live web search, file reading and saved threads. Open the demo, no account needed."
    }, {
      property: "og:type",
      content: "website"
    }, {
      name: "twitter:card",
      content: "summary_large_image"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./chat-CTyVdAJo.mjs");
const Route$1 = createFileRoute()({
  head: () => ({
    meta: [{
      title: "Chat with Mavis — multimodal AI assistant"
    }, {
      name: "description",
      content: "Open a Mavis thread: live web search with sources, file attachments, personas and locally saved conversations."
    }, {
      property: "og:title",
      content: "Chat with Mavis"
    }, {
      property: "og:description",
      content: "Live web search, attachments and saved threads in one quiet workspace."
    }, {
      property: "og:type",
      content: "website"
    }, {
      name: "twitter:card",
      content: "summary"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const createLovableAiGatewayProvider = (apiKey) => createOpenAICompatible({
  name: "lovable-ai-gateway",
  baseURL: "https://ai.gateway.lovable.dev/v1",
  headers: { "Lovable-API-Key": apiKey }
});
const MODELS = [
  { id: "google/gemini-3.6-flash", label: "Fast", hint: "Quick everyday answers" },
  { id: "google/gemini-3.1-pro-preview", label: "Deep", hint: "Harder reasoning, slower" }
];
const DEFAULT_MODEL = "google/gemini-3.6-flash";
function isModelId(value) {
  return MODELS.some((m) => m.id === value);
}
const PERSONAS = {
  default: {
    label: "Default",
    prompt: "You are Mavis, a warm, precise assistant. Be direct and useful, skip filler, and use markdown when it genuinely helps."
  },
  analyst: {
    label: "Analyst",
    prompt: "You are Mavis in analyst mode. Lead with the conclusion, then the evidence. Quantify when possible, flag assumptions and uncertainty, and prefer tables or tight bullet lists."
  },
  engineer: {
    label: "Engineer",
    prompt: "You are Mavis in engineer mode. Give working code first with correct language-tagged fenced blocks, then a short explanation. Mention edge cases, complexity and failure modes."
  },
  editor: {
    label: "Editor",
    prompt: "You are Mavis in editor mode. Improve clarity, rhythm and tone. Return the rewritten text first, then a brief note on what changed and why."
  }
};
const PERSONA_IDS = Object.keys(PERSONAS);
function isPersonaId(value) {
  return typeof value === "string" && value in PERSONAS;
}
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
function domainOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}
function stripTags(html) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ").trim();
}
async function serperSearch(query, key) {
  const res = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: { "X-API-KEY": key, "Content-Type": "application/json" },
    body: JSON.stringify({ q: query, num: 6 })
  });
  if (!res.ok) throw new Error(`Serper failed [${res.status}]: ${await res.text()}`);
  const data = await res.json();
  return (data.organic ?? []).slice(0, 6).map((r) => ({
    title: r.title ?? r.link ?? "Untitled",
    url: r.link ?? "",
    domain: domainOf(r.link ?? ""),
    snippet: r.snippet ?? ""
  }));
}
async function duckDuckGoSearch(query) {
  const res = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
    headers: { "User-Agent": UA, Accept: "text/html" }
  });
  if (!res.ok) throw new Error(`DuckDuckGo failed [${res.status}]`);
  const html = await res.text();
  const results = [];
  const linkRe = /<a[^>]+class="[^"]*result__a[^"]*"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
  let match;
  while ((match = linkRe.exec(html)) && results.length < 6) {
    let url = match[1];
    const uddg = /uddg=([^&]+)/.exec(url);
    if (uddg) url = decodeURIComponent(uddg[1]);
    if (!url.startsWith("http")) continue;
    results.push({
      title: stripTags(match[2]),
      url,
      domain: domainOf(url),
      snippet: ""
    });
  }
  return results;
}
async function searchWeb(query) {
  const serperKey = process.env["SERPER_API_KEY"];
  try {
    const results = serperKey ? await serperSearch(query, serperKey) : await duckDuckGoSearch(query);
    if (results.length === 0) {
      return {
        results: [],
        note: "The search provider returned no usable results. Answer from your own knowledge and say the web lookup came back empty."
      };
    }
    return { results };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("web search failed:", message);
    return {
      results: [],
      note: `Web search is unavailable right now (${message}). Answer from your own knowledge and tell the user the live lookup failed.`
    };
  }
}
async function readUrl(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`Could not fetch ${url} [${res.status}]`);
  const contentType = res.headers.get("content-type") ?? "";
  const body = await res.text();
  if (contentType.includes("html")) {
    const title = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(body)?.[1] ?? url;
    return { url, title: stripTags(title), text: stripTags(body).slice(0, 8e3) };
  }
  return { url, title: url, text: body.slice(0, 8e3) };
}
const BASE_PROMPT = `You are Mavis, a multimodal assistant.
- Answer in markdown. Use fenced code blocks with a language tag for code.
- When the web_search tool is available and the question touches on current events, prices, releases, versions or anything time-sensitive, search before answering and cite what you used inline.
- Use read_url whenever the user pastes a link or asks about a specific page.
- If the user attaches an image or document, read it before answering.
- Never invent sources or claim you searched when you did not.`;
const Route = createFileRoute()({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json();
        const { messages } = body;
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }
        const key = process.env["LOVABLE_API_KEY"];
        if (!key) {
          return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        }
        const persona = isPersonaId(body.persona) ? body.persona : "default";
        const modelId = isModelId(body.model) ? body.model : DEFAULT_MODEL;
        const webEnabled = body.webSearch !== false;
        const gateway = createLovableAiGatewayProvider(key);
        const tools = {
          read_url: tool({
            description: "Fetch a web page or plain-text document by URL and return its readable text.",
            inputSchema: object({ url: string().url() }),
            execute: async ({ url }) => readUrl(url)
          }),
          ...webEnabled ? {
            web_search: tool({
              description: "Search the live web. Returns titles, URLs and snippets to cite.",
              inputSchema: object({
                query: string().min(2).describe("Focused search query")
              }),
              execute: async ({ query }) => searchWeb(query)
            })
          } : {}
        };
        const result = streamText({
          model: gateway(modelId),
          system: `${BASE_PROMPT}

${PERSONAS[persona].prompt}${webEnabled ? "" : "\n\nWeb search is switched off for this message; do not claim to have searched."}`,
          messages: await convertToModelMessages(messages),
          tools,
          stopWhen: stepCountIs(8)
        });
        return result.toUIMessageStreamResponse({
          originalMessages: messages,
          onError: (error) => error instanceof Error ? error.message : "Something went wrong"
        });
      }
    }
  }
});
const IndexRoute = Route$2.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$3
});
const ChatRoute = Route$1.update({
  id: "/chat",
  path: "/chat",
  getParentRoute: () => Route$3
});
const ApiChatRoute = Route.update({
  id: "/api/chat",
  path: "/api/chat",
  getParentRoute: () => Route$3
});
const rootRouteChildren = {
  IndexRoute,
  ChatRoute,
  ApiChatRoute
};
const routeTree = Route$3._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient();
  const router2 = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  DEFAULT_MODEL as D,
  MODELS as M,
  PERSONA_IDS as P,
  PERSONAS as a,
  router as r
};
