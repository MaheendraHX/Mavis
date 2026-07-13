import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const palette = {
  bg: '#faf9f7',
  surface: '#ffffff',
  text: '#2d2d2d',
  textMuted: '#6b6b6b',
  primary: '#d4a574',
  secondary: '#e89f71',
  accent: '#a8d5ba',
  border: 'rgba(0,0,0,0.08)',
  hover: 'rgba(212,165,116,0.1)',
  shadow: 'rgba(62,42,28,0.08)',
}

export default function Landing({ onEnter }) {
  const heroRef = useRef(null)
  const orbRef = useRef(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (heroRef.current) {
      gsap.fromTo(
        heroRef.current.querySelectorAll('.hero-reveal'),
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.1, stagger: 0.15, ease: 'power3.out', delay: 0.3 }
      )
    }

    if (orbRef.current) {
      gsap.to(orbRef.current, {
        y: -18,
        duration: 4,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      })
    }

    const reveals = document.querySelectorAll('.reveal')
    reveals.forEach(el => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        onEnter: () => el.classList.add('visible'),
        once: true,
      })
    })

    return () => ScrollTrigger.getAll().forEach(t => t.kill())
  }, [])

  const goToChat = () => onEnter?.('chat')

  const features = [
    { icon: 'Text', title: 'Multimodal Understanding', desc: 'Process text, files, images, and code in one conversation.' },
    { icon: 'Web', title: 'Real-Time Web Search', desc: 'Pull live information when a question needs current context.' },
    { icon: 'Memory', title: 'Context-Aware Memory', desc: 'Conversation titles and history stay organized across sessions.' },
    { icon: 'Code', title: 'Code & Creative Suite', desc: 'Draft, debug, explain, and shape ideas without switching tools.' },
    { icon: 'Private', title: 'Privacy First', desc: 'The public demo stays simple while full access remains private.' },
    { icon: 'Fast', title: 'Lightning Fast', desc: 'A focused interface built for quick back-and-forth work.' },
  ]

  const steps = [
    { num: '01', title: 'Start a Conversation', desc: 'Open the demo and type naturally. No setup needed.' },
    { num: '02', title: 'Attach or Ask', desc: 'Use files, research prompts, creative requests, or code questions.' },
    { num: '03', title: 'Get Results', desc: 'Mavis responds with context, titles the chat, and keeps the thread tidy.' },
  ]

  const techStack = ['React', 'Three.js', 'FastAPI', 'Python', 'GSAP', 'DuckDuckGo', 'Vite', 'Render', 'Vercel']

  const buttonPrimary = {
    padding: '0.85rem 2rem',
    borderRadius: '999px',
    background: palette.secondary,
    border: 'none',
    color: '#fff',
    fontSize: '0.92rem',
    fontWeight: 700,
    letterSpacing: '0.03em',
    cursor: 'pointer',
    transition: 'all 0.25s',
    fontFamily: 'Inter, system-ui, sans-serif',
    boxShadow: '0 12px 28px rgba(232,159,113,0.22)',
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: palette.bg,
      color: palette.text,
      fontFamily: 'Inter, system-ui, sans-serif',
      overflowX: 'hidden',
    }}>
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: '1rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(255,255,255,0.82)',
        backdropFilter: 'blur(20px) saturate(140%)',
        WebkitBackdropFilter: 'blur(20px) saturate(140%)',
        borderBottom: `1px solid ${palette.border}`,
      }}>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.35rem',
            fontWeight: 700,
            letterSpacing: '0.28em',
            color: palette.text,
            fontFamily: 'Georgia, serif',
            cursor: 'pointer',
          }}
          aria-label="Go to top"
        >
          MAVIS
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }} className="desktop-nav">
          {['Features', 'How It Works', 'Tech'].map(link => (
            <a
              key={link}
              href={`#${link.toLowerCase().replace(/\s/g, '-')}`}
              style={{
                color: palette.textMuted,
                textDecoration: 'none',
                fontSize: '0.82rem',
                letterSpacing: '0.04em',
                transition: 'color 0.25s',
                fontWeight: 500,
              }}
              onMouseEnter={e => e.target.style.color = palette.text}
              onMouseLeave={e => e.target.style.color = palette.textMuted}
            >
              {link}
            </a>
          ))}
          <button
            onClick={goToChat}
            style={{ ...buttonPrimary, padding: '0.55rem 1.35rem', fontSize: '0.8rem' }}
            onMouseEnter={e => { e.target.style.background = palette.primary; e.target.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.target.style.background = palette.secondary; e.target.style.transform = 'translateY(0)' }}
          >
            Try Mavis
          </button>
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            color: palette.text,
            fontSize: '1rem',
            cursor: 'pointer',
            padding: '0.5rem',
            fontWeight: 700,
          }}
          className="mobile-menu-btn"
          aria-label="Toggle navigation"
        >
          {menuOpen ? 'Close' : 'Menu'}
        </button>
      </nav>

      {menuOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 99,
          background: 'rgba(250,249,247,0.98)',
          backdropFilter: 'blur(20px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2rem',
        }}>
          {['Features', 'How It Works', 'Tech'].map(link => (
            <a
              key={link}
              href={`#${link.toLowerCase().replace(/\s/g, '-')}`}
              onClick={() => setMenuOpen(false)}
              style={{
                color: palette.text,
                textDecoration: 'none',
                fontSize: '1.25rem',
                letterSpacing: '0.06em',
                fontWeight: 600,
              }}
            >
              {link}
            </a>
          ))}
          <button onClick={() => { setMenuOpen(false); goToChat() }} style={buttonPrimary}>
            Try Mavis
          </button>
        </div>
      )}

      <section
        ref={heroRef}
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '6rem 2rem 4rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(ellipse 60% 45% at 80% 18%, rgba(232,159,113,0.14), transparent 62%),
            radial-gradient(ellipse 50% 38% at 18% 74%, rgba(212,165,116,0.16), transparent 58%),
            radial-gradient(ellipse 46% 36% at 52% 48%, rgba(168,213,186,0.12), transparent 62%)
          `,
          pointerEvents: 'none',
        }} />

        <div style={{
          maxWidth: 1180,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '3rem',
          position: 'relative',
          zIndex: 2,
          flexWrap: 'wrap',
        }}>
          <div style={{ flex: '1 1 500px', maxWidth: 620 }}>
            <div className="hero-reveal" style={{
              display: 'inline-block',
              padding: '0.35rem 1rem',
              borderRadius: '999px',
              background: palette.hover,
              border: `1px solid ${palette.border}`,
              fontSize: '0.72rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: palette.text,
              marginBottom: '1.5rem',
              fontWeight: 700,
            }}>
              Now in Public Demo
            </div>

            <h1 className="hero-reveal" style={{
              fontSize: 'clamp(2.8rem, 6vw, 4.7rem)',
              fontWeight: 700,
              lineHeight: 1.08,
              color: palette.text,
              margin: 0,
              fontFamily: 'Playfair Display, Georgia, serif',
            }}>
              Your AI,<br />
              <span style={{ color: palette.secondary }}>amplified.</span>
            </h1>

            <p className="hero-reveal" style={{
              fontSize: '1.08rem',
              lineHeight: 1.7,
              color: palette.textMuted,
              margin: '1.5rem 0 2rem',
              maxWidth: 500,
              fontWeight: 400,
            }}>
              Mavis is a multimodal AI assistant that searches the web, reads files, writes code, and keeps conversations organized in one warm workspace.
            </p>

            <div className="hero-reveal" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={goToChat}
                style={buttonPrimary}
                onMouseEnter={e => { e.target.style.background = palette.primary; e.target.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.target.style.background = palette.secondary; e.target.style.transform = 'translateY(0)' }}
              >
                Start Chatting
              </button>
              <button
                onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                style={{
                  ...buttonPrimary,
                  background: palette.surface,
                  border: `1px solid ${palette.primary}`,
                  color: palette.text,
                  boxShadow: 'none',
                }}
                onMouseEnter={e => { e.target.style.background = palette.hover }}
                onMouseLeave={e => { e.target.style.background = palette.surface }}
              >
                See Features
              </button>
            </div>
          </div>

          <div
            ref={orbRef}
            style={{
              flex: '0 0 auto',
              width: 'clamp(250px, 34vw, 410px)',
              height: 'clamp(250px, 34vw, 410px)',
              borderRadius: '50%',
              background: `
                radial-gradient(circle at 38% 32%, rgba(255,255,255,0.92), transparent 30%),
                radial-gradient(circle at 58% 48%, rgba(232,159,113,0.35), transparent 42%),
                radial-gradient(circle at 44% 58%, rgba(168,213,186,0.28), transparent 58%),
                radial-gradient(circle at 50% 50%, rgba(212,165,116,0.22), transparent 68%)
              `,
              boxShadow: '0 28px 90px rgba(232,159,113,0.2), inset 0 0 60px rgba(255,255,255,0.45)',
              border: `1px solid ${palette.border}`,
              position: 'relative',
            }}
          >
            <div style={{ position: 'absolute', inset: '15%', borderRadius: '50%', border: `1px solid ${palette.border}` }} />
            <div style={{ position: 'absolute', inset: '30%', borderRadius: '50%', border: '1px solid rgba(168,213,186,0.35)' }} />
          </div>
        </div>
      </section>

      {/* Demo Notice Banner */}
      <section style={{ padding: '0 2rem' }}>
        <div style={{
          maxWidth: 900,
          margin: '0 auto',
          padding: '1.5rem 2rem',
          borderRadius: '14px',
          background: 'rgba(232,159,113,0.06)',
          border: `1px solid rgba(232,159,113,0.18)`,
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1rem',
        }}>
          <span style={{ fontSize: '1.3rem', marginTop: '0.1rem', flexShrink: 0 }}>Demo</span>
          <div>
            <p style={{ fontSize: '0.92rem', fontWeight: 600, color: palette.text, margin: '0 0 0.4rem', lineHeight: 1.5 }}>
              This is a public demo of Mavis.
            </p>
            <p style={{ fontSize: '0.84rem', color: palette.textMuted, margin: 0, lineHeight: 1.65 }}>
              You can chat, search the web, and attach files — all without signing up. 
              The full version includes voice interaction, PC control, persistent memory, 
              and unlimited conversations. Those features are reserved for private access.
            </p>
          </div>
        </div>
      </section>

      <section id="features" style={{ padding: '6rem 2rem', maxWidth: 1200, margin: '0 auto' }}>
        <div className="reveal" style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <span style={{ fontSize: '0.72rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: palette.secondary, fontWeight: 700 }}>
            Capabilities
          </span>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 700, color: palette.text, margin: '0.6rem 0 0.8rem', fontFamily: 'Playfair Display, Georgia, serif' }}>
            Everything you need
          </h2>
          <p style={{ fontSize: '1rem', color: palette.textMuted, maxWidth: 500, margin: '0 auto', lineHeight: 1.6 }}>
            One assistant. Every task. No switching between tools.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {features.map((f) => (
            <div
              key={f.title}
              className="reveal"
              style={{
                padding: '2rem 1.75rem',
                borderRadius: '14px',
                background: palette.surface,
                border: `1px solid ${palette.border}`,
                boxShadow: `0 12px 36px ${palette.shadow}`,
                transition: 'all 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
                cursor: 'default',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.borderColor = palette.primary
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.borderColor = palette.border
              }}
            >
              <div style={{ fontSize: '0.75rem', color: palette.secondary, marginBottom: '1rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: palette.text, margin: '0 0 0.5rem' }}>
                {f.title}
              </h3>
              <p style={{ fontSize: '0.88rem', lineHeight: 1.65, color: palette.textMuted, margin: 0 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" style={{ padding: '6rem 2rem', background: 'rgba(232,159,113,0.08)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="reveal" style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span style={{ fontSize: '0.72rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: palette.secondary, fontWeight: 700 }}>
              How It Works
            </span>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 700, color: palette.text, margin: '0.6rem 0 0.8rem', fontFamily: 'Playfair Display, Georgia, serif' }}>
              Three steps to smarter work
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {steps.map((s) => (
              <div key={s.num} className="reveal" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: palette.secondary,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  margin: '0 auto 1.5rem',
                }}>
                  {s.num}
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: palette.text, margin: '0 0 0.5rem' }}>{s.title}</h3>
                <p style={{ fontSize: '0.88rem', lineHeight: 1.65, color: palette.textMuted, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="tech" style={{ padding: '6rem 2rem', maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
        <div className="reveal" style={{ marginBottom: '3rem' }}>
          <span style={{ fontSize: '0.72rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: palette.secondary, fontWeight: 700 }}>
            Built With
          </span>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 700, color: palette.text, margin: '0.6rem 0 0.8rem', fontFamily: 'Playfair Display, Georgia, serif' }}>
            Modern stack, real results
          </h2>
        </div>

        <div className="reveal" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.75rem' }}>
          {techStack.map(tech => (
            <span
              key={tech}
              style={{
                padding: '0.5rem 1.2rem',
                borderRadius: '999px',
                background: palette.surface,
                border: `1px solid ${palette.primary}`,
                fontSize: '0.8rem',
                letterSpacing: '0.04em',
                color: palette.text,
                fontWeight: 600,
                transition: 'all 0.25s',
              }}
            >
              {tech}
            </span>
          ))}
        </div>
      </section>

      <section style={{
        padding: '6rem 2rem',
        textAlign: 'center',
        background: 'linear-gradient(180deg, rgba(250,249,247,0) 0%, rgba(232,159,113,0.12) 100%)',
        borderTop: `1px solid ${palette.border}`,
      }}>
        <div className="reveal">
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 700, color: palette.text, margin: '0 0 1rem', fontFamily: 'Playfair Display, Georgia, serif' }}>
            Ready to meet Mavis?
          </h2>
          <p style={{ fontSize: '1.05rem', color: palette.textMuted, margin: '0 auto 2rem', maxWidth: 480, lineHeight: 1.6 }}>
            No sign-up. No credit card. Just a conversation with the future of AI assistance.
          </p>
          <button
            onClick={goToChat}
            style={buttonPrimary}
            onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.background = palette.primary }}
            onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.background = palette.secondary }}
          >
            Launch Demo
          </button>
        </div>
      </section>

      <footer style={{
        padding: '2.5rem 2rem',
        textAlign: 'center',
        borderTop: `1px solid ${palette.border}`,
        fontSize: '0.78rem',
        color: palette.textMuted,
        letterSpacing: '0.04em',
      }}>
        © 2026 Mavis - Multimodal Adaptive Virtual Intelligence System
      </footer>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
          section { padding-left: 1.25rem !important; padding-right: 1.25rem !important; }
        }
      `}</style>
    </div>
  )
}
