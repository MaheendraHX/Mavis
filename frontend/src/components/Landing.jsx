import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const palette = {
  espresso: '#382B27',
  steel: '#236088',
  indigo: '#5364B1',
  olive: '#88AE4D',
  sage: '#D2DEA0',
  espressoLight: '#4a3d39',
  espressoDark: '#1f1815',
}

export default function Landing({ onEnter }) {
  const heroRef = useRef(null)
  const orbRef = useRef(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    // Hero entrance
    if (heroRef.current) {
      gsap.fromTo(
        heroRef.current.querySelectorAll('.hero-reveal'),
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.1, stagger: 0.15, ease: 'power3.out', delay: 0.3 }
      )
    }

    // Floating orb
    if (orbRef.current) {
      gsap.to(orbRef.current, {
        y: -20,
        duration: 4,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      })
    }

    // Scroll reveals
    const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right')
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
    {
      icon: '◆',
      title: 'Multimodal Understanding',
      desc: 'Process text, images, and code simultaneously. Mavis sees the full picture, not just words.',
    },
    {
      icon: '◇',
      title: 'Real-Time Web Search',
      desc: 'Pull live information from the web mid-conversation. Always current, never outdated.',
    },
    {
      icon: '◈',
      title: 'Context-Aware Memory',
      desc: 'Conversations that actually remember. Mavis tracks context across sessions for deeper assistance.',
    },
    {
      icon: '⬖',
      title: 'Code & Creative Suite',
      desc: 'Write, debug, and explain code. Generate creative content. One assistant for all your work.',
    },
    {
      icon: '⬗',
      title: 'Privacy First',
      desc: 'No account required for demo. Your conversations stay yours. Built with privacy at the core.',
    },
    {
      icon: '◉',
      title: 'Lightning Fast',
      desc: 'Streaming responses with sub-second first-token latency. No waiting, just flowing conversation.',
    },
  ]

  const steps = [
    { num: '01', title: 'Start a Conversation', desc: 'Just type. No setup, no configuration. Mavis is ready the moment you are.' },
    { num: '02', title: 'Ask Anything', desc: 'Code, research, creative writing, analysis — Mavis adapts to whatever you need.' },
    { num: '03', title: 'Get Results', desc: 'Streaming responses, web-sourced facts, and contextual memory deliver exactly what you asked for.' },
  ]

  const techStack = [
    'React', 'Three.js', 'FastAPI', 'Python', 'WebSocket', 'GSAP',
    'DuckDuckGo', 'Vite', 'Render', 'Vercel', 'Tailwind', 'R3F',
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: palette.espresso,
      color: palette.sage,
      fontFamily: 'Inter, system-ui, sans-serif',
      overflowX: 'hidden',
    }}>
      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: '1.25rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(56,43,39,0.75)',
        backdropFilter: 'blur(20px) saturate(140%)',
        WebkitBackdropFilter: 'blur(20px) saturate(140%)',
        borderBottom: '1px solid rgba(210,222,160,0.06)',
      }}>
        <div style={{
          fontSize: '1.35rem',
          fontWeight: 700,
          letterSpacing: '0.28em',
          color: palette.sage,
          fontFamily: 'Georgia, serif',
          cursor: 'pointer',
        }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          MAVIS
        </div>

        {/* Desktop nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }} className="desktop-nav">
          {['Features', 'How It Works', 'Tech'].map(link => (
            <a
              key={link}
              href={`#${link.toLowerCase().replace(/\s/g, '-')}`}
              style={{
                color: 'rgba(210,222,160,0.65)',
                textDecoration: 'none',
                fontSize: '0.82rem',
                letterSpacing: '0.06em',
                transition: 'color 0.25s',
                fontWeight: 400,
              }}
              onMouseEnter={e => e.target.style.color = palette.sage}
              onMouseLeave={e => e.target.style.color = 'rgba(210,222,160,0.65)'}
            >
              {link}
            </a>
          ))}
          <button
            onClick={goToChat}
            style={{
              padding: '0.55rem 1.4rem',
              borderRadius: '999px',
              background: palette.steel,
              border: 'none',
              color: '#fff',
              fontSize: '0.78rem',
              fontWeight: 600,
              letterSpacing: '0.04em',
              cursor: 'pointer',
              transition: 'all 0.25s',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
            onMouseEnter={e => { e.target.style.background = palette.indigo; e.target.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.target.style.background = palette.steel; e.target.style.transform = 'translateY(0)' }}
          >
            Try Mavis
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            color: palette.sage,
            fontSize: '1.5rem',
            cursor: 'pointer',
            padding: '0.5rem',
          }}
          className="mobile-menu-btn"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 99,
          background: 'rgba(31,24,21,0.97)',
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
                color: palette.sage,
                textDecoration: 'none',
                fontSize: '1.3rem',
                letterSpacing: '0.08em',
                fontWeight: 300,
              }}
            >
              {link}
            </a>
          ))}
          <button
            onClick={() => { setMenuOpen(false); goToChat() }}
            style={{
              padding: '0.8rem 2rem',
              borderRadius: '999px',
              background: palette.steel,
              border: 'none',
              color: '#fff',
              fontSize: '1rem',
              fontWeight: 600,
              letterSpacing: '0.04em',
              cursor: 'pointer',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            Try Mavis
          </button>
        </div>
      )}

      {/* ── HERO ── */}
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
        {/* Hero background gradient */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(ellipse 80% 60% at 50% 30%, rgba(35,96,136,0.12), transparent 60%),
            radial-gradient(ellipse 60% 50% at 80% 70%, rgba(136,174,77,0.06), transparent 50%),
            radial-gradient(ellipse 50% 40% at 20% 50%, rgba(83,100,177,0.08), transparent 50%)
          `,
          pointerEvents: 'none',
        }} />

        <div style={{
          maxWidth: 1200,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '3rem',
          position: 'relative',
          zIndex: 2,
          flexWrap: 'wrap',
        }}>
          {/* Left: Text */}
          <div style={{ flex: '1 1 500px', maxWidth: 600 }}>
            <div
              className="hero-reveal"
              style={{
                display: 'inline-block',
                padding: '0.35rem 1rem',
                borderRadius: '999px',
                background: 'rgba(136,174,77,0.1)',
                border: '1px solid rgba(136,174,77,0.2)',
                fontSize: '0.72rem',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: palette.olive,
                marginBottom: '1.5rem',
                fontWeight: 500,
              }}
            >
              Now in Public Demo
            </div>

            <h1
              className="hero-reveal"
              style={{
                fontSize: 'clamp(2.8rem, 6vw, 4.5rem)',
                fontWeight: 700,
                lineHeight: 1.08,
                letterSpacing: '-0.02em',
                color: palette.sage,
                margin: 0,
                fontFamily: 'Playfair Display, Georgia, serif',
              }}
            >
              Your AI,<br />
              <span style={{ color: palette.olive }}>amplified.</span>
            </h1>

            <p
              className="hero-reveal"
              style={{
                fontSize: '1.15rem',
                lineHeight: 1.7,
                color: 'rgba(210,222,160,0.65)',
                margin: '1.5rem 0 2rem',
                maxWidth: 460,
                fontWeight: 350,
              }}
            >
              Mavis is a multimodal AI assistant that searches the web, writes code, and remembers context — all in a single, seamless conversation.
            </p>

            <div className="hero-reveal" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={goToChat}
                style={{
                  padding: '0.85rem 2rem',
                  borderRadius: '999px',
                  background: palette.steel,
                  border: 'none',
                  color: '#fff',
                  fontSize: '0.92rem',
                  fontWeight: 600,
                  letterSpacing: '0.03em',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  boxShadow: '0 4px 24px rgba(35,96,136,0.3)',
                }}
                onMouseEnter={e => { e.target.style.background = palette.indigo; e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 32px rgba(83,100,177,0.4)' }}
                onMouseLeave={e => { e.target.style.background = palette.steel; e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 24px rgba(35,96,136,0.3)' }}
              >
                Start Chatting →
              </button>
              <button
                onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                style={{
                  padding: '0.85rem 2rem',
                  borderRadius: '999px',
                  background: 'transparent',
                  border: '1px solid rgba(210,222,160,0.2)',
                  color: palette.sage,
                  fontSize: '0.92rem',
                  fontWeight: 500,
                  letterSpacing: '0.03em',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  fontFamily: 'Inter, system-ui, sans-serif',
                }}
                onMouseEnter={e => { e.target.style.borderColor = palette.olive; e.target.style.color = palette.olive }}
                onMouseLeave={e => { e.target.style.borderColor = 'rgba(210,222,160,0.2)'; e.target.style.color = palette.sage }}
              >
                See Features
              </button>
            </div>
          </div>

          {/* Right: Floating orb visual */}
          <div
            ref={orbRef}
            style={{
              flex: '0 0 auto',
              width: 'clamp(260px, 35vw, 420px)',
              height: 'clamp(260px, 35vw, 420px)',
              borderRadius: '50%',
              background: `
                radial-gradient(circle at 40% 35%, rgba(210,222,160,0.25), transparent 35%),
                radial-gradient(circle at 55% 50%, rgba(35,96,136,0.35), transparent 40%),
                radial-gradient(circle at 45% 45%, rgba(83,100,177,0.2), transparent 50%),
                radial-gradient(circle at 50% 50%, rgba(136,174,77,0.15), transparent 60%)
              `,
              boxShadow: `
                0 0 80px rgba(35,96,136,0.15),
                0 0 160px rgba(83,100,177,0.08),
                inset 0 0 60px rgba(210,222,160,0.04)
              `,
              border: '1px solid rgba(210,222,160,0.08)',
              position: 'relative',
            }}
          >
            {/* Inner rings */}
            <div style={{
              position: 'absolute',
              inset: '15%',
              borderRadius: '50%',
              border: '1px solid rgba(210,222,160,0.06)',
            }} />
            <div style={{
              position: 'absolute',
              inset: '30%',
              borderRadius: '50%',
              border: '1px solid rgba(136,174,77,0.08)',
            }} />
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section
        id="features"
        style={{
          padding: '6rem 2rem',
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        <div className="reveal" style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <span style={{
            fontSize: '0.72rem',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: palette.olive,
            fontWeight: 500,
          }}>
            Capabilities
          </span>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 2.8rem)',
            fontWeight: 700,
            color: palette.sage,
            margin: '0.6rem 0 0.8rem',
            fontFamily: 'Playfair Display, Georgia, serif',
            letterSpacing: '-0.01em',
          }}>
            Everything you need
          </h2>
          <p style={{
            fontSize: '1rem',
            color: 'rgba(210,222,160,0.55)',
            maxWidth: 500,
            margin: '0 auto',
            lineHeight: 1.6,
          }}>
            One assistant. Every task. No switching between tools.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
        }}>
          {features.map((f, i) => (
            <div
              key={f.title}
              className="reveal"
              style={{
                padding: '2rem 1.75rem',
                borderRadius: '20px',
                background: 'rgba(74,61,57,0.35)',
                border: '1px solid rgba(210,222,160,0.06)',
                transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                cursor: 'default',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-6px)'
                e.currentTarget.style.borderColor = 'rgba(136,174,77,0.25)'
                e.currentTarget.style.boxShadow = '0 20px 50px rgba(0,0,0,0.3)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.borderColor = 'rgba(210,222,160,0.06)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div style={{
                fontSize: '1.6rem',
                color: palette.olive,
                marginBottom: '1rem',
                opacity: 0.8,
              }}>
                {f.icon}
              </div>
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: 600,
                color: palette.sage,
                margin: '0 0 0.5rem',
                letterSpacing: '-0.01em',
              }}>
                {f.title}
              </h3>
              <p style={{
                fontSize: '0.88rem',
                lineHeight: 1.65,
                color: 'rgba(210,222,160,0.5)',
                margin: 0,
              }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section
        id="how-it-works"
        style={{
          padding: '6rem 2rem',
          background: 'rgba(31,24,21,0.4)',
        }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="reveal" style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span style={{
              fontSize: '0.72rem',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: palette.steel,
              fontWeight: 500,
            }}>
              How It Works
            </span>
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 2.8rem)',
              fontWeight: 700,
              color: palette.sage,
              margin: '0.6rem 0 0.8rem',
              fontFamily: 'Playfair Display, Georgia, serif',
              letterSpacing: '-0.01em',
            }}>
              Three steps to smarter work
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
            position: 'relative',
          }}>
            {steps.map((s, i) => (
              <div
                key={s.num}
                className="reveal"
                style={{
                  textAlign: 'center',
                  padding: '2.5rem 1.5rem',
                  position: 'relative',
                }}
              >
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: palette.steel,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  margin: '0 auto 1.5rem',
                  fontFamily: 'Inter, system-ui, sans-serif',
                }}>
                  {s.num}
                </div>
                <h3 style={{
                  fontSize: '1.15rem',
                  fontWeight: 600,
                  color: palette.sage,
                  margin: '0 0 0.5rem',
                }}>
                  {s.title}
                </h3>
                <p style={{
                  fontSize: '0.88rem',
                  lineHeight: 1.65,
                  color: 'rgba(210,222,160,0.5)',
                  margin: 0,
                }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TECH STACK ── */}
      <section
        id="tech"
        style={{
          padding: '6rem 2rem',
          maxWidth: 1000,
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <div className="reveal" style={{ marginBottom: '3rem' }}>
          <span style={{
            fontSize: '0.72rem',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: palette.indigo,
            fontWeight: 500,
          }}>
            Built With
          </span>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 2.8rem)',
            fontWeight: 700,
            color: palette.sage,
            margin: '0.6rem 0 0.8rem',
            fontFamily: 'Playfair Display, Georgia, serif',
            letterSpacing: '-0.01em',
          }}>
            Modern stack, real results
          </h2>
        </div>

        <div className="reveal" style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '0.75rem',
        }}>
          {techStack.map(tech => (
            <span
              key={tech}
              style={{
                padding: '0.5rem 1.2rem',
                borderRadius: '999px',
                background: 'rgba(74,61,57,0.4)',
                border: '1px solid rgba(210,222,160,0.08)',
                fontSize: '0.8rem',
                letterSpacing: '0.04em',
                color: 'rgba(210,222,160,0.7)',
                fontWeight: 450,
                transition: 'all 0.25s',
                cursor: 'default',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = palette.olive
                e.currentTarget.style.color = palette.olive
                e.currentTarget.style.background = 'rgba(136,174,77,0.1)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(210,222,160,0.08)'
                e.currentTarget.style.color = 'rgba(210,222,160,0.7)'
                e.currentTarget.style.background = 'rgba(74,61,57,0.4)'
              }}
            >
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* ── CTA FOOTER ── */}
      <section style={{
        padding: '6rem 2rem',
        textAlign: 'center',
        background: `
          linear-gradient(180deg, transparent 0%, rgba(35,96,136,0.06) 40%, rgba(35,96,136,0.1) 100%)
        `,
        borderTop: '1px solid rgba(210,222,160,0.05)',
      }}>
        <div className="reveal">
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 2.8rem)',
            fontWeight: 700,
            color: palette.sage,
            margin: '0 0 1rem',
            fontFamily: 'Playfair Display, Georgia, serif',
            letterSpacing: '-0.01em',
          }}>
            Ready to meet Mavis?
          </h2>
          <p style={{
            fontSize: '1.05rem',
            color: 'rgba(210,222,160,0.55)',
            margin: '0 auto 2rem',
            maxWidth: 480,
            lineHeight: 1.6,
          }}>
            No sign-up. No credit card. Just a conversation with the future of AI assistance.
          </p>
          <button
            onClick={goToChat}
            style={{
              padding: '0.9rem 2.5rem',
              borderRadius: '999px',
              background: palette.olive,
              border: 'none',
              color: palette.espressoDark,
              fontSize: '0.95rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              cursor: 'pointer',
              transition: 'all 0.3s',
              fontFamily: 'Inter, system-ui, sans-serif',
              boxShadow: '0 4px 28px rgba(136,174,77,0.3)',
            }}
            onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 36px rgba(136,174,77,0.45)' }}
            onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 28px rgba(136,174,77,0.3)' }}
          >
            Launch Demo →
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        padding: '2.5rem 2rem',
        textAlign: 'center',
        borderTop: '1px solid rgba(210,222,160,0.05)',
        fontSize: '0.78rem',
        color: 'rgba(210,222,160,0.35)',
        letterSpacing: '0.04em',
      }}>
        © 2026 Mavis — Multimodal Adaptive Virtual Intelligence System
      </footer>

      {/* Mobile nav styles */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </div>
  )
}
