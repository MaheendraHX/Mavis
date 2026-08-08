import { j as jsxRuntimeExports } from "../_libs/react.mjs";
function Wordmark({ className = "" }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "span",
    {
      className: `inline-flex items-baseline gap-2 font-display text-ink ${className}`,
      "aria-label": "Mavis",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[0.7em] leading-none text-peach", "aria-hidden": "true", children: "✦" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "uppercase tracking-[0.28em]", children: "Mavis" })
      ]
    }
  );
}
export {
  Wordmark as W
};
