import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import Background from './Background'


const stack = [
  { name: 'Python', desc: 'Core backend language' },
  { name: 'FastAPI', desc: 'REST API framework' },
  { name: 'Groq', desc: 'LLM inference engine' },
  { name: 'Llama 3.3', desc: 'Conversation model' },
  { name: 'Whisper', desc: 'Voice transcription' },
  { name: 'React', desc: 'Frontend framework' },
  { name: 'Vite', desc: 'Build tool' },
  { name: 'GSAP', desc: 'Animations' },
  { name: 'psutil', desc: 'PC monitoring' },
  { name: 'pyttsx3', desc: 'Text to speech' },
]


const capabilities = [
  { icon: '⟆', title: 'Web Search', desc: 'ARIA searches the internet in real time and filters exactly what you need.' },
  { icon: '◎', title: 'Voice I/O', desc: 'Talk hands-free. She listens via Whisper and speaks back naturally.' },
  { icon: '⌘', title: 'PC Control', desc: 'Open apps, check battery, monitor your system. Full machine access.' },
  { icon: '⌥', title: 'Code Help', desc: 'Debug, explain, write — ARIA handles code with precision.' },
  { icon: '◈', title: 'Memory', desc: 'She remembers your conversations and gets smarter over time.' },
  { icon: '⟁', title: 'Always Free', desc: 'Built on Groq free tier and local models. Zero cost to run.' },
]


const steps = [
  { num: '01', title: 'Sign In', desc: 'Owner access gives full control. Guest mode lets others try a limited demo.' },
  { num: '02', title: 'Talk or Type', desc: 'Use voice mode for hands-free control or type your message.' },
  { num: '03', title: 'Get Things Done', desc: 'Search the web, control your PC, write code, or just have a conversation.' },
]


