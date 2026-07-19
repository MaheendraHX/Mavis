import React from 'react'

const API_BASE = import.meta.env.VITE_API_URL || 'https://aria-backend-b6qb.onrender.com'

export default function ExportChat({ messages, conversationId, palette }) {
  const [showMenu, setShowMenu] = React.useState(false)
  const [exporting, setExporting] = React.useState(false)

  const formatDate = () => new Date().toISOString().slice(0, 10)

  const exportJSON = () => {
    const data = {
      conversation_id: conversationId,
      exported_at: new Date().toISOString(),
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
        reactions: m.reactions || {},
      })),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    downloadBlob(blob, `mavis-chat-${formatDate()}.json`)
    setShowMenu(false)
  }

  const exportTXT = () => {
    const text = messages.map(m => {
      const who = m.role === 'user' ? 'You' : 'Mavis'
      const time = formatTime(m.timestamp)
      return `[${time}] ${who}:\n${m.content}\n`
    }).join('\n---\n\n')
    const blob = new Blob([text], { type: 'text/plain' })
    downloadBlob(blob, `mavis-chat-${formatDate()}.txt`)
    setShowMenu(false)
  }

  const exportMarkdown = () => {
    const text = `# Mavis Chat — ${formatDate()}\n\n` + messages.map(m => {
      const who = m.role === 'user' ? '### You' : '### Mavis'
      return `${who}\n\n${m.content}\n`
    }).join('\n---\n\n')
    const blob = new Blob([text], { type: 'text/markdown' })
    downloadBlob(blob, `mavis-chat-${formatDate()}.md`)
    setShowMenu(false)
  }

  const exportWord = async () => {
    setExporting(true)
    try {
      const res = await fetch(`${API_BASE}/create-file`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: messages.map(m => {
            const who = m.role === 'user' ? 'You' : 'Mavis'
            return `${who}:\n${m.content}`
          }).join('\n\n---\n\n'),
          format: 'docx',
          filename: `mavis-chat-${formatDate()}.docx`,
        }),
      })
      const data = await res.json()
      if (data.base64) {
        const byteChars = atob(data.base64)
        const byteArr = new Uint8Array(byteChars.length)
        for (let i = 0; i < byteChars.length; i++) byteArr[i] = byteChars.charCodeAt(i)
        const blob = new Blob([byteArr], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
        downloadBlob(blob, data.filename || `mavis-chat-${formatDate()}.docx`)
      }
    } catch (err) {
      console.error('Export failed:', err)
      exportMarkdown()
    }
    setExporting(false)
    setShowMenu(false)
  }

  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const p = palette || {}
  const menuItems = [
    { icon: '📄', label: 'Word Document', action: exportWord },
    { icon: '📝', label: 'Plain Text', action: exportTXT },
    { icon: '📑', label: 'Markdown', action: exportMarkdown },
    { icon: '{ }', label: 'JSON', action: exportJSON },
  ]

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        title="Export conversation"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '1rem',
          padding: '0.3rem',
          borderRadius: '8px',
          transition: 'transform 0.2s',
          display: 'flex',
          alignItems: 'center',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        ⬇️
      </button>
      {showMenu && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '4px',
          background: p.popover || '#fff',
          border: `1px solid ${p.popoverBorder || 'rgba(0,0,0,0.1)'}`,
          borderRadius: '12px',
          padding: '6px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          zIndex: 100,
          minWidth: '180px',
        }}>
          <div style={{ fontSize: '0.7rem', color: p.textMuted || '#6b6b6b', padding: '4px 8px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Export as
          </div>
          {menuItems.map(item => (
            <button key={item.label} onClick={item.action} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              background: 'none',
              border: 'none',
              padding: '8px 10px',
              cursor: 'pointer',
              borderRadius: '8px',
              fontSize: '0.85rem',
              color: p.text || '#2d2d2d',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = p.hoverItem || 'rgba(0,0,0,0.04)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
