import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowRightIcon, GlobeIcon, PaperclipIcon, SparklesIcon } from "lucide-react";

import orb from "@/assets/mavis-orb.jpg";

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-line bg-cream pt-32 sm:pt-40">
      <div className="hairline-grid pointer-events-none absolute inset-x-0 top-0 hidden h-full opacity-60 lg:block" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-16 px-6 pb-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:pb-28">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sage opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-sage" />
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-ink">
              Now in public demo
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.06, ease }}
            className="mt-7 font-display text-[clamp(3rem,7.5vw,5.25rem)] leading-[0.95] font-normal tracking-[-0.02em] text-ink"
          >
            Your AI,
            <br />
            <span className="text-peach italic">amplified.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.14, ease }}
            className="mt-7 max-w-lg text-[17px] leading-relaxed text-muted-ink"
          >
            Mavis searches the live web, reads your files, writes code, and keeps every
            conversation organized in one warm, quiet workspace.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.22, ease }}
            className="mt-10 flex flex-wrap items-center gap-3"
          >
            <Link
              to="/chat"
              className="group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-medium text-cream shadow-soft transition-colors hover:bg-peach"
            >
              Start chatting
              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-6 py-3.5 text-sm font-medium text-ink transition-colors hover:bg-sand"
            >
              See features
            </a>
          </motion.div>

          <motion.dl
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="mt-14 flex flex-wrap gap-x-12 gap-y-6 border-t border-line pt-8"
          >
            {[
              { value: "Two", label: "model modes" },
              { value: "4", label: "personas" },
              { value: "0", label: "setup steps" },
            ].map((stat) => (
              <div key={stat.label}>
                <dt className="font-display text-2xl text-ink">{stat.value}</dt>
                <dd className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-ink">
                  {stat.label}
                </dd>
              </div>
            ))}
          </motion.dl>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.1, ease }}
          className="relative"
        >
          <div className="grain relative overflow-hidden rounded-[28px] border border-line bg-sand shadow-lift">
            <motion.img
              src={orb}
              alt="A soft sculptural sphere in tan and peach, lit from one edge"
              className="aspect-square w-full object-cover"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5, ease }}
            className="absolute -bottom-6 -left-4 w-[85%] max-w-sm rounded-2xl border border-line bg-white p-4 shadow-lift sm:-left-8"
          >
            <div className="flex items-center gap-2 border-b border-line pb-3">
              <SparklesIcon className="h-3.5 w-3.5 text-peach" />
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-ink">
                Live thread
              </span>
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-ink">
              “Read this contract and flag anything unusual about the renewal terms.”
            </p>
            <div className="mt-3 flex items-center gap-3 text-muted-ink">
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em]">
                <PaperclipIcon className="h-3 w-3" /> contract.pdf
              </span>
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em]">
                <GlobeIcon className="h-3 w-3" /> web on
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
