import React, { useState } from 'react'

const EMOJIS = ['👍', '👎', '🔥', '❤️', '😂', '🤔', '✅', '💡']

export default function EmojiReactions({ msg, onReact }) {
  const [showPicker, setShowPicker] = useState(false)

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {msg.reactions && Object.keys(msg.reactions).length > 0 && (
        <div style={{
          display: 'flex',
          gap: '4px',
          marginTop: '4px',
          flexWrap: 'wrap',
        }}>
          {Object.entries(msg.reactions).map(([emoji, count]) => (
            <button key={emoji} onClick={() => onReact(msg.id, emoji)} style={{
              background: 'rgba(212,165,116,0.12)',
              border: '1px solid rgba(212,165,116,0.2)',
              borderRadius: '12px',
              padding: '2px 8px',
              cursor: 'pointer',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              transition: 'all 0.2s',
            }}>
              {emoji} <span style={{ fontSize: '0.7rem', color: '#6b6b6b' }}>{count}</span>
            </button>
          ))}
          <button onClick={() => setShowPicker(!showPicker)} style={{
            background: 'none',
            border: '1px dashed rgba(0,0,0,0.12)',
            borderRadius: '12px',
            padding: '2px 8px',
            cursor: 'pointer',
            fontSize: '0.8rem',
            opacity: 0.5,
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = 1}
          onMouseLeave={e => e.currentTarget.style.opacity = 0.5}
          >
            +
          </button>
        </div>
      )}

      {!msg.reactions || Object.keys(msg.reactions).length === 0 ? (
        <button
          onClick={() => setShowPicker(!showPicker)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.85rem',
            opacity: 0,
            transition: 'opacity 0.2s',
            padding: '2px 4px',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = 0.6}
          onMouseLeave={e => e.currentTarget.style.opacity = 0}
        >
          😊
        </button>
      ) : null}

      {showPicker && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: 0,
          background: '#fff',
          border: '1px solid rgba(0,0,0,0.1)',
          borderRadius: '12px',
          padding: '6px',
          display: 'flex',
          gap: '2px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          zIndex: 50,
        }}>
          {EMOJIS.map(e => (
            <button key={e} onClick={() => { onReact(msg.id, e); setShowPicker(false) }} style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.1rem',
              padding: '4px',
              borderRadius: '6px',
              transition: 'background 0.15s',
            }}
            onMouseEnter={ev => ev.currentTarget.style.background = 'rgba(0,0,0,0.06)'}
            onMouseLeave={ev => ev.currentTarget.style.background = 'none'}
            >
              {e}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
