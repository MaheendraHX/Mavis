import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

export default function SignIn({ onSuccess }) {
  const wrapRef = useRef(null)
  const panelRef = useRef(null)
  const glowRef = useRef(null)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    if (wrapRef.current) {
      gsap.fromTo(wrapRef.current, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: 'power2.out' })
    }
    if (panelRef.current) {
      gsap.fromTo(
        panelRef.current,
        { y: 28, opacity: 0, scale: 0.98 },
        { y: 0, opacity: 1, scale: 1, duration: 0.95, ease: 'power3.out', delay: 0.08 }
      )
    }
    if (glowRef.current) {
      gsap.to(glowRef.current, {
        scale: 1.04,
        opacity: 0.85,
        duration: 3.5,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      })
    }
  }, [])

  const goToChat = () => {
    if (exiting) return
    setExiting(true)
    gsap.to(panelRef.current, {
      y: 12,
      opacity: 0,
      scale: 0.985,
      duration: 0.35,
      ease: 'power2.inOut',
    })
    gsap.to(wrapRef.current, {
      opacity: 0,
      duration: 0.45,
      delay: 0.12,
      ease: 'power2.out',
      onComplete: () => onSuccess('guest'),
    })
  }

  const pillStyle = {
    padding: '0.98rem 1rem',
    borderRadius: '999px',
    fontSize: '0.72rem',
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontWeight: 500,
  }

  return (
    <div
      ref={wrapRef}
      style={{
        width: '100vw',
        minHeight: '100vh',
        background:
          'radial-gradient(circle at top, rgba(212,168,83,0.08), transparent 24%), radial-gradient(circle at 20% 80%, rgba(255,255,255,0.04), transparent 18%), #050506',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#f5efdf',
        overflow: 'hidden',
        position: 'relative',
        padding: '1.25rem',
        opacity: 1,
      }}
    >
      <div
        ref={glowRef}
        style={{
          position: 'absolute',
          width: 520,
          height: 520,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(212,168,83,0.12), rgba(212,168,83,0.05) 35%, transparent 70%)',
          filter: 'blur(40px)',
          opacity: 0.65,
          pointerEvents: 'none',
          transform: 'translateY(-8%)',
        }}
      />

      <div
        ref={panelRef}
        style={{
          width: 'min(460px, 92vw)',
          padding: '2rem 1.65rem 1.5rem',
          borderRadius: '28px',
          background: 'rgba(11, 12, 14, 0.62)',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 18px 60px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.05)',
          backdropFilter: 'blur(24px) saturate(125%)',
          WebkitBackdropFilter: 'blur(24px) saturate(125%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.35rem',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <div
          style={{
            width: 68,
            height: 68,
            borderRadius: '50%',
            background:
              'radial-gradient(circle at 35% 35%, rgba(245,239,223,0.96), rgba(212,168,83,0.36) 32%, rgba(212,168,83,0.12) 62%, transparent 72%)',
            border: '1px solid rgba(212,168,83,0.2)',
            boxShadow: '0 0 28px rgba(212,168,83,0.12)',
          }}
        />

        <div style={{ textAlign: 'center' }}>
          <h2
            style={{
              fontSize: '1.3rem',
              fontWeight: 400,
              letterSpacing: '0.34em',
              color: '#f5efdf',
              fontFamily: 'Georgia, serif',
              margin: 0,
            }}
          >
            A.R.I.A
          </h2>
          <p
            style={{
              fontSize: '0.63rem',
              letterSpacing: '0.28em',
              color: 'rgba(212,168,83,0.66)',
              marginTop: '0.7rem',
              textTransform: 'uppercase',
            }}
          >
            Access gateway
          </p>
          <p
            style={{
              fontSize: '0.88rem',
              lineHeight: 1.7,
              color: 'rgba(245,239,223,0.62)',
              margin: '0.9rem auto 0',
              maxWidth: 320,
            }}
          >
Try ARIA, the AI assistant demo.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', width: '100%', maxWidth: 320 }}>
          <button
            onClick={goToChat}
            style={{
              ...pillStyle,
              background: 'rgba(212,168,83,0.1)',
              border: '1px solid rgba(212,168,83,0.22)',
              color: '#f5efdf',
            }}
          >
            Enter Demo
          </button>
        </div>
      </div>
    </div>
  )
}