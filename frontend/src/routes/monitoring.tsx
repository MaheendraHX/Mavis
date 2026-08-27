import { Link, createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import {
  ActivityIcon,
  AlertTriangleIcon,
  ArrowLeftIcon,
  BarChart3Icon,
  BotIcon,
  CheckCircle2Icon,
  EyeIcon,
  GaugeIcon,
  LoaderCircleIcon,
  LockKeyholeIcon,
  RefreshCwIcon,
  ShieldCheckIcon,
  UsersRoundIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Wordmark } from "@/components/mavis/Wordmark";

export const Route = createFileRoute("/monitoring")({
  head: () => ({
    meta: [
      { title: "Mavis Monitoring — owner dashboard" },
      {
        name: "robots",
        content: "noindex, nofollow",
      },
    ],
  }),
  component: MonitoringPage,
});

const OWNER_SESSION_KEY = "mavis.owner.session";

type Summary = {
  unique_visitors: number;
  page_views: number;
  chat_requests: number;
  completed_chats: number;
  demo_limit_hits: number;
  client_errors: number;
  server_errors: number;
  provider_fallbacks: number;
  errors: number;
  chat_completion_rate: number;
};

type DailyMetric = {
  day: string;
  visitors: number;
  page_views: number;
  chat_requests: number;
  completed_chats: number;
  errors: number;
};

type Signal = {
  occurred_at: string;
  event_type: string;
  route: string;
  outcome: string;
};

type Overview = {
  range_days: number;
  storage: string;
  summary: Summary;
  daily: DailyMetric[];
  recent_signals: Signal[];
  privacy: {
    visitor_identity: string;
    message_content: string;
    ip_addresses: string;
    retention_days: number;
  };
};

type DashboardState = "loading" | "ready" | "locked" | "error";

function apiUrl(path: string): string | null {
  const base = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");
  return base ? `${base}${path}` : null;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat().format(value);
}

function formatDay(day: string, compact = false) {
  return new Intl.DateTimeFormat(undefined, {
    month: compact ? "numeric" : "short",
    day: "numeric",
  }).format(new Date(`${day}T12:00:00Z`));
}

function formatTimestamp(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return "Just now";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function signalLabel(signal: Signal) {
  const labels: Record<string, string> = {
    client_error: "Browser error",
    server_error: "Server error",
    request_failed: "Request failed",
    provider_fallback: "Fallback used",
  };
  return labels[signal.event_type] ?? "Reliability signal";
}

function MetricCard({
  label,
  value,
  detail,
  tone = "sage",
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  tone?: "sage" | "violet" | "peach" | "ink";
  icon: typeof UsersRoundIcon;
}) {
  const tones = {
    sage: "border-sage/20 bg-sage/10 text-sage",
    violet: "border-violet/20 bg-violet/10 text-violet",
    peach: "border-peach/30 bg-peach/10 text-peach",
    ink: "border-line bg-panel-raised text-ink",
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-3xl border border-line bg-panel/80 p-4 shadow-[0_16px_36px_rgba(18,41,29,0.07)] sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-ink">
            {label}
          </p>
          <p className="mt-2 font-display text-3xl leading-none text-ink">
            {value}
          </p>
        </div>
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-2xl border ${tones[tone]}`}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted-ink">{detail}</p>
    </motion.article>
  );
}

function ActivityChart({ daily }: { daily: DailyMetric[] }) {
  const max = Math.max(
    1,
    ...daily.flatMap((item) => [item.visitors, item.chat_requests]),
  );

  return (
    <section className="rounded-3xl border border-line bg-panel/80 p-4 shadow-[0_16px_36px_rgba(18,41,29,0.07)] sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-sage">
            Activity over time
          </p>
          <h2 className="mt-1 font-display text-2xl text-ink">
            Visitors and conversations
          </h2>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-muted-ink">
          <span className="flex items-center gap-1.5">
            <i className="h-2 w-2 rounded-full bg-sage" />
            Visitors
          </span>
          <span className="flex items-center gap-1.5">
            <i className="h-2 w-2 rounded-full bg-violet" />
            Chats
          </span>
        </div>
      </div>

      <div
        className="mt-6 flex h-48 items-end gap-1.5 sm:gap-2"
        aria-label="Visitor and chat activity chart"
      >
        {daily.map((item) => {
          const visitorHeight = Math.max(
            item.visitors ? 8 : 2,
            (item.visitors / max) * 100,
          );
          const chatHeight = Math.max(
            item.chat_requests ? 8 : 2,
            (item.chat_requests / max) * 100,
          );
          return (
            <div
              key={item.day}
              className="group flex min-w-0 flex-1 flex-col justify-end gap-1"
              title={`${formatDay(item.day)}: ${item.visitors} visitors, ${item.chat_requests} chats`}
            >
              <div className="flex h-40 items-end justify-center gap-1 rounded-xl bg-cream/70 px-1 pb-1.5 sm:gap-1.5">
                <div
                  className="w-full max-w-3 rounded-t-md bg-sage/75 transition-colors group-hover:bg-sage"
                  style={{ height: `${visitorHeight}%` }}
                />
                <div
                  className="w-full max-w-3 rounded-t-md bg-violet/65 transition-colors group-hover:bg-violet"
                  style={{ height: `${chatHeight}%` }}
                />
              </div>
              <p className="truncate text-center font-mono text-[8px] text-muted-ink sm:text-[9px]">
                {daily.length > 10
                  ? formatDay(item.day, true)
                  : formatDay(item.day)}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function MonitoringPage() {
  const [range, setRange] = useState<7 | 30>(7);
  const [dashboardState, setDashboardState] =
    useState<DashboardState>("loading");
  const [overview, setOverview] = useState<Overview | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadOverview = useCallback(async () => {
    const session = window.sessionStorage.getItem(OWNER_SESSION_KEY) ?? "";
    const endpoint = apiUrl(`/monitoring/overview?days=${range}`);
    if (!session) {
      setDashboardState("locked");
      return;
    }
    if (!endpoint) {
      setDashboardState("error");
      return;
    }

    setDashboardState("loading");
    try {
      const response = await fetch(endpoint, {
        headers: { "X-Mavis-Session": session },
      });
      if (response.status === 401) {
        window.sessionStorage.removeItem(OWNER_SESSION_KEY);
        setDashboardState("locked");
        return;
      }
      if (!response.ok)
        throw new Error(`Monitoring returned ${response.status}`);
      setOverview((await response.json()) as Overview);
      setLastUpdated(new Date());
      setDashboardState("ready");
    } catch {
      setDashboardState("error");
    }
  }, [range]);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  const largestMetric = useMemo(
    () => Math.max(1, ...(overview?.daily ?? []).map((item) => item.errors)),
    [overview],
  );

  return (
    <main className="grain min-h-[100dvh] bg-cream px-3 py-3 text-ink sm:px-6 sm:py-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="mavis-glass flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-line px-4 py-3 shadow-[0_18px_42px_rgba(18,41,29,0.08)] sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              to="/chat"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line bg-panel-raised text-muted-ink transition hover:border-sage hover:text-ink"
              aria-label="Back to Mavis chat"
            >
              <ArrowLeftIcon className="h-4 w-4" />
            </Link>
            <div className="min-w-0">
              <Wordmark className="text-xl" />
              <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.17em] text-sage">
                Private monitoring desk
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-full border border-sage/25 bg-sage/10 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.13em] text-sage sm:inline-flex">
              <ShieldCheckIcon className="h-3 w-3" /> Owner only
            </span>
            <button
              type="button"
              onClick={() => void loadOverview()}
              disabled={dashboardState === "loading"}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-line bg-panel-raised px-3 text-xs font-medium text-ink transition hover:border-sage disabled:cursor-wait disabled:opacity-60"
            >
              <RefreshCwIcon
                className={`h-3.5 w-3.5 ${dashboardState === "loading" ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {dashboardState === "loading" && !overview ? (
            <motion.section
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex min-h-[58dvh] flex-col items-center justify-center px-4 text-center"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-3xl border border-sage/20 bg-sage/10 text-sage">
                <LoaderCircleIcon className="h-6 w-6 animate-spin" />
              </span>
              <h1 className="mt-5 font-display text-3xl text-ink">
                Opening the desk
              </h1>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-ink">
                Loading Mavis’s private usage and reliability signals.
              </p>
            </motion.section>
          ) : dashboardState === "locked" ? (
            <motion.section
              key="locked"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mx-auto flex min-h-[58dvh] max-w-lg flex-col items-center justify-center px-4 text-center"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-3xl border border-violet/25 bg-violet/10 text-violet">
                <LockKeyholeIcon className="h-7 w-7" />
              </span>
              <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.16em] text-violet">
                Private owner space
              </p>
              <h1 className="mt-2 font-display text-3xl text-ink">
                Monitoring stays with you.
              </h1>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-ink">
                Sign in through Mavis Chat first. This page does not accept or
                store an owner passkey.
              </p>
              <Link
                to="/chat"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-cream transition hover:bg-sage"
              >
                <LockKeyholeIcon className="h-4 w-4" />
                Open Mavis Chat
              </Link>
            </motion.section>
          ) : dashboardState === "error" && !overview ? (
            <motion.section
              key="error"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mx-auto flex min-h-[58dvh] max-w-lg flex-col items-center justify-center px-4 text-center"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-3xl border border-peach/30 bg-peach/10 text-peach">
                <AlertTriangleIcon className="h-7 w-7" />
              </span>
              <h1 className="mt-5 font-display text-3xl text-ink">
                Desk unavailable
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-muted-ink">
                Mavis’s monitoring service did not respond. This does not expose
                visitor content, and the chat can still be checked separately.
              </p>
              <button
                type="button"
                onClick={() => void loadOverview()}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-cream transition hover:bg-sage"
              >
                <RefreshCwIcon className="h-4 w-4" />
                Try again
              </button>
            </motion.section>
          ) : overview ? (
            <motion.section
              key="dashboard"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="pb-8 pt-6 sm:pt-8"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-sage">
                    Operational overview
                  </p>
                  <h1 className="mt-1 font-display text-3xl text-ink sm:text-4xl">
                    Mavis is being watched.
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-ink">
                    Anonymous visitor patterns and reliability signals
                    only—never chat content, IP addresses, or raw visitor IDs.
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-2xl border border-line bg-panel/80 p-1.5">
                  {([7, 30] as const).map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setRange(days)}
                      className={`rounded-xl px-3 py-2 text-xs font-medium transition ${range === days ? "bg-ink text-cream shadow-sm" : "text-muted-ink hover:bg-cream hover:text-ink"}`}
                    >
                      {days} days
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                  label="Unique visitors"
                  value={formatNumber(overview.summary.unique_visitors)}
                  detail={`Anonymous people who opened Mavis in the last ${overview.range_days} days.`}
                  icon={UsersRoundIcon}
                />
                <MetricCard
                  label="Page views"
                  value={formatNumber(overview.summary.page_views)}
                  detail="Tracked only when a visitor allows browser telemetry."
                  tone="ink"
                  icon={EyeIcon}
                />
                <MetricCard
                  label="Chats completed"
                  value={formatNumber(overview.summary.completed_chats)}
                  detail={`${overview.summary.chat_completion_rate}% of public chat requests completed.`}
                  tone="violet"
                  icon={BotIcon}
                />
                <MetricCard
                  label="Reliability signals"
                  value={formatNumber(overview.summary.errors)}
                  detail={`${overview.summary.client_errors} browser · ${overview.summary.server_errors} server`}
                  tone={overview.summary.errors ? "peach" : "sage"}
                  icon={
                    overview.summary.errors
                      ? AlertTriangleIcon
                      : CheckCircle2Icon
                  }
                />
              </div>

              <div className="mt-3 grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-line bg-panel/65 px-4 py-3">
                  <p className="font-mono text-[9px] uppercase tracking-[0.13em] text-muted-ink">
                    Guest limit reached
                  </p>
                  <p className="mt-1 text-lg font-semibold text-ink">
                    {formatNumber(overview.summary.demo_limit_hits)}
                  </p>
                </div>
                <div className="rounded-2xl border border-line bg-panel/65 px-4 py-3">
                  <p className="font-mono text-[9px] uppercase tracking-[0.13em] text-muted-ink">
                    Provider fallbacks
                  </p>
                  <p className="mt-1 text-lg font-semibold text-ink">
                    {formatNumber(overview.summary.provider_fallbacks)}
                  </p>
                </div>
                <div className="rounded-2xl border border-line bg-panel/65 px-4 py-3">
                  <p className="font-mono text-[9px] uppercase tracking-[0.13em] text-muted-ink">
                    Data store
                  </p>
                  <p className="mt-1 text-lg font-semibold capitalize text-ink">
                    {overview.storage.replace("-", " ")}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.42fr)_minmax(20rem,0.86fr)]">
                <ActivityChart daily={overview.daily} />

                <section className="rounded-3xl border border-line bg-panel/80 p-4 shadow-[0_16px_36px_rgba(18,41,29,0.07)] sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-peach">
                        Early warning feed
                      </p>
                      <h2 className="mt-1 font-display text-2xl text-ink">
                        Reliability signals
                      </h2>
                    </div>
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-2xl border ${overview.summary.errors ? "border-peach/30 bg-peach/10 text-peach" : "border-sage/20 bg-sage/10 text-sage"}`}
                    >
                      <ActivityIcon className="h-4 w-4" />
                    </span>
                  </div>

                  {overview.recent_signals.length ? (
                    <ol className="mt-5 space-y-2.5">
                      {overview.recent_signals.map((signal, index) => (
                        <li
                          key={`${signal.occurred_at}-${index}`}
                          className="rounded-2xl border border-line/80 bg-cream/55 px-3 py-3"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-xs font-semibold text-ink">
                              {signalLabel(signal)}
                            </p>
                            <time className="shrink-0 font-mono text-[9px] text-muted-ink">
                              {formatTimestamp(signal.occurred_at)}
                            </time>
                          </div>
                          <p className="mt-1 text-[11px] text-muted-ink">
                            {signal.route} ·{" "}
                            {signal.outcome.replaceAll("_", " ")}
                          </p>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <div className="mt-5 rounded-2xl border border-dashed border-sage/25 bg-sage/5 px-4 py-7 text-center">
                      <CheckCircle2Icon className="mx-auto h-5 w-5 text-sage" />
                      <p className="mt-2 text-sm font-medium text-ink">
                        Quiet run so far.
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-ink">
                        No browser, server, or provider-warning signals in this
                        range.
                      </p>
                    </div>
                  )}
                </section>
              </div>

              <section className="mt-6 rounded-3xl border border-sage/20 bg-sage/5 p-4 sm:p-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-sage/20 bg-panel text-sage">
                      <ShieldCheckIcon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-sage">
                        Privacy boundary
                      </p>
                      <h2 className="mt-1 font-display text-xl text-ink">
                        Useful signals, not surveillance.
                      </h2>
                      <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-ink">
                        The dashboard is only for operating Mavis. It stores no
                        chat content or IP addresses, uses non-reversible
                        anonymous visitor identifiers, respects Do Not Track,
                        and automatically removes monitoring data after{" "}
                        {overview.privacy.retention_days} days.
                      </p>
                    </div>
                  </div>
                  <div className="grid shrink-0 grid-cols-2 gap-2 text-center sm:w-48">
                    <div className="rounded-xl border border-sage/20 bg-panel/80 p-2.5">
                      <p className="text-sm font-semibold text-ink">0</p>
                      <p className="mt-0.5 text-[9px] uppercase tracking-[0.1em] text-muted-ink">
                        Messages kept
                      </p>
                    </div>
                    <div className="rounded-xl border border-sage/20 bg-panel/80 p-2.5">
                      <p className="text-sm font-semibold text-ink">0</p>
                      <p className="mt-0.5 text-[9px] uppercase tracking-[0.1em] text-muted-ink">
                        IPs kept
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <footer className="mt-5 flex flex-wrap items-center justify-between gap-2 px-1 text-[10px] text-muted-ink">
                <span className="inline-flex items-center gap-1.5">
                  <GaugeIcon className="h-3.5 w-3.5" />
                  Operational data refreshes on demand.
                </span>
                <span>
                  Last refreshed{" "}
                  {lastUpdated
                    ? lastUpdated.toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                      })
                    : "just now"}
                </span>
              </footer>
            </motion.section>
          ) : null}
        </AnimatePresence>
      </div>
    </main>
  );
}
