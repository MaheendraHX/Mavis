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
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const current = PERSONAS.find(p => p.id === selected) || PERSONAS[0]
  const p = palette || {}

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Change persona"
        style={{
          background: selected !== 'default' ? (p.activeItem || 'rgba(212,165,116,0.12)') : 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '0.75rem',
          fontWeight: 500,
          padding: '0.25rem 0.5rem',
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
        <span style={{ fontSize: '0.6rem', opacity: 0.5 }}>▾</span>
      </button>
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '8px',
          background: p.popover || '#fff',
          border: `1px solid ${p.popoverBorder || 'rgba(0,0,0,0.1)'}`,
          borderRadius: '12px',
          padding: '6px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          zIndex: 100,
          minWidth: '200px',
        }}>
          <div style={{ fontSize: '0.7rem', color: p.textMuted || '#6b6b6b', padding: '4px 8px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Persona
          </div>
          {PERSONAS.map(pers => (
            <button key={pers.id} onClick={() => { onSelect(pers.id); setIsOpen(false) }} style={{
              display: 'block',
              width: '100%',
              textAlign: 'left',
              background: selected === pers.id ? (p.activeItem || 'rgba(212,165,116,0.12)') : 'none',
              border: 'none',
              padding: '8px 10px',
              cursor: 'pointer',
              borderRadius: '8px',
              color: p.text || '#2d2d2d',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { if (selected !== pers.id) e.currentTarget.style.background = p.hoverItem || 'rgba(0,0,0,0.04)' }}
            onMouseLeave={e => { if (selected !== pers.id) e.currentTarget.style.background = 'none' }}
            >
              <div style={{ fontSize: '0.85rem', fontWeight: selected === pers.id ? 600 : 500, fontFamily: 'Inter, system-ui, sans-serif' }}>{pers.name}</div>
              <div style={{ fontSize: '0.72rem', color: p.textMuted || '#999', marginTop: '1px', fontFamily: 'Inter, system-ui, sans-serif' }}>{pers.description}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
