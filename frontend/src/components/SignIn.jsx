import { useState } from 'react'

const palette = {
  espresso: '#382B27',
  steel: '#236088',
  indigo: '#5364B1',
  olive: '#88AE4D',
  sage: '#D2DEA0',
  espressoLight: '#4a3d39',
  espressoDark: '#1f1815',
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

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: palette.espresso,
      fontFamily: 'Inter, system-ui, sans-serif',
      padding: '2rem',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 400,
        padding: '2.5rem 2rem',
        borderRadius: '24px',
        background: 'rgba(74,61,57,0.35)',
        border: '1px solid rgba(210,222,160,0.08)',
        backdropFilter: 'blur(20px)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'radial-gradient(circle at 40% 35%, rgba(210,222,160,0.2), transparent 40%), radial-gradient(circle at 55% 50%, rgba(35,96,136,0.3), transparent 45%)',
            boxShadow: '0 0 30px rgba(35,96,136,0.12)',
            border: '1px solid rgba(210,222,160,0.08)',
            margin: '0 auto 1rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.3rem',
          }}>◈</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.25em', color: palette.sage, fontFamily: 'Georgia, serif', margin: 0 }}>MAVIS</h1>
          <p style={{ fontSize: '0.8rem', color: 'rgba(210,222,160,0.4)', margin: '0.4rem 0 0' }}>Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'rgba(210,222,160,0.5)', marginBottom: '0.35rem', letterSpacing: '0.04em' }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required
              style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: '12px', background: 'rgba(31,24,21,0.5)', border: '1px solid rgba(210,222,160,0.1)', color: palette.sage, fontSize: '0.88rem', fontFamily: 'Inter, system-ui, sans-serif', outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = 'rgba(136,174,77,0.4)'}
              onBlur={e => e.target.style.borderColor = 'rgba(210,222,160,0.1)'}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'rgba(210,222,160,0.5)', marginBottom: '0.35rem', letterSpacing: '0.04em' }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
              style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: '12px', background: 'rgba(31,24,21,0.5)', border: '1px solid rgba(210,222,160,0.1)', color: palette.sage, fontSize: '0.88rem', fontFamily: 'Inter, system-ui, sans-serif', outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = 'rgba(136,174,77,0.4)'}
              onBlur={e => e.target.style.borderColor = 'rgba(210,222,160,0.1)'}
            />
          </div>
          {error && <p style={{ fontSize: '0.78rem', color: '#f87171', margin: 0, textAlign: 'center' }}>{error}</p>}
          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', background: loading ? 'rgba(35,96,136,0.4)' : palette.steel, border: 'none', color: '#fff', fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.03em', cursor: loading ? 'default' : 'pointer', fontFamily: 'Inter, system-ui, sans-serif', marginTop: '0.5rem' }}
            onMouseEnter={e => { if (!loading) e.target.style.background = palette.indigo }}
            onMouseLeave={e => { if (!loading) e.target.style.background = palette.steel }}
          >{loading ? 'Signing in...' : 'Sign In'}</button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.5rem 0' }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(210,222,160,0.08)' }} />
          <span style={{ fontSize: '0.7rem', color: 'rgba(210,222,160,0.3)', letterSpacing: '0.06em' }}>OR</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(210,222,160,0.08)' }} />
        </div>

        <button onClick={() => onEnter?.('chat')}
          style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', background: 'transparent', border: '1px solid rgba(136,174,77,0.25)', color: palette.olive, fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.03em', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif' }}
          onMouseEnter={e => { e.target.style.background = 'rgba(136,174,77,0.1)'; e.target.style.borderColor = palette.olive }}
          onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.borderColor = 'rgba(136,174,77,0.25)' }}
        >Try Mavis Demo</button>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.78rem', color: 'rgba(210,222,160,0.35)' }}>
          <span onClick={() => onEnter?.('landing')} style={{ cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}>← Back to home</span>
        </p>
      </div>
    </div>
  )
}
