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
  shadow: 'rgba(0,0,0,0.06)',
}

const AVATAR_URL = 'https://storage.googleapis.com/gd-wagtail-prod-assets/original_images/Gemini_Generated_Image_u9bn96u9bn96u9bn.png'

export default function SignIn({ onOwnerAccess, onDemoAccess }) {
  const [showPasskey, setShowPasskey] = useState(false)
  const [passkey, setPasskey] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleOwnerClick = () => {
    setShowPasskey(true)
    setError('')
  }

  const handlePasskeySubmit = async (e) => {
    e.preventDefault()
    if (!passkey.trim()) {
      setError('Please enter the passkey')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/owner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passkey: passkey.trim() }),
      })
      const data = await res.json()

      if (data.authenticated) {
        localStorage.setItem('mavis_owner_session', data.session_id)
        onOwnerAccess(data.session_id)
      } else {
        setError(data.message || 'Invalid passkey')
      }
    } catch (err) {
      setError('Cannot reach server. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      width: '100vw', minHeight: '100vh',
      background: palette.bg,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Inter, system-ui, sans-serif',
      padding: '2rem',
    }}>
      {/* Logo */}
      <div style={{
        width: '80px', height: '80px',
        borderRadius: '24px',
        background: `linear-gradient(135deg, ${palette.accent}, ${palette.secondary})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '2rem',
        boxShadow: `0 12px 40px rgba(212,165,116,0.25)`,
      }}>
        <span style={{ fontSize: '2.2rem', fontWeight: 700, color: '#fff', fontFamily: 'Playfair Display, Georgia, serif' }}>M</span>
      </div>

      {/* Title */}
      <h1 style={{
        fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
        fontFamily: 'Playfair Display, Georgia, serif',
        color: palette.text,
        margin: '0 0 0.5rem 0',
        fontWeight: 700,
      }}>Mavis</h1>

      <p style={{
        fontSize: '0.95rem',
        color: palette.textMuted,
        margin: '0 0 3rem 0',
        textAlign: 'center',
        maxWidth: '320px',
        lineHeight: 1.5,
      }}>Multimodal Advanced Virtual Intelligence System</p>

      {!showPasskey ? (
        /* Mode Selection */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '320px' }}>
          <button
            onClick={handleOwnerClick}
            style={{
              padding: '1rem 1.5rem',
              borderRadius: '14px',
              border: `2px solid ${palette.secondary}`,
              background: palette.secondary,
              color: '#fff',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'Inter, system-ui, sans-serif',
              transition: 'all 0.2s ease',
              boxShadow: `0 8px 24px rgba(212,165,116,0.2)`,
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)'
              e.target.style.boxShadow = '0 12px 32px rgba(212,165,116,0.3)'
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)'
              e.target.style.boxShadow = `0 8px 24px rgba(212,165,116,0.2)`
            }}
          >
            Owner Access
          </button>

          <button
            onClick={onDemoAccess}
            style={{
              padding: '1rem 1.5rem',
              borderRadius: '14px',
              border: `2px solid ${palette.border}`,
              background: palette.surface,
              color: palette.text,
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'Inter, system-ui, sans-serif',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)'
              e.target.style.boxShadow = `0 8px 24px ${palette.shadow}`
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)'
              e.target.style.boxShadow = 'none'
            }}
          >
            Try Demo
          </button>

          <p style={{
            fontSize: '0.75rem',
            color: palette.textMuted,
            textAlign: 'center',
            marginTop: '0.5rem',
            lineHeight: 1.5,
          }}>
            Demo has a 10-message limit. Owner has unlimited access.
          </p>
        </div>
      ) : (
        /* Passkey Form */
        <form onSubmit={handlePasskeySubmit} style={{
          display: 'flex', flexDirection: 'column',
          gap: '1rem', width: '100%', maxWidth: '320px',
        }}>
          <button
            type="button"
            onClick={() => { setShowPasskey(false); setError(''); setPasskey(''); }}
            style={{
              alignSelf: 'flex-start',
              background: 'none', border: 'none',
              color: palette.textMuted, fontSize: '0.85rem',
              cursor: 'pointer', padding: '0.25rem 0',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            ← Back
          </button>

          <input
            type="password"
            placeholder="Enter owner passkey"
            value={passkey}
            onChange={(e) => setPasskey(e.target.value)}
            autoFocus
            style={{
              padding: '0.85rem 1rem',
              borderRadius: '12px',
              border: `1.5px solid ${error ? '#e74c3c' : palette.border}`,
              background: palette.surface,
              color: palette.text,
              fontSize: '0.95rem',
              fontFamily: 'Inter, system-ui, sans-serif',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
          />

          {error && (
            <p style={{ color: '#e74c3c', fontSize: '0.8rem', margin: 0 }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '0.85rem 1.5rem',
              borderRadius: '12px',
              border: 'none',
              background: loading ? palette.textMuted : palette.secondary,
              color: '#fff',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'Inter, system-ui, sans-serif',
              transition: 'all 0.2s ease',
            }}
          >
            {loading ? 'Verifying...' : 'Enter'}
          </button>
        </form>
      )}
    </div>
  )
}
