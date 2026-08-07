import React from 'react';
import { Link } from 'react-router-dom';
import { Wordmark } from '../Wordmark';
import { navLinks } from '../../data/landing';

export function Footer() {
  return (
    <footer className="border-t border-line bg-cream">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <Link to="/" className="text-sm" aria-label="Mavis home">
          <Wordmark />
        </Link>

        <nav aria-label="Footer" className="flex flex-wrap items-center gap-6">
          {navLinks.map((link) =>
          <a
            key={link.href}
            href={link.href}
            className="text-xs text-muted transition-colors hover:text-ink">
            
              {link.label}
            </a>
          )}
          <Link to="/chat" className="text-xs text-muted transition-colors hover:text-ink">
            Demo
          </Link>
        </nav>

        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
          © {new Date().getFullYear()} Mavis
        </p>
      </div>
    </footer>);

}