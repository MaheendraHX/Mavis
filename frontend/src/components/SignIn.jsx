import { useState } from 'react'

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

export default function SignIn({ onEnter }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      onEnter?.('chat')
    }, 1200)
  }

  const inputStyle = {
    width: '100%',
    padding: '0.75rem 0.9rem',
    borderRadius: '12px',
    background: palette.surface,
    border: `1px solid ${palette.border}`,
    color: palette.text,
    fontSize: '0.88rem',
    fontFamily: 'Inter, system-ui, sans-serif',
    outline: 'none',
    boxSizing: 'border-box',
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: palette.bg,
      fontFamily: 'Inter, system-ui, sans-serif',
      padding: '2rem',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 400,
        padding: '2.5rem 2rem',
        borderRadius: '20px',
        background: palette.surface,
        border: `1px solid ${palette.border}`,
        boxShadow: `0 18px 60px ${palette.shadow}`,
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: `
              radial-gradient(circle at 38% 34%, rgba(255,255,255,0.9), transparent 36%),
              radial-gradient(circle at 58% 48%, rgba(232,159,113,0.34), transparent 46%),
              radial-gradient(circle at 50% 56%, rgba(168,213,186,0.3), transparent 62%)
            `,
            boxShadow: '0 12px 34px rgba(232,159,113,0.16)',
            border: `1px solid ${palette.border}`,
            margin: '0 auto 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1rem',
            fontWeight: 700,
            color: palette.text,
          }}>M</div>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            letterSpacing: '0.25em',
            color: palette.text,
            fontFamily: 'Georgia, serif',
            margin: 0,
          }}>MAVIS</h1>
          <p style={{ fontSize: '0.8rem', color: palette.textMuted, margin: '0.4rem 0 0' }}>
            Sign in to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: 500,
              color: palette.textMuted,
              marginBottom: '0.35rem',
              letterSpacing: '0.04em',
            }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = palette.primary}
              onBlur={e => e.target.style.borderColor = palette.border}
            />
          </div>
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: 500,
              color: palette.textMuted,
              marginBottom: '0.35rem',
              letterSpacing: '0.04em',
            }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              required
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = palette.primary}
              onBlur={e => e.target.style.borderColor = palette.border}
            />
          </div>
          {error && <p style={{ fontSize: '0.78rem', color: '#c85850', margin: 0, textAlign: 'center' }}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.8rem',
              borderRadius: '12px',
              background: loading ? palette.primary : palette.secondary,
              border: 'none',
              color: '#fff',
              fontSize: '0.9rem',
              fontWeight: 700,
              letterSpacing: '0.03em',
              cursor: loading ? 'default' : 'pointer',
              fontFamily: 'Inter, system-ui, sans-serif',
              marginTop: '0.5rem',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { if (!loading) e.target.style.background = palette.primary }}
            onMouseLeave={e => { if (!loading) e.target.style.background = palette.secondary }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.5rem 0' }}>
          <div style={{ flex: 1, height: 1, background: palette.border }} />
          <span style={{ fontSize: '0.7rem', color: palette.textMuted, letterSpacing: '0.06em' }}>OR</span>
          <div style={{ flex: 1, height: 1, background: palette.border }} />
        </div>

        <button
          onClick={() => onEnter?.('chat')}
          style={{
            width: '100%',
            padding: '0.8rem',
            borderRadius: '12px',
            background: palette.surface,
            border: `1px solid ${palette.primary}`,
            color: palette.text,
            fontSize: '0.9rem',
            fontWeight: 700,
            letterSpacing: '0.03em',
            cursor: 'pointer',
            fontFamily: 'Inter, system-ui, sans-serif',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.target.style.background = palette.hover }}
          onMouseLeave={e => { e.target.style.background = palette.surface }}
        >
          Try Mavis Demo
        </button>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.78rem', color: palette.textMuted }}>
          <span onClick={() => onEnter?.('landing')} style={{ cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}>
            Back to home
          </span>
        </p>
      </div>
    </div>
  )
}
