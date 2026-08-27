import { Link } from "@tanstack/react-router";

import { Wordmark } from "@/components/mavis/Wordmark";
import { navLinks } from "@/data/landing";

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/10 px-5 sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 py-10 sm:flex-row sm:items-center sm:justify-between">
        <Link to="/" className="text-base" aria-label="Mavis home">
          <Wordmark className="!text-[#eff7ef]" />
        </Link>

        <nav
          aria-label="Footer"
          className="flex flex-wrap items-center gap-x-6 gap-y-3"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-xs text-[#a9bdac] transition-colors hover:text-[#f4fbf3]"
            >
              {link.label}
            </a>
          ))}
          <Link
            to="/chat"
            className="text-xs text-[#a9bdac] transition-colors hover:text-[#f4fbf3]"
          >
            Open Mavis
          </Link>
        </nav>

        <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#72927a]">
          © {new Date().getFullYear()} Mavis
        </p>
      </div>
    </footer>
  );
}
