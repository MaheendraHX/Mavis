import React from 'react';
import { Reveal } from '../Reveal';
import { steps } from '../../data/landing';

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-b border-line bg-sand py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <Reveal>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-peach">
              How it works
            </p>
            <h2 className="mt-4 font-display text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.05] tracking-[-0.02em] text-ink">
              Three steps, then out of your way.
            </h2>
          </Reveal>

          <ol className="relative border-l border-line/80">
            {steps.map((step, i) =>
            <Reveal key={step.step} delay={i * 0.08}>
                <li className="relative pb-12 pl-8 last:pb-0">
                  <span className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full border border-tan bg-cream" />
                  <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                    Step {step.step}
                  </span>
                  <h3 className="mt-2 font-display text-2xl text-ink">{step.title}</h3>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
                    {step.description}
                  </p>
                </li>
              </Reveal>
            )}
          </ol>
        </div>
      </div>
    </section>);

}