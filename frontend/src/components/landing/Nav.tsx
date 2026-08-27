import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRightIcon, MenuIcon, XIcon } from "lucide-react";
import { useState } from "react";

import { Wordmark } from "@/components/mavis/Wordmark";
import { navLinks } from "@/data/landing";

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-5">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between rounded-2xl border border-white/10 bg-[#091b14]/75 px-4 shadow-[0_16px_50px_rgba(0,0,0,0.2)] backdrop-blur-xl sm:h-16 sm:px-5">
        <Link to="/" className="text-base sm:text-lg" aria-label="Mavis home">
          <Wordmark className="!text-[#eff7ef]" />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[#bbcec0] transition-colors hover:text-[#f4faf3]"
            >
              {link.label}
            </a>
          ))}
          <Link
            to="/chat"
            className="group inline-flex items-center gap-1.5 rounded-xl bg-[#dff7df] px-4 py-2.5 text-sm font-semibold text-[#0b261b] transition-all hover:-translate-y-0.5 hover:bg-[#88efb9]"
          >
            Open Mavis
            <ArrowUpRightIcon className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/12 text-[#eff7ef] transition-colors hover:bg-white/10 lg:hidden"
        >
          {open ? (
            <XIcon className="h-4 w-4" />
          ) : (
            <MenuIcon className="h-4 w-4" />
          )}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="mx-auto mt-2 max-w-7xl overflow-hidden rounded-2xl border border-white/10 bg-[#091b14]/95 p-2 shadow-[0_18px_48px_rgba(0,0,0,0.25)] backdrop-blur-xl lg:hidden"
          >
            <nav aria-label="Mobile" className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-3 text-sm text-[#c4d5c8] transition-colors hover:bg-white/8 hover:text-white"
                >
                  {link.label}
                </a>
              ))}
              <Link
                to="/chat"
                onClick={() => setOpen(false)}
                className="mt-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#dff7df] px-4 py-3 text-sm font-semibold text-[#0b261b]"
              >
                Open Mavis
                <ArrowUpRightIcon className="h-3.5 w-3.5" />
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
