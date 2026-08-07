import React from 'react';
import {
  BrainIcon,
  CodeIcon,
  LayersIcon,
  SearchIcon,
  ShieldCheckIcon,
  ZapIcon } from
'lucide-react';
import { Reveal } from '../Reveal';
import { features, type Feature } from '../../data/landing';

const icons: Record<Feature['icon'], React.ComponentType<{className?: string;}>> = {
  layers: LayersIcon,
  search: SearchIcon,
  brain: BrainIcon,
  code: CodeIcon,
  shield: ShieldCheckIcon,
  zap: ZapIcon
};

export function Features() {
  return (
    <section id="features" className="border-b border-line bg-cream py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="max-w-2xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-peach">Features</p>
          <h2 className="mt-4 font-display text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.05] tracking-[-0.02em] text-ink">
            Everything an assistant should have already done.
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => {
            const Icon = icons[feature.icon];
            return (
              <Reveal key={feature.index} delay={i * 0.05}>
                <article className="group h-full bg-cream p-8 transition-colors hover:bg-white">
                  <div className="flex items-center justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-ink transition-colors group-hover:border-peach group-hover:text-peach">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="font-mono text-[11px] tracking-[0.14em] text-line group-hover:text-tan">
                      {feature.index}
                    </span>
                  </div>
                  <h3 className="mt-6 font-display text-xl text-ink">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{feature.description}</p>
                </article>
              </Reveal>);

          })}
        </div>
      </div>
    </section>);

}