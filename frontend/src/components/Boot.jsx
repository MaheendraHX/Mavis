import { useEffect, useState } from 'react'

export default function Boot({ onComplete }) {
  const [phase, setPhase] = useState('aria-in')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('subtitle-in'), 1500)
    const t2 = setTimeout(() => setPhase('fade-out'), 3500)
    const t3 = setTimeout(() => onComplete(), 4500)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: phase === 'fade-out' ? 0 : 1,
        transition: 'opacity 1s ease',
      }}
    >
      <h1
        style={{
          fontSize: 'clamp(3rem, 10vw, 8rem)',
          fontWeight: '200',
          letterSpacing: '0.5em',
          color: '#C0C0C0',
          fontFamily: 'Georgia, serif',
          opacity: phase === 'aria-in' ? 0 : 1,
          transform: phase === 'aria-in' ? 'translateY(20px)' : 'translateY(0)',
          transition: 'opacity 1.2s ease, transform 1.2s ease',
        }}
      >
        A.R.I.A
      </h1>
      <p
        style={{
          fontSize: 'clamp(0.6rem, 1.5vw, 0.85rem)',
          letterSpacing: '0.3em',
          color: '#666',
          marginTop: '1rem',
          fontFamily: 'Georgia, serif',
          textTransform: 'uppercase',
          opacity: phase === 'subtitle-in' ? 1 : 0,
          transition: 'opacity 1s ease',
        }}
      >
        Adaptive Reasoning & Intelligence Architecture
      </p>
    </div>
  )
}