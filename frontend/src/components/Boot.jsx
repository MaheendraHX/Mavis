import { useEffect, useState } from 'react'

const palette = {
  bg: '#faf9f7',
  text: '#2d2d2d',
  textMuted: '#6b6b6b',
  primary: '#d4a574',
  secondary: '#e89f71',
  accent: '#a8d5ba',
  border: 'rgba(0,0,0,0.08)',
}

export default function Boot({ onComplete }) {
  const [progress, setProgress] = useState(0)
  const [text, setText] = useState('')
  const fullText = 'MAVIS'

  useEffect(() => {
    let i = 0
    const typeInterval = setInterval(() => {
      if (i <= fullText.length) {
        setText(fullText.slice(0, i))
        i++
      } else {
        clearInterval(typeInterval)
      }
    }, 180)

    const duration = 2800
    const start = Date.now()
    const progInterval = setInterval(() => {
      const elapsed = Date.now() - start
      const p = Math.min((elapsed / duration) * 100, 100)
      setProgress(p)
      if (p >= 100) {
        clearInterval(progInterval)
        setTimeout(() => onComplete?.(), 400)
      }
    }, 30)

    return () => {
      clearInterval(typeInterval)
      clearInterval(progInterval)
    }
  }, [onComplete])

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: palette.bg,
      gap: '2rem',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <div style={{
        width: 80,
        height: 80,
        borderRadius: '50%',
        background: `
          radial-gradient(circle at 38% 34%, rgba(255,255,255,0.9), transparent 34%),
          radial-gradient(circle at 58% 50%, rgba(232,159,113,0.38), transparent 46%),
          radial-gradient(circle at 48% 55%, rgba(168,213,186,0.34), transparent 62%)
        `,
        boxShadow: '0 16px 44px rgba(232,159,113,0.18)',
        border: `1px solid ${palette.border}`,
        animation: 'bootPulse 2s ease-in-out infinite',
      }} />
      <h1 style={{
        fontSize: '2.2rem',
        fontWeight: 700,
        letterSpacing: '0.35em',
        color: palette.text,
        fontFamily: 'Georgia, serif',
        margin: 0,
        minHeight: '2.8rem',
      }}>
        {text}<span style={{ animation: 'blink 0.8s step-end infinite', color: palette.secondary }}>|</span>
      </h1>
      <p style={{
        fontSize: '0.8rem',
        letterSpacing: '0.12em',
        color: palette.textMuted,
        margin: 0,
        textTransform: 'uppercase',
      }}>
        Multimodal Adaptive Virtual Intelligence System
      </p>
      <div style={{
        width: 200,
        height: 3,
        background: 'rgba(0,0,0,0.06)',
        borderRadius: 999,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: progress + '%',
          background: `linear-gradient(90deg, ${palette.primary}, ${palette.secondary})`,
          borderRadius: 999,
          transition: 'width 0.1s linear',
        }} />
      </div>
      <style>{'@keyframes bootPulse{0%,100%{transform:scale(1);opacity:0.92}50%{transform:scale(1.06);opacity:1}}@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}'}</style>
    </div>
  )
}