function PillButton({ children, onClick, big, variant = 'gold' }) {
  const colors = variant === 'gold'
    ? { bg: 'rgba(212,136,58,0.1)', bgHover: 'rgba(212,136,58,0.2)', border: 'rgba(212,136,58,0.3)', borderHover: '#d4883a', text: '#d4883a', glow: 'rgba(212,136,58,0.15)' }
    : { bg: 'rgba(245,240,224,0.03)', bgHover: 'rgba(245,240,224,0.06)', border: 'rgba(245,240,224,0.1)', borderHover: 'rgba(245,240,224,0.3)', text: 'rgba(245,240,224,0.5)', glow: 'rgba(245,240,224,0.08)' }


  return (
    <button
      onClick={onClick}
      style={{
        padding: big ? '0.9rem 3rem' : '0.6rem 1.5rem',
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: '999px',
        color: colors.text,
        fontSize: big ? '0.8rem' : '0.75rem',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        fontFamily: 'Inter, sans-serif',
        transition: 'all 0.35s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = colors.bgHover
        e.currentTarget.style.borderColor = colors.borderHover
        e.currentTarget.style.boxShadow = `0 0 30px ${colors.glow}`
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = colors.bg
        e.currentTarget.style.borderColor = colors.border
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {children}
    </button>
  )
}


export default function Landing({ onEnter }) {
  const orbRef = useRef()
  const [heroVisible, setHeroVisible] = useState(false)


  useEffect(() => {
    gsap.fromTo(orbRef.current,
      { opacity: 0, scale: 0.4 },
      { opacity: 1, scale: 1, duration: 2.5, ease: 'power3.out', delay: 0.3 }
    )


    setTimeout(() => setHeroVisible(true), 600)


    let t = 0, animId
    const pulse = () => {
      t += 0.012
      const scale = 1 + Math.sin(t) * 0.05
      const glow = `0 0 ${50 + Math.sin(t) * 20}px rgba(212,136,58,0.2), 0 0 ${100 + Math.sin(t) * 30}px rgba(45,120,50,0.1)`
      if (orbRef.current) {
        orbRef.current.style.transform = `scale(${scale})`
        orbRef.current.style.boxShadow = glow
      }
      animId = requestAnimationFrame(pulse)
    }
    pulse()


    const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right')
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('visible'), i * 80)
        }
      })
    }, { threshold: 0.08 })
    reveals.forEach(el => observer.observe(el))


    return () => {
      cancelAnimationFrame(animId)
      observer.disconnect()
    }
  }, [])


  return (
    <div style={{
      width: '100vw',
      minHeight: '100vh',
      background: '#0d1a0f',
      overflowY: 'auto',
      overflowX: 'hidden',
      position: 'relative',
    }}>
      <Background />


      {/* Nav */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: '1.2rem 3rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(13,26,15,0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(245,240,224,0.04)',
      }}>
        <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', color: '#f5f0e0', letterSpacing: '0.1em' }}>ARIA</span>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          {['About', 'Stack', 'Capabilities'].map(item => (
            <button key={item}
              onClick={() => document.getElementById(item.toLowerCase()).scrollIntoView({ behavior: 'smooth' })}
              style={{ background: 'none', border: 'none', color: 'rgba(245,240,224,0.4)', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif', letterSpacing: '0.1em', transition: 'color 0.3s ease' }}
              onMouseEnter={e => e.currentTarget.style.color = '#f5f0e0'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(245,240,224,0.4)'}
            >{item}</button>
          ))}
          <PillButton onClick={onEnter}>Chat with ARIA</PillButton>
        </div>
      </nav>


      {/* Hero */}
      <section style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 1,
        paddingTop: '80px',
      }}>
        <div ref={orbRef} style={{
          position: 'absolute',
          width: '280px',
          height: '280px',
          borderRadius: '50%',
          opacity: 0,
          top: '50%',
          left: '50%',
          marginTop: '-140px',
          marginLeft: '-140px',
        }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid rgba(212,136,58,0.08)', animation: 'ring 4s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', inset: '15%', borderRadius: '50%', border: '1px solid rgba(45,120,50,0.08)', animation: 'ring 4s ease-in-out infinite 0.7s' }} />
          <div style={{ position: 'absolute', inset: '30%', borderRadius: '50%', border: '1px solid rgba(212,136,58,0.1)', animation: 'ring 4s ease-in-out infinite 1.4s' }} />
          <div style={{ position: 'absolute', inset: '43%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,136,58,0.3) 0%, rgba(45,120,50,0.15) 50%, transparent 70%)', animation: 'core 3s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', inset: '-20%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(45,120,50,0.05) 0%, transparent 70%)' }} />
        </div>


        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ overflow: 'hidden' }}>
            <h1 style={{
              fontSize: 'clamp(4.5rem, 14vw, 11rem)',
              fontWeight: '400',
              letterSpacing: '0.3em',
              color: '#f5f0e0',
              fontFamily: 'Playfair Display, serif',
              lineHeight: 1,
              display: 'flex',
              gap: '0.1em',
            }}>
              {'ARIA'.split('').map((letter, i) => (
                <span key={i} style={{
                  display: 'inline-block',
                  opacity: heroVisible ? 1 : 0,
                  transform: heroVisible ? 'translateY(0)' : 'translateY(60px)',
                  transition: `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${0.1 + i * 0.08}s, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${0.1 + i * 0.08}s`,
                  textShadow: '0 0 80px rgba(212,136,58,0.15)',
                }}>{letter}</span>
              ))}
            </h1>
          </div>


          <div style={{
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 1s ease 0.6s, transform 1s ease 0.6s',
          }}>
            <span style={{ fontSize: '0.65rem', letterSpacing: '0.4em', color: 'rgba(212,136,58,0.5)', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>
              Adaptive Reasoning & Intelligence Architecture
            </span>
          </div>


          <div style={{
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 1s ease 0.8s, transform 1s ease 0.8s',
            maxWidth: '500px',
          }}>
            <p style={{ fontSize: '1rem', color: 'rgba(245,240,224,0.4)', fontFamily: 'Inter, sans-serif', fontWeight: '300', lineHeight: '1.8', textAlign: 'center' }}>
              A personal AI assistant that thinks, searches, speaks, and acts — built from scratch, runs for free.
            </p>
          </div>


          <div style={{
            display: 'flex',
            gap: '1rem',
            marginTop: '1rem',
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 1s ease 1s, transform 1s ease 1s',
          }}>
            <PillButton onClick={onEnter} big>Chat with ARIA</PillButton>
            <PillButton onClick={() => document.getElementById('about').scrollIntoView({ behavior: 'smooth' })} big variant="neutral">Discover ↓</PillButton>
          </div>
        </div>


        <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '1px', height: '50px', background: 'linear-gradient(180deg, rgba(212,136,58,0.5), transparent)', animation: 'scrollLine 2s ease-in-out infinite' }} />
        </div>
      </section>


      {/* About */}
      <section id="about" style={{ padding: '10rem 3rem', position: 'relative', zIndex: 1, maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6rem', alignItems: 'center' }}>
          <div>
            <div className="reveal">
              <span style={{ fontSize: '0.6rem', letterSpacing: '0.4em', color: 'rgba(212,136,58,0.5)', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>About</span>
            </div>
            <div className="reveal" style={{ marginTop: '1rem' }}>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '400', color: '#f5f0e0', fontFamily: 'Playfair Display, serif', lineHeight: 1.3 }}>
                Not a wrapper.<br />
                <span style={{ color: '#d4883a', fontStyle: 'italic' }}>A system.</span>
              </h2>
            </div>
            <div className="reveal" style={{ marginTop: '2rem' }}>
              <p style={{ fontSize: '0.95rem', color: 'rgba(245,240,224,0.45)', fontFamily: 'Inter, sans-serif', fontWeight: '300', lineHeight: '1.9' }}>
                ARIA was built entirely from scratch by an 18-year-old developer. No templates, no shortcuts. Every phase — from the terminal brain to the web interface — was designed and coded by hand.
              </p>
            </div>
            <div className="reveal" style={{ marginTop: '1.5rem' }}>
              <p style={{ fontSize: '0.95rem', color: 'rgba(245,240,224,0.45)', fontFamily: 'Inter, sans-serif', fontWeight: '300', lineHeight: '1.9' }}>
                She runs locally on your machine, searches the internet in real time, controls your PC, and speaks back to you — all completely free.
              </p>
            </div>
          </div>


          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(245,240,224,0.04)' }}>
            {[
              { label: 'Built by', value: 'Maheendra Menon' },
              { label: 'Started', value: '2025' },
              { label: 'Stack', value: 'Python · React · Groq' },
              { label: 'Cost to run', value: 'Completely free' },
              { label: 'Status', value: 'Active development' },
            ].map((item, i) => (
              <div key={i} className="reveal" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem 1.5rem', background: 'rgba(13,26,15,0.8)', backdropFilter: 'blur(20px)' }}>
                <span style={{ fontSize: '0.75rem', color: 'rgba(245,240,224,0.3)', fontFamily: 'Inter, sans-serif', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{item.label}</span>
                <span style={{ fontSize: '0.85rem', color: '#f5f0e0', fontFamily: 'Inter, sans-serif' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Tech Stack */}
      <section id="stack" style={{ padding: '6rem 3rem', position: 'relative', zIndex: 1, maxWidth: '1000px', margin: '0 auto' }}>
        <div className="reveal" style={{ marginBottom: '4rem' }}>
          <span style={{ fontSize: '0.6rem', letterSpacing: '0.4em', color: 'rgba(212,136,58,0.5)', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>Tech Stack</span>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '400', color: '#f5f0e0', fontFamily: 'Playfair Display, serif', marginTop: '1rem', lineHeight: 1.3 }}>
            What ARIA is<br />
            <span style={{ color: '#d4883a', fontStyle: 'italic' }}>built with</span>
          </h2>
        </div>


        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1px', background: 'rgba(245,240,224,0.04)' }}>
          {stack.map((item, i) => (
            <div key={i} className="reveal" style={{
              padding: '1.8rem',
              background: 'rgba(13,26,15,0.9)',
              backdropFilter: 'blur(20px)',
              transition: 'background 0.3s ease',
              cursor: 'default',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,136,58,0.04)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(13,26,15,0.9)'}
            >
              <div style={{ fontSize: '0.9rem', fontWeight: '500', color: '#f5f0e0', fontFamily: 'Inter, sans-serif', marginBottom: '0.4rem' }}>{item.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(245,240,224,0.3)', fontFamily: 'Inter, sans-serif', fontWeight: '300' }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </section>


      {/* Capabilities */}
      <section id="capabilities" style={{ padding: '6rem 3rem', position: 'relative', zIndex: 1, maxWidth: '1000px', margin: '0 auto' }}>
        <div className="reveal" style={{ marginBottom: '4rem' }}>
          <span style={{ fontSize: '0.6rem', letterSpacing: '0.4em', color: 'rgba(212,136,58,0.5)', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>Capabilities</span>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '400', color: '#f5f0e0', fontFamily: 'Playfair Display, serif', marginTop: '1rem', lineHeight: 1.3 }}>
            Everything<br />
            <span style={{ color: '#d4883a', fontStyle: 'italic' }}>she can do</span>
          </h2>
        </div>


        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1px', background: 'rgba(245,240,224,0.04)' }}>
          {capabilities.map((cap, i) => (
            <div key={i} className="reveal" style={{
              padding: '2.5rem',
              background: 'rgba(13,26,15,0.9)',
              backdropFilter: 'blur(20px)',
              transition: 'all 0.4s ease',
              cursor: 'default',
              position: 'relative',
              overflow: 'hidden',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(212,136,58,0.04)'
                e.currentTarget.querySelector('.cap-icon').style.color = '#d4883a'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(13,26,15,0.9)'
                e.currentTarget.querySelector('.cap-icon').style.color = 'rgba(212,136,58,0.25)'
              }}
            >
              <div className="cap-icon" style={{ fontSize: '1.5rem', color: 'rgba(212,136,58,0.25)', marginBottom: '1.2rem', transition: 'color 0.4s ease' }}>{cap.icon}</div>
              <h3 style={{ fontSize: '0.85rem', fontWeight: '500', letterSpacing: '0.15em', color: '#f5f0e0', fontFamily: 'Inter, sans-serif', marginBottom: '0.8rem', textTransform: 'uppercase' }}>{cap.title}</h3>
              <p style={{ fontSize: '0.85rem', color: 'rgba(245,240,224,0.35)', fontFamily: 'Inter, sans-serif', fontWeight: '300', lineHeight: '1.8' }}>{cap.desc}</p>
            </div>
          ))}
        </div>
      </section>


      {/* How it works */}
      <section style={{ padding: '6rem 3rem', position: 'relative', zIndex: 1, maxWidth: '1000px', margin: '0 auto' }}>
        <div className="reveal" style={{ marginBottom: '4rem' }}>
          <span style={{ fontSize: '0.6rem', letterSpacing: '0.4em', color: 'rgba(212,136,58,0.5)', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>How it works</span>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '400', color: '#f5f0e0', fontFamily: 'Playfair Display, serif', marginTop: '1rem', lineHeight: 1.3 }}>
            Simple to<br />
            <span style={{ color: '#d4883a', fontStyle: 'italic' }}>get started</span>
          </h2>
        </div>


        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(245,240,224,0.04)' }}>
          {steps.map((step, i) => (
            <div key={i} className="reveal" style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '3rem',
              padding: '3rem',
              background: 'rgba(13,26,15,0.9)',
              backdropFilter: 'blur(20px)',
              transition: 'background 0.3s ease',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,136,58,0.03)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(13,26,15,0.9)'}
            >
              <div style={{ fontSize: '2.5rem', fontWeight: '300', color: 'rgba(212,136,58,0.2)', fontFamily: 'Playfair Display, serif', flexShrink: 0, lineHeight: 1 }}>{step.num}</div>
              <div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: '500', letterSpacing: '0.15em', color: '#f5f0e0', fontFamily: 'Inter, sans-serif', marginBottom: '0.8rem', textTransform: 'uppercase' }}>{step.title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'rgba(245,240,224,0.35)', fontFamily: 'Inter, sans-serif', fontWeight: '300', lineHeight: '1.8' }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* CTA */}
      <section className="reveal" style={{ padding: '8rem 3rem 10rem', position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '400', color: '#f5f0e0', fontFamily: 'Playfair Display, serif', lineHeight: 1.2, marginBottom: '1.5rem' }}>
            Ready to meet<br />
            <span style={{ color: '#d4883a', fontStyle: 'italic' }}>ARIA?</span>
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'rgba(245,240,224,0.35)', fontFamily: 'Inter, sans-serif', fontWeight: '300', lineHeight: '1.8', marginBottom: '3rem' }}>
            Sign in as owner for full access or try the demo as a guest. No account needed.
          </p>
          <PillButton onClick={onEnter} big>Begin</PillButton>
        </div>
      </section>


      {/* Footer */}
      <footer style={{
        padding: '2rem 3rem',
        position: 'relative',
        zIndex: 1,
        borderTop: '1px solid rgba(245,240,224,0.04)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '1rem', color: 'rgba(245,240,224,0.2)' }}>ARIA</span>
        <span style={{ fontSize: '0.75rem', color: 'rgba(245,240,224,0.2)', fontFamily: 'Inter, sans-serif' }}>Built by Maheendra Menon</span>
        <a href="https://maheendrahx.github.io/Myprofile/" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: 'rgba(212,136,58,0.3)', fontFamily: 'Inter, sans-serif', textDecoration: 'none', transition: 'color 0.3s ease' }}
          onMouseEnter={e => e.currentTarget.style.color = '#d4883a'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(212,136,58,0.3)'}
        >Portfolio →</a>
      </footer>


      <style>{`
        @keyframes ring { 0%,100%{ transform:scale(1); opacity:0.5; } 50%{ transform:scale(1.04); opacity:1; } }
        @keyframes core { 0%,100%{ transform:scale(1); } 50%{ transform:scale(1.12); } }
        @keyframes scrollLine { 0%,100%{ opacity:0.3; transform:scaleY(1); } 50%{ opacity:1; transform:scaleY(1.1); } }
      `}</style>
    </div>
  )
}