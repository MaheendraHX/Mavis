import React, { useState, useRef, useEffect } from 'react'

const PERSONAS = [
  { id: 'default', name: 'Default', icon: '🤖', description: 'Helpful AI assistant' },
  { id: 'coder', name: 'Coder', icon: '💻', description: 'Expert programmer' },
  { id: 'writer', name: 'Writer', icon: '✍️', description: 'Creative writing expert' },
  { id: 'analyst', name: 'Analyst', icon: '📊', description: 'Data & research analyst' },
  { id: 'tutor', name: 'Tutor', icon: '🎓', description: 'Patient teacher' },
  { id: 'casual', name: 'Casual', icon: '😎', description: 'Relaxed & friendly' },
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
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '1rem',
          padding: '0.3rem',
          borderRadius: '8px',
          transition: 'transform 0.2s',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <span>{current.icon}</span>
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
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              width: '100%',
              background: selected === pers.id ? (p.activeItem || 'rgba(212,165,116,0.12)') : 'none',
              border: 'none',
              padding: '8px 10px',
              cursor: 'pointer',
              borderRadius: '8px',
              fontSize: '0.85rem',
              color: p.text || '#2d2d2d',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { if (selected !== pers.id) e.currentTarget.style.background = p.hoverItem || 'rgba(0,0,0,0.04)' }}
            onMouseLeave={e => { if (selected !== pers.id) e.currentTarget.style.background = 'none' }}
            >
              <span style={{ fontSize: '1.1rem' }}>{pers.icon}</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 500 }}>{pers.name}</div>
                <div style={{ fontSize: '0.72rem', color: p.textMuted || '#999' }}>{pers.description}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
