import React from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, SearchIcon, Trash2Icon, PanelLeftCloseIcon } from 'lucide-react';
import { Wordmark } from '../Wordmark';
import type { Conversation } from '../../data/conversations';

type SidebarProps = {
  conversations: Conversation[];
  activeId: string;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
  onClose: () => void;
};

export function Sidebar({
  conversations,
  activeId,
  onSelect,
  onDelete,
  onNew,
  onClose
}: SidebarProps) {
  return (
    <div className="flex h-full w-[280px] flex-col border-r border-line bg-sand">
      <div className="flex items-center justify-between px-5 py-5">
        <Link to="/" className="text-sm" aria-label="Back to Mavis home">
          <Wordmark />
        </Link>
        <button
          type="button"
          onClick={onClose}
          aria-label="Collapse sidebar"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-white hover:text-ink">
          
          <PanelLeftCloseIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-2 px-4">
        <button
          type="button"
          onClick={onNew}
          className="flex w-full items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-peach">
          
          <PlusIcon className="h-4 w-4" />
          New chat
        </button>
        <div className="flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-2">
          <SearchIcon className="h-3.5 w-3.5 shrink-0 text-muted" />
          <input
            type="search"
            placeholder="Search threads"
            aria-label="Search threads"
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted/70" />
          
        </div>
      </div>

      <nav aria-label="Conversations" className="scroll-slim mt-6 flex-1 overflow-y-auto px-4 pb-6">
        <p className="px-2 pb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
          Threads
        </p>
        <ul className="space-y-0.5">
          {conversations.map((conversation) => {
            const isActive = conversation.id === activeId;
            return (
              <li key={conversation.id} className="group relative">
                <button
                  type="button"
                  onClick={() => onSelect(conversation.id)}
                  aria-current={isActive ? 'true' : undefined}
                  className={`w-full rounded-xl px-3 py-2.5 pr-9 text-left transition-colors ${
                  isActive ? 'bg-white shadow-soft' : 'hover:bg-white/60'}`
                  }>
                  
                  <span className="block truncate text-sm text-ink">{conversation.title}</span>
                  <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                    {conversation.timestamp}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(conversation.id)}
                  aria-label={`Delete ${conversation.title}`}
                  className="absolute right-2 top-3 flex h-6 w-6 items-center justify-center rounded-md text-muted opacity-0 transition-all hover:bg-sand hover:text-[#c85850] focus:opacity-100 group-hover:opacity-100">
                  
                  <Trash2Icon className="h-3.5 w-3.5" />
                </button>
              </li>);

          })}
        </ul>
      </nav>

      <div className="border-t border-line px-5 py-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">Guest access</p>
        <p className="mt-1 text-xs text-muted">12 of 20 demo messages left</p>
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-line">
          <div className="h-full w-3/5 rounded-full bg-tan" />
        </div>
      </div>
    </div>);

}