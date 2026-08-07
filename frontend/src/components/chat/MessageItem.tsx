import React from 'react';
import { motion } from 'framer-motion';
import { CopyIcon, RefreshCwIcon, LinkIcon } from 'lucide-react';
import type { Message } from '../../data/conversations';

type MessageItemProps = {
  message: Message;
};

export function MessageItem({ message }: MessageItemProps) {
  const isUser = message.role === 'user';

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      
      {!isUser &&
      <span
        aria-hidden="true"
        className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line bg-white font-display text-sm text-peach">
        
          M
        </span>
      }

      <div className={`max-w-[min(42rem,85%)] ${isUser ? 'text-right' : ''}`}>
        <div
          className={
          isUser ?
          'rounded-2xl rounded-br-md bg-ink px-4 py-3 text-left text-[15px] leading-relaxed text-cream' :
          'rounded-2xl rounded-tl-md border border-line bg-white px-4 py-3 text-[15px] leading-relaxed text-ink shadow-soft'
          }>
          
          <p>{message.content}</p>

          {message.code &&
          <div className="mt-3 overflow-hidden rounded-xl border border-[#33373f] bg-[#282c34]">
              <div className="flex items-center justify-between border-b border-[#33373f] px-3 py-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#9aa3b2]">
                  {message.code.language}
                </span>
                <button
                type="button"
                className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[#9aa3b2] transition-colors hover:text-white">
                
                  <CopyIcon className="h-3 w-3" /> Copy
                </button>
              </div>
              <pre className="scroll-slim overflow-x-auto p-4 text-left font-mono text-[12.5px] leading-relaxed text-[#dcdfe4]">
                {message.code.body}
              </pre>
            </div>
          }

          {message.sources && message.sources.length > 0 &&
          <ul className="mt-4 space-y-1.5 border-t border-line pt-3">
              {message.sources.map((source) =>
            <li key={source.title} className="flex items-start gap-2 text-left">
                  <LinkIcon className="mt-0.5 h-3 w-3 shrink-0 text-tan" />
                  <span className="text-xs text-muted">
                    {source.title}
                    <span className="ml-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-tan">
                      {source.domain}
                    </span>
                  </span>
                </li>
            )}
            </ul>
          }
        </div>

        {!isUser &&
        <div className="mt-2 flex items-center gap-3 pl-1">
            <button
            type="button"
            className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted transition-colors hover:text-ink">
            
              <CopyIcon className="h-3 w-3" /> Copy
            </button>
            <button
            type="button"
            className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted transition-colors hover:text-ink">
            
              <RefreshCwIcon className="h-3 w-3" /> Regenerate
            </button>
          </div>
        }
      </div>
    </motion.article>);

}