import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MenuIcon, XIcon, ArrowUpRightIcon } from 'lucide-react';
import { Wordmark } from '../Wordmark';
import { navLinks } from '../../data/landing';

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line/70 bg-cream/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 sm:h-20">
        <Link to="/" className="text-base sm:text-lg" aria-label="Mavis home">
          <Wordmark />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-9 md:flex">
          {navLinks.map((link) =>
          <a
            key={link.href}
            href={link.href}
            className="text-sm text-muted transition-colors hover:text-ink">
            
              {link.label}
            </a>
          )}
          <Link
            to="/chat"
            className="group inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-peach">
            
            Try Mavis
            <ArrowUpRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink transition-colors hover:bg-sand md:hidden">
          
          {open ? <XIcon className="h-4 w-4" /> : <MenuIcon className="h-4 w-4" />}
        </button>
      </div>

      <AnimatePresence>
        {open &&
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden border-t border-line/70 bg-cream md:hidden">
          
            <nav aria-label="Mobile" className="flex flex-col gap-1 px-6 py-4">
              {navLinks.map((link) =>
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-xl px-2 py-3 text-sm text-muted transition-colors hover:bg-sand hover:text-ink">
              
                  {link.label}
                </a>
            )}
              <Link
              to="/chat"
              className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-full bg-ink px-5 py-3 text-sm font-medium text-cream">
              
                Try Mavis
                <ArrowUpRightIcon className="h-3.5 w-3.5" />
              </Link>
            </nav>
          </motion.div>
        }
      </AnimatePresence>
    </header>);

}