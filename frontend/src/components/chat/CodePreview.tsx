import {
  EyeIcon,
  LaptopIcon,
  RefreshCwIcon,
  ShieldCheckIcon,
  SmartphoneIcon,
  TabletIcon,
} from "lucide-react";
import { useMemo, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type PreviewKind = "html" | "css" | "javascript" | "react";

type CodePreviewProps = {
  code: string;
  language: string;
  tone?: "dark" | "light";
};

const PREVIEWABLE_LANGUAGES: Record<string, PreviewKind> = {
  html: "html",
  htm: "html",
  css: "css",
  js: "javascript",
  javascript: "javascript",
  jsx: "react",
  tsx: "react",
  react: "react",
};

const previewLabels: Record<PreviewKind, string> = {
  html: "HTML preview",
  css: "Style preview",
  javascript: "JavaScript preview",
  react: "React preview",
};

const previewDescriptions: Record<PreviewKind, string> = {
  html: "Runs inside an isolated preview frame.",
  css: "Shows the supplied styles on a small sample surface.",
  javascript: "Runs inside an isolated preview frame.",
  react: "Runs inside an isolated preview frame with React available.",
};

type PreviewViewport = "desktop" | "tablet" | "mobile";

const previewViewports: {
  id: PreviewViewport;
  label: string;
  Icon: typeof LaptopIcon;
  frameClass: string;
}[] = [
  {
    id: "desktop",
    label: "Desktop",
    Icon: LaptopIcon,
    frameClass: "h-full w-full",
  },
  {
    id: "tablet",
    label: "Tablet",
    Icon: TabletIcon,
    frameClass: "h-[min(100%,52rem)] w-[min(100%,48rem)] shadow-2xl",
  },
  {
    id: "mobile",
    label: "Mobile",
    Icon: SmartphoneIcon,
    frameClass: "h-[min(100%,48rem)] w-[min(100%,24rem)] shadow-2xl",
  },
];

function escapeInlineScript(value: string) {
  return value.replace(/<\/script/gi, "<\\/script");
}

function escapeInlineStyle(value: string) {
  return value.replace(/<\/style/gi, "<\\/style");
}

function previewKindFor(language: string, code: string): PreviewKind | null {
  const normalized = language.trim().toLowerCase();
  const kind = PREVIEWABLE_LANGUAGES[normalized];
  if (!kind || !code.trim() || code.length > 60_000) return null;
  const imports = [...code.matchAll(/from\s+["']([^"']+)["']/g)].map(
    (match) => match[1],
  );
  if (
    kind === "react" &&
    imports.some(
      (packageName) =>
        !["react", "react-dom", "react-dom/client"].includes(packageName),
    )
  ) {
    return null;
  }
  return kind;
}

function csp() {
  return [
    "default-src 'none'",
    "base-uri 'none'",
    "connect-src 'none'",
    "form-action 'none'",
    "frame-ancestors 'none'",
    "img-src data: blob: https:",
    "font-src data: https:",
    "style-src 'unsafe-inline'",
    "script-src 'unsafe-inline' 'unsafe-eval' https://unpkg.com https://cdn.tailwindcss.com",
  ].join("; ");
}

function frameShell(content: string) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="Content-Security-Policy" content="${csp()}" />
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      :root { color-scheme: light; }
      html, body, #root { min-height: 100%; margin: 0; }
      body { background: #f8faf8; color: #14231f; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
      * { box-sizing: border-box; }
    </style>
  </head>
  <body>${content}</body>
</html>`;
}

function htmlDocument(code: string) {
  const hasDocumentShell = /<\s*(?:!doctype|html|head|body)\b/i.test(code);
  if (hasDocumentShell) {
    return `<!doctype html><meta http-equiv="Content-Security-Policy" content="${csp()}" />${code}`;
  }
  return frameShell(`<main id="app">${code}</main>`);
}

function cssDocument(code: string) {
  return frameShell(`
    <style>${escapeInlineStyle(code)}</style>
    <main class="min-h-screen p-7 sm:p-10">
      <section class="preview-card mx-auto max-w-xl rounded-3xl border border-black/10 bg-white p-7 shadow-xl shadow-emerald-950/10">
        <p class="preview-eyebrow text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Mavis style preview</p>
        <h1 class="preview-title mt-3 text-4xl font-semibold tracking-tight">Your CSS, rendered.</h1>
        <p class="preview-copy mt-3 max-w-md leading-7 text-slate-600">Use a self-contained HTML block when you need to preview styles against your own markup.</p>
        <div class="preview-actions mt-6 flex flex-wrap gap-3">
          <button class="preview-primary rounded-full bg-emerald-700 px-5 py-3 font-semibold text-white">Primary action</button>
          <button class="preview-secondary rounded-full border border-emerald-700/30 px-5 py-3 font-semibold text-emerald-800">Secondary</button>
        </div>
      </section>
    </main>
  `);
}

function javascriptDocument(code: string) {
  return frameShell(`
    <main id="app" class="min-h-screen p-7 sm:p-10">
      <section class="mx-auto max-w-xl rounded-3xl border border-black/10 bg-white p-7 shadow-xl shadow-emerald-950/10">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Mavis JavaScript preview</p>
        <h1 class="mt-3 text-3xl font-semibold tracking-tight">The script can render here.</h1>
        <p class="mt-3 leading-7 text-slate-600">Use <code>#app</code> to replace this starter surface.</p>
      </section>
    </main>
    <script>
      try {
        ${escapeInlineScript(code)}
      } catch (error) {
        document.getElementById("app").innerHTML = '<div style="padding:28px;font-family:system-ui;color:#7f1d1d"><strong>Preview could not run.</strong><p style="margin-top:8px;line-height:1.5">' + String(error.message || error) + '</p></div>';
      }
    </script>
  `);
}

function reactDocument(code: string) {
  const source = escapeInlineScript(JSON.stringify(code));
  return frameShell(`
    <main id="root" class="min-h-screen"></main>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script>
      try {
        const source = ${source};
        const compiled = Babel.transform(source, {
          presets: [["react", { runtime: "classic" }], "typescript"],
          plugins: ["transform-modules-commonjs"]
        }).code;
        const module = { exports: {} };
        const previewRequire = (name) => {
          if (name === "react") return React;
          if (name === "react/jsx-runtime" || name === "react/jsx-dev-runtime") return { jsx: React.createElement, jsxs: React.createElement, jsxDEV: React.createElement, Fragment: React.Fragment };
          if (name === "react-dom" || name === "react-dom/client") return ReactDOM;
          throw new Error("This preview supports self-contained React snippets only. Remove external package imports to preview it here.");
        };
        const factory = new Function("React", "ReactDOM", "require", "module", "exports", compiled + "\\nreturn module.exports.default || (typeof App !== 'undefined' ? App : typeof MavisPreview !== 'undefined' ? MavisPreview : null);");
        const Component = factory(React, ReactDOM, previewRequire, module, module.exports);
        if (!Component) throw new Error("Export a default React component, App, or MavisPreview to render this snippet.");
        ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(Component));
      } catch (error) {
        document.getElementById("root").innerHTML = '<div style="padding:28px;font-family:system-ui;color:#7f1d1d"><strong>Preview could not run.</strong><p style="margin-top:8px;line-height:1.5">' + String(error.message || error) + '</p></div>';
      }
    </script>
  `);
}

function buildPreviewDocument(kind: PreviewKind, code: string) {
  switch (kind) {
    case "html":
      return htmlDocument(code);
    case "css":
      return cssDocument(code);
    case "javascript":
      return javascriptDocument(code);
    case "react":
      return reactDocument(code);
  }
}

export function CodePreview({
  code,
  language,
  tone = "dark",
}: CodePreviewProps) {
  const [open, setOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [viewport, setViewport] = useState<PreviewViewport>("desktop");
  const kind = useMemo(() => previewKindFor(language, code), [code, language]);
  const srcDoc = useMemo(
    () => (kind ? buildPreviewDocument(kind, code) : ""),
    [code, kind],
  );

  if (!kind) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className={`inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors ${tone === "light" ? "text-muted-ink hover:text-sage" : "text-cream/70 hover:text-mint"}`}
          title="Open an isolated live preview"
        >
          <EyeIcon className="h-3 w-3" /> Preview
        </button>
      </DialogTrigger>
      <DialogContent className="flex h-[100dvh] max-h-[100dvh] w-screen max-w-none flex-col gap-0 overflow-hidden rounded-none border-0 bg-night p-0 text-cream shadow-[0_30px_100px_rgba(9,20,16,0.48)] sm:h-[min(48rem,calc(100vh-2rem))] sm:max-h-[calc(100vh-2rem)] sm:max-w-[min(76rem,calc(100vw-1rem))] sm:rounded-[1.75rem] sm:border sm:border-cream/15">
        <DialogHeader className="shrink-0 border-b border-cream/10 bg-night-raised px-4 py-3 pr-12 text-left sm:px-6 sm:py-4 sm:pr-14">
          <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.16em] text-mint/80 sm:text-[10px]">
            <ShieldCheckIcon className="h-3.5 w-3.5" /> Isolated preview
          </div>
          <DialogTitle className="mt-1 text-lg font-medium text-cream sm:text-2xl">
            {previewLabels[kind]}
          </DialogTitle>
          <DialogDescription className="mt-1 text-xs leading-relaxed text-cream/60 sm:text-sm">
            {previewDescriptions[kind]} It cannot access Mavis, your chat, or
            the parent page.
          </DialogDescription>
        </DialogHeader>
        <div className="flex shrink-0 items-center gap-1.5 overflow-x-auto border-b border-cream/10 bg-night px-4 py-2.5 sm:px-6">
          {previewViewports.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              aria-pressed={viewport === id}
              onClick={() => setViewport(id)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.12em] transition-colors ${viewport === id ? "border-mint/50 bg-mint/12 text-mint" : "border-cream/12 text-cream/55 hover:border-cream/30 hover:text-cream"}`}
            >
              <Icon className="h-3 w-3" /> {label}
            </button>
          ))}
        </div>
        <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-[#dfe9e3] p-2 sm:p-3">
          <iframe
            key={`${refreshKey}-${viewport}`}
            title={`${previewLabels[kind]} — ${viewport} viewport`}
            sandbox="allow-scripts"
            srcDoc={srcDoc}
            className={`shrink-0 rounded-[1.15rem] border border-black/10 bg-white transition-[width,height] duration-200 ${previewViewports.find((item) => item.id === viewport)?.frameClass ?? "h-full w-full"}`}
          />
        </div>
        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-cream/10 bg-night-raised px-4 py-3 sm:px-6">
          <p className="hidden font-mono text-[9px] uppercase tracking-[0.12em] text-cream/45 sm:block">
            Scripts run only in this preview frame
          </p>
          <button
            type="button"
            onClick={() => setRefreshKey((current) => current + 1)}
            className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-cream/15 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-cream/75 transition-colors hover:border-mint/50 hover:text-mint active:scale-[0.97]"
          >
            <RefreshCwIcon className="h-3 w-3" /> Restart
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
