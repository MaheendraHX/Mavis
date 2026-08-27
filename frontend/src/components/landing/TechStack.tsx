import { motion } from "motion/react";
import { AsteriskIcon } from "lucide-react";

import { techStack } from "@/data/landing";

export function TechStack() {
  const loopedStack = [...techStack, ...techStack];

  return (
    <section
      id="tech"
      className="relative scroll-mt-20 overflow-hidden border-y border-white/10 py-8 sm:py-10"
    >
      <div className="landing-marquee-track flex w-max items-center gap-6 whitespace-nowrap">
        {loopedStack.map((tech, index) => (
          <div key={`${tech}-${index}`} className="flex items-center gap-6">
            <span className="font-display text-3xl tracking-[-0.035em] text-[#dceadb] sm:text-4xl">
              {tech}
            </span>
            <AsteriskIcon className="h-4 w-4 text-[#8a6fdf]" />
          </div>
        ))}
      </div>

      <div className="relative mx-auto mt-20 grid max-w-7xl gap-8 px-5 sm:px-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-end lg:px-12">
        <div>
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-[#8ceab5]">
            Quietly powerful
          </p>
          <h2 className="mt-5 max-w-md font-display text-[clamp(3rem,5vw,4.8rem)] leading-[0.88] tracking-[-0.045em] text-[#eff7ef]">
            Built to feel
            <br />
            <span className="italic text-[#a58aee]">effortless.</span>
          </h2>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="landing-panel grid gap-px overflow-hidden rounded-[1.65rem] sm:grid-cols-2"
        >
          <div className="bg-[#102d20]/55 p-6 sm:p-7">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#8be9b4]">
              Under the hood
            </p>
            <p className="mt-5 max-w-sm text-lg leading-relaxed text-[#e6f2e5]">
              Modern web foundations keep the experience responsive, even while
              the thought process gets complicated.
            </p>
          </div>
          <div className="bg-white/[0.035] p-6 sm:p-7">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#b9a7ef]">
              The real point
            </p>
            <p className="mt-5 max-w-sm text-lg leading-relaxed text-[#e6f2e5]">
              The technology disappears. What stays is the context you have
              already built with Mavis.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
