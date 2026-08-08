import { Reveal } from "@/components/mavis/Reveal";
import { techStack } from "@/data/landing";

export function TechStack() {
  return (
    <section id="tech" className="scroll-mt-24 border-b border-line bg-cream py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <Reveal>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-peach">
              Built with
            </p>
            <h2 className="mt-3 max-w-sm font-display text-2xl leading-snug text-ink">
              A small, sharp stack — nothing you have to babysit.
            </h2>
          </Reveal>

          <Reveal delay={0.08} className="sm:max-w-lg">
            <ul className="flex flex-wrap gap-2">
              {techStack.map((tech) => (
                <li
                  key={tech}
                  className="rounded-full border border-line bg-white px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-ink transition-colors hover:border-tan hover:text-ink"
                >
                  {tech}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
