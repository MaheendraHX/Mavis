import React, { useState, useEffect } from 'react'

export default function TokenCounter({ messages }) {
  const [tokens, setTokens] = useState(0)
  const MAX_TOKENS = 32000

  useEffect(() => {
    // Rough estimate: ~4 chars per token
    const totalChars = messages.reduce((sum, m) => sum + (m.content || '').length, 0)
    setTokens(Math.ceil(totalChars / 4))
  }, [messages])

  const percentage = Math.min((tokens / MAX_TOKENS) * 100, 100)
  const isWarning = percentage > 70
  const isCritical = percentage > 90

  const color = isCritical ? '#c85850' : isWarning ? '#e89f71' : '#6b6b6b'

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '0.7rem',
      color,
      fontFamily: 'monospace',
    }} title={`${tokens.toLocaleString()} / ${MAX_TOKENS.toLocaleString()} tokens used`}>
      <div style={{
        width: '40px',
        height: '3px',
        background: 'rgba(0,0,0,0.08)',
        borderRadius: '2px',
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${percentage}%`,
          height: '100%',
          background: color,
          borderRadius: '2px',
          transition: 'width 0.3s, background 0.3s',
        }} />
      </div>
      <span>{tokens > 1000 ? `${(tokens/1000).toFixed(1)}k` : tokens}</span>
    </div>
  )
}
