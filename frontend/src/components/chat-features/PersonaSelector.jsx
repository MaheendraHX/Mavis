import React, { useState, useRef, useEffect } from 'react'

const PERSONAS = [
  { id: 'default', name: 'Default', description: 'Helpful AI assistant' },
  { id: 'coder', name: 'Coder', description: 'Expert programmer' },
  { id: 'writer', name: 'Writer', description: 'Creative writing expert' },
  { id: 'analyst', name: 'Analyst', description: 'Data & research analyst' },
  { id: 'tutor', name: 'Tutor', description: 'Patient teacher' },
  { id: 'casual', name: 'Casual', description: 'Relaxed & friendly' },
]

export default function PersonaSelector({ selected, onSelect, palette }) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [isOpen])

  const current = PERSONAS.find(p => p.id === selected) || PERSONAS[0]
  const p = palette || {}

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen) }}
        title="Change persona"
        style={{
          background: selected !== 'default' ? (p.activeItem || 'rgba(212,165,116,0.12)') : 'none',
          border: `1px solid ${selected !== 'default' ? (p.primary || '#d4a574') : 'transparent'}`,
          cursor: 'pointer',
          fontSize: '0.75rem',
          fontWeight: 500,
          padding: '0.35rem 0.6rem',
          borderRadius: '6px',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          color: p.text || '#2d2d2d',
          fontFamily: 'Inter, system-ui, sans-serif',
          letterSpacing: '0.02em',
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
      >
        {current.name}
        <span style={{ fontSize: '0.55rem', opacity: 0.5 }}>▾</span>
      </button>
      {isOpen && (
        <div style={{
          position: 'fixed',
          top: '4rem',
          right: '1rem',
          background: p.popover || '#fff',
          border: `1px solid ${p.popoverBorder || 'rgba(0,0,0,0.1)'}`,
          borderRadius: '12px',
          padding: '6px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          zIndex: 9999,
          minWidth: '200px',
          maxHeight: '320px',
          overflowY: 'auto',
        }}>
          <div style={{ fontSize: '0.7rem', color: p.textMuted || '#6b6b6b', padding: '6px 10px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Persona
          </div>
          {PERSONAS.map(pers => (
            <button key={pers.id} onClick={(e) => { e.stopPropagation(); onSelect(pers.id); setIsOpen(false) }} style={{
              display: 'block',
              width: '100%',
              textAlign: 'left',
              background: selected === pers.id ? (p.activeItem || 'rgba(212,165,116,0.12)') : 'none',
              border: selected === pers.id ? `1px solid ${p.primary || '#d4a574'}` : '1px solid transparent',
              padding: '10px 12px',
              cursor: 'pointer',
              borderRadius: '8px',
              color: p.text || '#2d2d2d',
              transition: 'background 0.15s',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
            onMouseEnter={e => { if (selected !== pers.id) e.currentTarget.style.background = p.hoverItem || 'rgba(0,0,0,0.04)' }}
            onMouseLeave={e => { if (selected !== pers.id) e.currentTarget.style.background = 'none' }}
            >
              <div style={{ fontSize: '0.85rem', fontWeight: selected === pers.id ? 600 : 500 }}>{pers.name}</div>
              <div style={{ fontSize: '0.72rem', color: p.textMuted || '#999', marginTop: '2px' }}>{pers.description}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
