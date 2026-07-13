import { useEffect, useState } from 'react'

const palette = {
  espresso: '#382B27',
  steel: '#236088',
  indigo: '#5364B1',
  olive: '#88AE4D',
  sage: '#D2DEA0',
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
      background: palette.espresso,
      gap: '2rem',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <div style={{
        width: 80, height: 80, borderRadius: '50%',
        background: 'radial-gradient(circle at 40% 35%, rgba(210,222,160,0.25), transparent 40%), radial-gradient(circle at 55% 50%, rgba(35,96,136,0.35), transparent 45%), radial-gradient(circle at 50% 50%, rgba(136,174,77,0.15), transparent 60%)',
        boxShadow: '0 0 50px rgba(35,96,136,0.15)',
        border: '1px solid rgba(210,222,160,0.08)',
        animation: 'bootPulse 2s ease-in-out infinite',
      }} />
      <h1 style={{ fontSize: '2.2rem', fontWeight: 700, letterSpacing: '0.35em', color: palette.sage, fontFamily: 'Georgia, serif', margin: 0, minHeight: '2.8rem' }}>
        {text}<span style={{ animation: 'blink 0.8s step-end infinite', color: palette.olive }}>|</span>
      </h1>
      <p style={{ fontSize: '0.8rem', letterSpacing: '0.12em', color: 'rgba(210,222,160,0.4)', margin: 0, textTransform: 'uppercase' }}>
        Multimodal Adaptive Virtual Intelligence System
      </p>
      <div style={{ width: 200, height: 2, background: 'rgba(210,222,160,0.08)', borderRadius: 1, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: progress + '%', background: 'linear-gradient(90deg, ' + palette.steel + ', ' + palette.olive + ')', borderRadius: 1, transition: 'width 0.1s linear' }} />
      </div>
      <style>{'@keyframes bootPulse{0%,100%{transform:scale(1);opacity:0.9}50%{transform:scale(1.06);opacity:1}}@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}'}</style>
    </div>
  )
}
