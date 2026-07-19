import React, { useState, useRef, useEffect } from 'react'

export default function ConversationSearch({ conversations, onSelectConversation }) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus()
  }, [isOpen])

  // Keyboard shortcut: Ctrl+K or Cmd+K
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const filtered = query.trim()
    ? conversations.filter(c =>
        (c.title || '').toLowerCase().includes(query.toLowerCase())
      )
    : []

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        title="Search conversations (Ctrl+K)"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '1rem',
          padding: '0.3rem',
          borderRadius: '8px',
          transition: 'transform 0.2s',
          display: 'flex',
          alignItems: 'center',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        🔍
      </button>
    )
  }

  return (
    <>
      <div
        onClick={() => setIsOpen(false)}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.3)',
          zIndex: 999,
        }}
      />
      <div style={{
        position: 'fixed',
        top: '15%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '90%',
        maxWidth: '500px',
        background: '#fff',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        zIndex: 1000,
        overflow: 'hidden',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '12px 16px',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
          gap: '8px',
        }}>
          <span style={{ fontSize: '1rem', opacity: 0.5 }}>🔍</span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search conversations..."
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '0.95rem',
              fontFamily: 'Inter, system-ui, sans-serif',
              background: 'transparent',
              color: '#2d2d2d',
            }}
          />
          <span style={{ fontSize: '0.7rem', color: '#999', fontFamily: 'monospace' }}>ESC</span>
        </div>
        <div style={{ maxHeight: '300px', overflowY: 'auto', padding: '4px' }}>
          {query.trim() === '' && (
            <div style={{ padding: '20px', textAlign: 'center', color: '#999', fontSize: '0.85rem' }}>
              Type to search your conversations...
            </div>
          )}
          {query.trim() !== '' && filtered.length === 0 && (
            <div style={{ padding: '20px', textAlign: 'center', color: '#999', fontSize: '0.85rem' }}>
              No conversations found
            </div>
          )}
          {filtered.map(conv => (
            <button
              key={conv.id}
              onClick={() => { onSelectConversation(conv.id); setIsOpen(false); setQuery('') }}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                background: 'none',
                border: 'none',
                padding: '10px 12px',
                cursor: 'pointer',
                borderRadius: '8px',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <div style={{ fontSize: '0.9rem', color: '#2d2d2d', fontWeight: 500 }}>
                {conv.title || 'Untitled conversation'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '2px' }}>
                {new Date(conv.created_at).toLocaleDateString()}
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
