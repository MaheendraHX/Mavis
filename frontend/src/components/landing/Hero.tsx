import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  CheckIcon,
  FileTextIcon,
  Globe2Icon,
  SparklesIcon,
} from "lucide-react";

const ease = [0.23, 1, 0.32, 1] as const;

export function Hero() {
  return (
    <section className="relative overflow-hidden px-5 pb-16 pt-32 sm:px-8 sm:pb-24 sm:pt-40 lg:px-12 lg:pb-28">
      <div className="landing-grid pointer-events-none absolute inset-x-0 top-0 h-[42rem] opacity-25" />
      <div className="pointer-events-none absolute right-[-12rem] top-20 h-[36rem] w-[36rem] rounded-full bg-[#63efab]/16 blur-[115px]" />
      <div className="pointer-events-none absolute left-[12%] top-[24rem] h-64 w-64 rounded-full bg-[#8e69e4]/12 blur-[110px]" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease }}
            className="inline-flex items-center gap-2 rounded-full border border-[#dff7df]/14 bg-white/6 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-[#d9ebdc]"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#7af0b3] opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#7af0b3]" />
            </span>
            Public demo, no sign-up
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.05, ease }}
            className="mt-7 max-w-3xl font-display text-[clamp(4rem,8vw,7.35rem)] leading-[0.82] tracking-[-0.055em] text-[#f1f8ef]"
          >
            Make your
            <br />
            <span className="bg-gradient-to-r from-[#91f3bf] via-[#dcf5d7] to-[#a488ed] bg-clip-text italic text-transparent">
              thinking tangible.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.14, ease }}
            className="mt-8 max-w-xl text-[17px] leading-relaxed text-[#b9cbbd] sm:text-lg"
          >
            Mavis turns the messy middle into momentum. Search the live web,
            talk through files, build in code, and keep every good thought
            within reach.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.22, ease }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <Link
              to="/chat"
              className="group inline-flex items-center gap-2 rounded-xl bg-[#dbf7df] px-5 py-3.5 text-sm font-semibold text-[#0a261a] shadow-[0_16px_40px_rgba(91,225,144,0.18)] transition-all hover:-translate-y-0.5 hover:bg-[#91f3bf]"
            >
              Start a thread
              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 rounded-xl border border-white/13 bg-white/5 px-5 py-3.5 text-sm font-medium text-[#eff7ef] transition-colors hover:bg-white/10"
            >
              Explore the system
              <ArrowUpRightIcon className="h-3.5 w-3.5" />
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.36 }}
            className="mt-12 flex flex-wrap gap-x-8 gap-y-3 text-xs text-[#a8baac]"
          >
            {[
              "Live web research",
              "Files, code & sources",
              "Threads that persist",
            ].map((item) => (
              <span key={item} className="inline-flex items-center gap-2">
                <CheckIcon className="h-3.5 w-3.5 text-[#83efb5]" />
                {item}
              </span>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1, ease }}
          className="relative mx-auto w-full max-w-[42rem] lg:mr-0"
        >
          <div className="landing-ring absolute left-1/2 top-1/2 h-[72%] w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full" />
          <div className="landing-halo absolute left-1/2 top-1/2 h-[74%] w-[74%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-2xl" />

          <div className="landing-panel relative overflow-hidden rounded-[2rem] p-3 sm:p-4">
            <div className="relative overflow-hidden rounded-[1.45rem] border border-white/10 bg-[#0a1c15] p-4 sm:p-5">
              <div className="flex items-center justify-between border-b border-white/8 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#8df2ba] to-[#6c67dc] text-sm text-[#06150e] shadow-[0_4px_20px_rgba(132,240,183,0.25)]">
                    ✦
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[#ecf8ec]">
                      Mavis
                    </p>
                    <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#7bb990]">
                      Thinking with you
                    </p>
                  </div>
                </div>
                <span className="rounded-full border border-[#8befb7]/18 bg-[#8befb7]/8 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.13em] text-[#9eeec1]">
                  Live
                </span>
              </div>

              <div className="space-y-5 py-7">
                <div className="max-w-[88%] rounded-2xl rounded-tl-sm border border-white/8 bg-white/[0.055] p-4 text-[13px] leading-relaxed text-[#d5e8d8]">
                  Compare these options, use fresh sources, and give me the
                  clearest path forward.
                </div>
                <div className="ml-auto max-w-[92%] rounded-2xl rounded-tr-sm bg-gradient-to-br from-[#137b64] to-[#6f58c2] p-4 text-[13px] leading-relaxed text-white shadow-[0_10px_30px_rgba(81,91,183,0.2)]">
                  I’ll map the trade-offs, find the current evidence, and leave
                  you with a decision you can act on.
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 p-2 pl-4">
                <span className="flex-1 text-sm text-[#7d9c85]">
                  Ask Mavis anything…
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#dff7df] text-[#103021]">
                  <ArrowUpRightIcon className="h-4 w-4" />
                </span>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: -16, y: 10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.55, delay: 0.5, ease }}
            className="landing-panel absolute -bottom-6 -left-3 hidden w-52 rounded-2xl p-3 sm:block"
          >
            <div className="flex items-center gap-2 text-[#aaf4c8]">
              <FileTextIcon className="h-3.5 w-3.5" />
              <span className="font-mono text-[9px] uppercase tracking-[0.14em]">
                Context added
              </span>
            </div>
            <p className="mt-2 text-xs font-medium text-[#f0f8ef]">
              project-brief.pdf
            </p>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-4/5 rounded-full bg-[#7cf0b3]" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 16, y: -8 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.55, delay: 0.6, ease }}
            className="landing-panel absolute -right-3 top-16 hidden rounded-2xl p-3 sm:block"
          >
            <div className="flex items-center gap-2 text-[#c7b9ff]">
              <Globe2Icon className="h-3.5 w-3.5" />
              <span className="font-mono text-[9px] uppercase tracking-[0.14em]">
                Web connected
              </span>
            </div>
          </motion.div>

          <div className="absolute -right-1 bottom-3 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-[#173a2b]/90 text-[#a0f1be] shadow-[0_16px_30px_rgba(0,0,0,0.28)] backdrop-blur sm:-right-5">
            <SparklesIcon className="h-5 w-5" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
