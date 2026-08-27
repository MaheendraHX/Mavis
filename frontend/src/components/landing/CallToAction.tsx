import { Link } from "@tanstack/react-router";
import { ArrowRightIcon, SparklesIcon } from "lucide-react";
import { motion } from "motion/react";

export function CallToAction() {
  return (
    <section className="relative px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-[#e1ffe5]/18 bg-[#dff4df] px-6 py-14 text-[#10291d] shadow-[0_34px_100px_rgba(0,0,0,0.28)] sm:px-12 sm:py-20"
      >
        <div className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full bg-[#7c67de]/45 blur-[45px]" />
        <div className="pointer-events-none absolute -bottom-32 left-[38%] h-72 w-72 rounded-full bg-[#55d99a]/55 blur-[55px]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(16,41,29,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(16,41,29,0.055)_1px,transparent_1px)] bg-[size:38px_38px]" />

        <div className="relative max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#123d2a]/13 bg-white/45 px-3 py-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.17em] text-[#356449]">
            <SparklesIcon className="h-3.5 w-3.5" />
            The demo is ready
          </div>
          <h2 className="mt-7 font-display text-[clamp(3.6rem,7vw,6.7rem)] leading-[0.83] tracking-[-0.055em]">
            What are we
            <br />
            <span className="italic text-[#6249bd]">figuring out?</span>
          </h2>
          <p className="mt-7 max-w-lg text-[17px] leading-relaxed text-[#416550]">
            Bring the half-formed idea, difficult brief, rabbit-hole research,
            or source file. Mavis will meet you in the middle.
          </p>
          <Link
            to="/chat"
            className="group mt-10 inline-flex items-center gap-2 rounded-xl bg-[#112d20] px-5 py-3.5 text-sm font-semibold text-[#ecf9ed] transition-all hover:-translate-y-0.5 hover:bg-[#1b5b40]"
          >
            Open a new thread
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
