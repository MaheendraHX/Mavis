import React from 'react'

export default function TypingIndicator({ palette }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.6rem',
      padding: '0.6rem 0',
      animation: 'msgIn 0.3s ease-out',
    }}>
      <div style={{
        width: 28,
        height: 28,
        borderRadius: '50%',
        background: `linear-gradient(135deg, ${palette.primary}, ${palette.secondary})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.65rem',
        fontWeight: 700,
        color: '#fff',
        flexShrink: 0,
      }}>
        M
      </div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '0.6rem 1rem',
        background: palette.surface,
        borderRadius: '16px',
        border: `1px solid ${palette.border}`,
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: palette.textMuted,
            animation: `typingBounce 1.4s ease-in-out ${i * 0.2}s infinite`,
          }} />
        ))}
        <span style={{
          fontSize: '0.72rem',
          color: palette.textMuted,
          marginLeft: '0.3rem',
          fontStyle: 'italic',
        }}>
          thinking...
        </span>
      </div>
    </div>
  )
}
