import { motion } from "motion/react";
import { ArrowDownRightIcon, CheckIcon, SparklesIcon } from "lucide-react";

import { steps } from "@/data/landing";

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative scroll-mt-20 px-5 py-20 sm:px-8 sm:py-28 lg:px-12"
    >
      <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:h-fit">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-[#8ceab5]">
            How it moves
          </p>
          <h2 className="mt-5 max-w-md font-display text-[clamp(3.1rem,5vw,5rem)] leading-[0.88] tracking-[-0.045em] text-[#eff7ef]">
            Less setup.
            <br />
            <span className="italic text-[#a58aee]">More signal.</span>
          </h2>
          <p className="mt-6 max-w-sm text-base leading-relaxed text-[#aebfae]">
            Mavis is intentional from the first prompt: you bring a question, it
            holds the context, then gives the useful part back.
          </p>
        </div>

        <div className="overflow-hidden rounded-[1.8rem] border border-white/10 bg-white/[0.035]">
          {steps.map((step, index) => (
            <motion.article
              key={step.step}
              initial={{ opacity: 0, x: 18 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{
                duration: 0.45,
                delay: index * 0.06,
                ease: [0.23, 1, 0.32, 1],
              }}
              className="group grid min-h-48 gap-5 border-b border-white/10 p-6 last:border-b-0 sm:grid-cols-[7rem_1fr_auto] sm:items-center sm:p-8"
            >
              <div className="flex items-center gap-3 sm:block">
                <span className="font-display text-5xl leading-none text-[#8ceab5] sm:text-6xl">
                  0{index + 1}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/42 sm:mt-2 sm:block">
                  Step {step.step}
                </span>
              </div>
              <div>
                <h3 className="font-display text-3xl tracking-[-0.03em] text-[#eef8ef] sm:text-4xl">
                  {step.title}
                </h3>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-[#adc0b1]">
                  {step.description}
                </p>
              </div>
              <div className="relative hidden h-20 w-20 shrink-0 place-items-center rounded-2xl border border-white/10 bg-[#112f23] text-[#9af1bd] transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105 sm:grid">
                {index === 0 ? (
                  <SparklesIcon className="h-6 w-6" />
                ) : index === 1 ? (
                  <ArrowDownRightIcon className="h-7 w-7" />
                ) : (
                  <CheckIcon className="h-7 w-7" />
                )}
              </div>
            </motion.article>
          ))}

          <div className="m-3 flex flex-wrap items-center justify-between gap-3 rounded-[1.25rem] bg-[#dff4df] px-5 py-4 text-[#123021] sm:m-4">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0e3524] text-[#a6f6c6]">
                ✦
              </span>
              <span className="text-sm font-semibold">
                One workspace. Your entire train of thought.
              </span>
            </div>
            <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#3c7254]">
              Ready when you are
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
