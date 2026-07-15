import { useState } from 'react'

const OWNER_PASSKEY = '24130636'
const DEMO_MESSAGE_LIMIT = 10

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
  const [mode, setMode] = useState('demo')
  const [passkey, setPasskey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPasskeyInput, setShowPasskeyInput] = useState(false)

  const handleOwnerLogin = () => {
    setShowPasskeyInput(true)
    setError('')
  }

  const submitOwnerLogin = (e) => {
    e.preventDefault()
    if (passkey === OWNER_PASSKEY) {
      const sessionId = 'owner_' + Date.now()
      localStorage.setItem('mavis_owner_session', JSON.stringify({ sessionId, passkey: OWNER_PASSKEY }))
      onEnter?.('chat')
    } else {
      setError(' Incorrect passkey')
    }
  }

  const handleDemoAccess = () => {
    const demoId = 'demo_' + Date.now()
    const storedCount = localStorage.getItem('mavis_demo_message_count') || 0
    if (parseInt(storedCount) >= DEMO_MESSAGE_LIMIT) {
      setError(`🚫 Demo limit reached! You've sent ${DEMO_MESSAGE_LIMIT} messages. Upgrade to Owner for unlimited access.`)
      return
    }
    localStorage.setItem('mavis_demo_id', demoId)
    localStorage.setItem('mavis_demo_message_count', String(parseInt(storedCount) + 1))
    onEnter?.('chat')
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
        maxWidth: 420,
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
            Choose your access mode
          </p>
        </div>

        {error && (
          <div style={{
            background: '#ffe8e8',
            border: '1px solid #ffcccc',
            borderRadius: '12px',
            padding: '0.75rem 1rem',
            color: '#c0706b',
            fontSize: '0.82rem',
            marginBottom: '1.25rem',
            textAlign: 'center',
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <button
            onClick={() => setMode('demo')}
            style={{
              flex: 1,
              padding: '0.7rem',
              borderRadius: '10px',
              border: mode === 'demo' ? `2px solid ${palette.primary}` : `1px solid ${palette.border}`,
              background: mode === 'demo' ? palette.hover : 'transparent',
              color: mode === 'demo' ? palette.primary : palette.textMuted,
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Demo Access
          </button>
          <button
            onClick={() => setMode('owner')}
            style={{
              flex: 1,
              padding: '0.7rem',
              borderRadius: '10px',
              border: mode === 'owner' ? `2px solid ${palette.accent}` : `1px solid ${palette.border}`,
              background: mode === 'owner' ? 'rgba(168,213,186,0.1)' : 'transparent',
              color: mode === 'owner' ? palette.accent : palette.textMuted,
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Owner Access
          </button>
        </div>

        {mode === 'demo' ? (
          <button
            onClick={handleDemoAccess}
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.85rem',
              borderRadius: '12px',
              border: 'none',
              background: palette.primary,
              color: '#fff',
              fontSize: '0.9rem',
              fontWeight: 700,
              letterSpacing: '0.03em',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { if (!loading) e.target.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { if (!loading) e.target.style.transform = 'translateY(0)' }}
          >
            {loading ? 'Accessing...' : 'Continue as Demo'}
          </button>
        ) : (
          <form onSubmit={submitOwnerLogin}>
            {showPasskeyInput ? (
              <>
                <input
                  type="password"
                  value={passkey}
                  onChange={(e) => setPasskey(e.target.value)}
                  placeholder="Enter owner passkey"
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    borderRadius: '12px',
                    border: `2px solid ${palette.border}`,
                    background: palette.surface,
                    color: palette.text,
                    fontSize: '0.9rem',
                    marginBottom: '0.75rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={loading || !passkey}
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    borderRadius: '12px',
                    border: 'none',
                    background: palette.accent,
                    color: '#fff',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    letterSpacing: '0.03em',
                    cursor: loading || !passkey ? 'not-allowed' : 'pointer',
                    opacity: loading || !passkey ? 0.7 : 1,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { if (!loading && passkey) e.target.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { if (!loading && passkey) e.target.style.transform = 'translateY(0)' }}
                >
                  {loading ? 'Verifying...' : 'Unlock Owner Access'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowPasskeyInput(false); setPasskey(''); setError(''); }}
                  style={{
                    width: '100%',
                    marginTop: '0.75rem',
                    padding: '0.7rem',
                    borderRadius: '10px',
                    border: `1px solid ${palette.border}`,
                    background: 'transparent',
                    color: palette.textMuted,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={handleOwnerLogin}
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  borderRadius: '12px',
                  border: 'none',
                  background: palette.accent,
                  color: '#fff',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  letterSpacing: '0.03em',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
              >
                Enter Passkey
              </button>
            )}
          </form>
        )}

        <div style={{
          marginTop: '1.5rem',
          paddingTop: '1.25rem',
          borderTop: `1px solid ${palette.border}`,
          textAlign: 'center',
        }}>
          <p style={{
            color: palette.textMuted,
            fontSize: '0.75rem',
            lineHeight: 1.6,
          }}>
            {mode === 'demo' ? (
              <>
                <strong>10 messages</strong> limit • Perfect for trying out Mavis
                <br />
                <span style={{ fontSize: '0.7rem' }}>Upgrade to Owner for unlimited access</span>
              </>
            ) : (
              <>
                Secure passkey authentication • Full system access
                <br />
                <span style={{ fontSize: '0.7rem' }}>Unlimited messages • Priority features</span>
              </>
            )}
          </p>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.75rem', color: palette.textMuted }}>
          <span onClick={() => onEnter?.('landing')} style={{ cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}>
            Back to home
          </span>
        </p>
      </div>
    </div>
  )
}
