type BrowserEventType = "page_view" | "client_error";
type ClientErrorOutcome =
  "script_error" | "unhandled_rejection" | "render_boundary";
type MonitoringSurface = "root" | "chat" | "monitoring";

const GUEST_ID_KEY = "mavis.guest-id";
const OWNER_SESSION_KEY = "mavis.owner.session";
let lastClientErrorAt = 0;

function apiUrl(path: string): string | null {
  const base = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");
  return base ? `${base}${path}` : null;
}

function privacyAllowsTelemetry(): boolean {
  if (typeof window === "undefined") return false;
  if (window.navigator.doNotTrack === "1") return false;
  return !window.sessionStorage.getItem(OWNER_SESSION_KEY);
}

function anonymousGuestId(): string | null {
  if (typeof window === "undefined") return null;
  const existing = window.localStorage.getItem(GUEST_ID_KEY);
  if (existing) return existing;
  const next = window.crypto?.randomUUID?.() ?? `guest-${Date.now()}`;
  window.localStorage.setItem(GUEST_ID_KEY, next);
  return next;
}

function routeForTelemetry(
  route: string,
): "/" | "/chat" | "/monitoring" | "/other" {
  if (route === "/" || route === "/chat" || route === "/monitoring")
    return route;
  return "/other";
}

function send(
  eventType: BrowserEventType,
  route: string,
  outcome: string,
  surface: MonitoringSurface,
) {
  if (!privacyAllowsTelemetry()) return;
  const endpoint = apiUrl("/monitoring/events");
  const guestId = anonymousGuestId();
  if (!endpoint || !guestId) return;

  void fetch(endpoint, {
    method: "POST",
    keepalive: true,
    headers: {
      "Content-Type": "application/json",
      "X-Guest-ID": guestId,
    },
    body: JSON.stringify({
      event_type: eventType,
      route: routeForTelemetry(route),
      outcome,
      surface,
    }),
  }).catch(() => {
    /* Telemetry is strictly non-blocking and must never affect the UI. */
  });
}

export function trackPageView(route: string) {
  send("page_view", route, "first_load", "root");
}

export function reportClientError(
  outcome: ClientErrorOutcome,
  surface: MonitoringSurface = "root",
) {
  const now = Date.now();
  if (now - lastClientErrorAt < 5_000) return;
  lastClientErrorAt = now;
  const route =
    typeof window === "undefined" ? "/other" : window.location.pathname;
  send("client_error", route, outcome, surface);
}

export function installClientErrorMonitoring() {
  if (typeof window === "undefined") return () => undefined;

  const onError = () => reportClientError("script_error");
  const onUnhandledRejection = () => reportClientError("unhandled_rejection");
  window.addEventListener("error", onError);
  window.addEventListener("unhandledrejection", onUnhandledRejection);

  return () => {
    window.removeEventListener("error", onError);
    window.removeEventListener("unhandledrejection", onUnhandledRejection);
  };
}
