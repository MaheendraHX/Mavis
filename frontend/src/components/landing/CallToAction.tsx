import { Link } from "@tanstack/react-router";
import { ArrowRightIcon } from "lucide-react";

import { Reveal } from "@/components/mavis/Reveal";

export function CallToAction() {
  return (
    <section className="bg-night py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <Reveal>
          <h2 className="font-display text-[clamp(2.25rem,5.5vw,3.75rem)] leading-[1.02] tracking-[-0.02em] text-cream">
            Ask it something
            <span className="text-tan italic"> hard.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-cream/60">
            The demo is open. No account, no credit card — just a thread and a blinking cursor.
          </p>
          <Link
            to="/chat"
            className="group mt-10 inline-flex items-center gap-2 rounded-full bg-cream px-7 py-3.5 text-sm font-medium text-ink transition-colors hover:bg-peach hover:text-cream"
          >
            Open Mavis
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
