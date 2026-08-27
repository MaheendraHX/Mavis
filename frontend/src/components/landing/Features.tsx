import { motion } from "motion/react";
import {
  BrainCircuitIcon,
  BracesIcon,
  FileStackIcon,
  Globe2Icon,
  LockKeyholeIcon,
  ZapIcon,
} from "lucide-react";

import { features } from "@/data/landing";

const iconByFeature = {
  layers: FileStackIcon,
  search: Globe2Icon,
  brain: BrainCircuitIcon,
  code: BracesIcon,
  shield: LockKeyholeIcon,
  zap: ZapIcon,
};

const featureStyle = [
  "sm:col-span-7 bg-[#dff4df] text-[#10291d]",
  "sm:col-span-5 bg-[#173b2c] text-[#f0f9ef]",
  "sm:col-span-4 bg-[#22214a] text-[#f4f1ff]",
  "sm:col-span-4 bg-[#e8eee2] text-[#10291d]",
  "sm:col-span-4 bg-[#134f45] text-[#ecfff4]",
  "sm:col-span-12 bg-[#0d251b] text-[#eff9ef]",
];

export function Features() {
  return (
    <section
      id="features"
      className="relative scroll-mt-20 px-5 py-20 sm:px-8 sm:py-28 lg:px-12"
    >
      <div className="relative mx-auto max-w-7xl">
        <div className="grid items-end gap-7 lg:grid-cols-[1fr_0.78fr]">
          <div>
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-[#8ceab5]">
              A complete thinking surface
            </p>
            <h2 className="mt-5 max-w-3xl font-display text-[clamp(3.1rem,6.1vw,5.9rem)] leading-[0.88] tracking-[-0.045em] text-[#eff7ef]">
              Not another box
              <br />
              <span className="italic text-[#a58aee]">you type into.</span>
            </h2>
          </div>
          <p className="max-w-lg text-base leading-relaxed text-[#aebfae] lg:pb-2">
            Mavis keeps the tools close and the noise out. Every response can
            pull from fresh research, your files, or the thread you have already
            built together.
          </p>
        </div>

        <div className="mt-12 grid gap-3 sm:grid-cols-12">
          {features.map((feature, index) => {
            const Icon = iconByFeature[feature.icon];
            const lightCard = index === 0 || index === 3;
            return (
              <motion.article
                key={feature.index}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.5,
                  delay: (index % 3) * 0.05,
                  ease: [0.23, 1, 0.32, 1],
                }}
                className={`group relative min-h-60 overflow-hidden rounded-[1.7rem] border border-white/10 p-6 sm:p-7 ${featureStyle[index]}`}
              >
                <div className="relative z-10 flex h-full flex-col justify-between">
                  <div className="flex items-start justify-between gap-4">
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
                        lightCard
                          ? "border-[#0f3927]/12 bg-white/50"
                          : "border-white/12 bg-white/8"
                      }`}
                    >
                      <Icon className="h-[18px] w-[18px]" strokeWidth={1.7} />
                    </span>
                    <span
                      className={`font-mono text-[10px] tracking-[0.16em] ${lightCard ? "text-[#4d7560]" : "text-white/45"}`}
                    >
                      /{feature.index}
                    </span>
                  </div>
                  <div className="max-w-md">
                    <h3 className="font-display text-[2rem] leading-none tracking-[-0.035em] sm:text-[2.45rem]">
                      {feature.title}
                    </h3>
                    <p
                      className={`mt-3 max-w-sm text-sm leading-relaxed ${lightCard ? "text-[#4c6856]" : "text-white/62"}`}
                    >
                      {feature.description}
                    </p>
                  </div>
                </div>

                {index === 0 && (
                  <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full border-[22px] border-[#66c991]/25" />
                )}
                {index === 1 && (
                  <div className="pointer-events-none absolute -bottom-14 -right-10 h-48 w-48 rounded-full bg-[#7e68e3]/35 blur-2xl transition-transform duration-500 group-hover:scale-125" />
                )}
                {index === 2 && (
                  <div className="pointer-events-none absolute bottom-5 right-5 grid grid-cols-4 gap-1.5 opacity-35">
                    {Array.from({ length: 16 }, (_, dot) => (
                      <span
                        key={dot}
                        className="h-1.5 w-1.5 rounded-full bg-[#d8d0ff]"
                      />
                    ))}
                  </div>
                )}
                {index === 3 && (
                  <div className="pointer-events-none absolute bottom-4 right-5 font-mono text-5xl font-medium tracking-[-0.15em] text-[#147455]/15">{`{ }`}</div>
                )}
                {index === 4 && (
                  <div className="pointer-events-none absolute -bottom-7 -right-6 h-40 w-40 rounded-full border border-[#b8ffe0]/25" />
                )}
                {index === 5 && (
                  <div className="pointer-events-none absolute right-8 top-1/2 hidden -translate-y-1/2 items-center gap-3 opacity-30 sm:flex">
                    {Array.from({ length: 5 }, (_, bar) => (
                      <span
                        key={bar}
                        className="block w-1 rounded-full bg-[#9bf3bf]"
                        style={{ height: `${18 + bar * 13}px` }}
                      />
                    ))}
                  </div>
                )}
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
