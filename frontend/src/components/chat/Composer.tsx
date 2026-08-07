import React, { useState } from 'react';
import { ArrowUpIcon, GlobeIcon, PaperclipIcon } from 'lucide-react';
import { personas } from '../../data/conversations';

type ComposerProps = {
  onSend: (value: string) => void;
  disabled?: boolean;
};

export function Composer({ onSend, disabled = false }: ComposerProps) {
  const [value, setValue] = useState('');
  const [webSearch, setWebSearch] = useState(true);
  const [persona, setPersona] = useState(personas[0]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!value.trim() || disabled) return;
    onSend(value.trim());
    setValue('');
  };

  return (
    <div className="border-t border-line bg-cream px-4 py-4 sm:px-8 sm:py-6">
      <form
        onSubmit={submit}
        className="mx-auto max-w-3xl rounded-2xl border border-line bg-white p-2 shadow-soft focus-within:border-tan">
        
        <label htmlFor="composer" className="sr-only">
          Message Mavis
        </label>
        <textarea
          id="composer"
          rows={2}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) submit(event);
          }}
          placeholder="Ask anything, or drop in a file…"
          className="scroll-slim w-full resize-none bg-transparent px-3 py-2 text-[15px] leading-relaxed text-ink outline-none placeholder:text-muted/70" />
        

        <div className="flex items-center justify-between gap-2 px-1 pt-1">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label="Attach a file"
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-sand hover:text-ink">
              
              <PaperclipIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setWebSearch((v) => !v)}
              aria-pressed={webSearch}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors ${
              webSearch ?
              'border-sage bg-sage/20 text-ink' :
              'border-line text-muted hover:text-ink'}`
              }>
              
              <GlobeIcon className="h-3 w-3" /> Web
            </button>
            <label htmlFor="persona" className="sr-only">
              Persona
            </label>
            <select
              id="persona"
              value={persona}
              onChange={(event) => setPersona(event.target.value)}
              className="rounded-full border border-line bg-white px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted outline-none transition-colors hover:text-ink">
              
              {personas.map((item) =>
              <option key={item} value={item}>
                  {item}
                </option>
              )}
            </select>
          </div>

          <button
            type="submit"
            disabled={!value.trim() || disabled}
            aria-label="Send message"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-cream transition-colors hover:bg-peach disabled:cursor-not-allowed disabled:bg-line disabled:text-muted">
            
            <ArrowUpIcon className="h-4 w-4" />
          </button>
        </div>
      </form>
      <p className="mx-auto mt-3 max-w-3xl text-center font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
        Enter to send · Shift + Enter for a new line
      </p>
    </div>);

}