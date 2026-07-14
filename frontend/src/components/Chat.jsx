import { useState, useRef, useEffect, useCallback } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || 'https://aria-backend-b6qb.onrender.com'

const palette = {
  bg: '#faf9f7',
  bgSoft: '#f4eee7',
  surface: '#ffffff',
  surfaceWarm: '#fffaf4',
  text: '#2d2d2d',
  textMuted: '#6b6b6b',
  primary: '#d4a574',
  secondary: '#e89f71',
  accent: '#a8d5ba',
  border: 'rgba(0,0,0,0.08)',
  borderStrong: 'rgba(212,165,116,0.28)',
  shadow: 'rgba(62,42,28,0.08)',
  danger: '#c85850',
}

function getOrCreateGuestId() {
  let id = localStorage.getItem('mavis_guest_id')
  if (!id) {
    id = 'guest_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
    localStorage.setItem('mavis_guest_id', id)
  }
  return id
}

function formatTime(iso) {
  const d = new Date(iso)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function ARIAMessage({ msg, onEdit, onDelete }) {
  const isUser = msg.role === 'user'
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(msg.content || '')

  const handleSave = () => {
    if (editText.trim() && editText.trim() !== msg.content) {
      onEdit(msg.id, editText.trim())
    }
    setEditing(false)
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: isUser ? 'flex-end' : 'flex-start',
      marginBottom: '1.25rem',
      animation: 'msgIn 0.35s ease-out',
      position: 'relative',
    }}>
      <div className="msg-bubble-wrap" style={{ position: 'relative', maxWidth: '72%' }}>
        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSave() }
                if (e.key === 'Escape') setEditing(false)
              }}
              style={{
                width: '100%',
                minHeight: '60px',
                padding: '0.75rem',
                borderRadius: '12px',
                border: `2px solid ${palette.secondary}`,
                background: palette.surface,
                color: palette.text,
                fontSize: '0.92rem',
                lineHeight: 1.65,
                fontFamily: 'Inter, system-ui, sans-serif',
                resize: 'vertical',
                outline: 'none',
              }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setEditing(false)} style={{
                padding: '0.3rem 0.75rem', borderRadius: '8px', border: `1px solid ${palette.border}`,
                background: 'transparent', color: palette.textMuted, fontSize: '0.78rem',
                cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif',
              }}>Cancel</button>
              <button onClick={handleSave} style={{
                padding: '0.3rem 0.75rem', borderRadius: '8px', border: 'none',
                background: palette.secondary, color: '#fff', fontSize: '0.78rem',
                cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif',
              }}>Save & Resend</button>
            </div>
          </div>
        ) : (
          <div style={{
            padding: '0.85rem 1.2rem',
            borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
            background: isUser ? palette.secondary : palette.surface,
            border: isUser ? 'none' : `1px solid ${palette.border}`,
            color: isUser ? '#fff' : palette.text,
            boxShadow: `0 10px 28px ${palette.shadow}`,
            fontSize: '0.92rem',
            lineHeight: 1.65,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}>
            {msg.content}
          </div>
        )}

        {/* Edit/Delete buttons for user messages - always visible below */}
        {isUser && !editing && (
          <div style={{
            display: 'flex',
            gap: '0.35rem',
            marginTop: '0.4rem',
            justifyContent: 'flex-end',
          }}>
            <button onClick={() => { setEditText(msg.content); setEditing(true) }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '0.75rem', padding: '0.2rem 0.5rem',
                color: palette.textMuted, borderRadius: '4px',
                fontFamily: 'Inter, system-ui, sans-serif',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = palette.text}
              onMouseLeave={e => e.currentTarget.style.color = palette.textMuted}
              title="Edit message"
            >✎ Edit</button>
            <button onClick={() => {
              if (window.confirm('Delete this message?')) {
                onDelete(msg.id)
              }
            }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '0.75rem', padding: '0.2rem 0.5rem',
                color: '#c0706b', borderRadius: '4px',
                fontFamily: 'Inter, system-ui, sans-serif',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '1'}
              onMouseLeave={e => e.currentTarget.style.opacity = '0.7'}
              title="Delete message"
            >🗑 Delete</button>
          </div>
        )}
      </div>
      {msg.sources && msg.sources.length > 0 && (
        <div style={{
          maxWidth: '72%',
          marginTop: '0.35rem',
          padding: '0.45rem 0.75rem',
          borderRadius: '10px',
          background: 'rgba(44,140,153,0.08)',
          border: `1px solid ${palette.border}`,
          fontSize: '0.72rem',
          color: palette.textMuted,
          lineHeight: 1.5,
        }}>
          <span style={{ fontWeight: 600, color: palette.accent }}>Sources:</span>{' '}
          {msg.sources.map((s, i) => (
            <span key={i}>
              {i > 0 && ' · '}
              <a href={s.url} target="_blank" rel="noopener noreferrer"
                 style={{ color: palette.accent, textDecoration: 'none' }}>
                {s.title || s.url}
              </a>
            </span>
          ))}
        </div>
      )}
      <span style={{
        fontSize: '0.65rem',
        color: palette.textMuted,
        marginTop: '0.3rem',
        padding: '0 0.3rem',
      }}>
        {formatTime(msg.timestamp)}
      </span>
    </div>
  )
}

// File attachment card component
function FileAttachmentCard({ file, onRemove }) {
  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf': return '📄'
      case 'image': return '🖼️'
      case 'docx': return '📝'
      case 'text': return '📃'
      default: return '📎'
    }
  }

  const formatSize = (mb) => {
    if (!mb || mb === 0 || typeof mb !== 'number') return 'Unknown size'
    if (mb < 1) return `${(mb * 1024).toFixed(0)} KB`
    return `${mb.toFixed(1)} MB`
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.75rem 1rem',
      borderRadius: '12px',
      background: `linear-gradient(135deg, ${palette.surfaceWarm} 0%, ${palette.accent} 100%)`,
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      border: `1px solid ${palette.border}`,
      marginBottom: '0.5rem',
    }}>
      <div style={{
        fontSize: '2rem',
        background: 'rgba(255,255,255,0.9)',
        borderRadius: '10px',
        padding: '0.5rem',
        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
      }}>
        {getFileIcon(file.type || file.file_type || 'text')}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '0.85rem',
          fontWeight: 600,
          color: palette.text,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {file.filename}
        </div>
        <div style={{
          fontSize: '0.7rem',
          color: palette.textMuted,
          marginTop: '0.15rem',
        }}>
          {(file.type || file.file_type || 'FILE').toUpperCase()} • {formatSize(file.size_mb)}
        </div>
      </div>
      <button
        onClick={onRemove}
        style={{
          background: 'rgba(255,255,255,0.9)',
          border: 'none',
          borderRadius: '8px',
          width: '28px',
          height: '28px',
          cursor: 'pointer',
          fontSize: '0.9rem',
          color: '#c0706b',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#c0706b'; e.currentTarget.style.color = 'white' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.9)'; e.currentTarget.style.color = '#c0706b' }}
        title="Remove file"
      >
        ✕
      </button>
    </div>
  )
}

export default function Chat({ onNavigate }) {
  const [conversations, setConversations] = useState(() => {
    try {
      const saved = localStorage.getItem('mavis_conversations')
      return saved ? JSON.parse(saved) : []
    } catch { return [] }
  })
  const [activeConvId, setActiveConvId] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [pendingImage, setPendingImage] = useState(null)
  const [pendingFile, setPendingFile] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const fileInputRef = useRef(null)
  const abortRef = useRef(null)
  const guestId = useRef(getOrCreateGuestId()).current

  useEffect(() => {
    localStorage.setItem('mavis_conversations', JSON.stringify(conversations))
  }, [conversations])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const startNewChat = useCallback(() => {
    setActiveConvId(null)
    setMessages([])
    setInput('')
    setUploadError('')
    inputRef.current?.focus()
  }, [])

  const selectConversation = useCallback((convId) => {
    const conv = conversations.find(c => c.id === convId)
    if (conv) {
      setActiveConvId(convId)
      setMessages(conv.messages || [])
      setUploadError('')
    }
  }, [conversations])

  const deleteConversation = useCallback((convId, e) => {
    e.stopPropagation()
    setConversations(prev => prev.filter(c => c.id !== convId))
    if (activeConvId === convId) startNewChat()
    // Also delete from backend
    fetch(`${API_BASE}/conversations/${convId}`, {
      method: 'DELETE',
      headers: { 'X-Guest-Id': getOrCreateGuestId() },
    }).catch(() => {})
  }, [activeConvId, startNewChat])

  const editMessage = useCallback((msgId, newText) => {
    // Find the message and re-send from that point
    const msgIndex = messages.findIndex(m => m.id === msgId)
    if (msgIndex < 0) return

    // Replace the edited message content
    setMessages(prev => prev.map((m, i) => i === msgIndex ? { ...m, content: newText } : m).slice(0, msgIndex + 1))

    // Re-send: build messages up to and including the edited one
    const truncated = messages.slice(0, msgIndex).map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }))
    truncated.push({ role: 'user', content: newText })

    const convId = activeConvId || `conv_${Date.now()}_${Math.random().toString(36).slice(2)}`

    fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Guest-Id': getOrCreateGuestId(),
      },
      body: JSON.stringify({
        message: newText,
        user_type: 'guest',
        session_id: convId,
        incognito: false,
        history: truncated,
      }),
    })
      .then(r => r.json())
      .then(data => {
        const assistantMsg = {
          id: `msg_${Date.now()}_assistant`,
          role: 'assistant',
          content: data.response,
          timestamp: new Date().toISOString(),
          sources: data.sources || [],
        }
        setMessages(prev => [...prev, assistantMsg])
        if (data.title) {
          setConversations(prev => prev.map(c => c.id === convId ? { ...c, title: data.title } : c))
        }
      })
      .catch(() => {})
  }, [messages, activeConvId])

  const handleFileUpload = useCallback(async (file) => {
    if (!file || uploading) return

    setUploading(true)
    setUploadError('')

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch(`${API_BASE}/upload-file`, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        throw new Error(errorData?.detail || `Upload failed: ${res.status}`)
      }

      const data = await res.json()

      if (data.type === 'image') {
        setPendingImage({ base64: data.base64, mime: data.mime, filename: data.filename })
      } else if (data.type === 'text') {
        const ext = (data.filename || '').split('.').pop().toLowerCase()
        setPendingFile({
          filename: data.filename,
          type: ext || 'txt',
          size_mb: data.content ? +(data.content.length / (1024 * 1024)).toFixed(2) : 0.01,
          content: data.content,
          mime: data.mime || 'text/plain'
        })
      } else {
        setUploadError(data.content || 'Could not read file.')
      }

      inputRef.current?.focus()
    } catch (err) {
      setUploadError(err.message || 'Upload failed. Try again.')
    } finally {
      setUploading(false)
    }
  }, [uploading])

  const sendMessage = useCallback(async () => {
    const text = input.trim()
    if (!text && !pendingFile && !pendingImage) return

    const userMsg = { role: 'user', content: text, timestamp: new Date().toISOString() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setUploadError('')
    setPendingFile(null)
    setPendingImage(null)
    setLoading(true)

    let convId = activeConvId
    if (!convId) {
      convId = 'conv_' + Date.now()
      setActiveConvId(convId)
      const newConv = {
        id: convId,
        title: text.slice(0, 40) + (text.length > 40 ? '...' : ''),
        messages: newMessages,
        createdAt: new Date().toISOString(),
      }  
      setConversations(prev => [newConv, ...prev])
    } else {
      setConversations(prev => prev.map(c => c.id === convId ? { ...c, messages: newMessages } : c))
    }

    const controller = new AbortController()
    abortRef.current = controller
    const currentImage = pendingImage
    setPendingImage(null)

    try {
      let res

      if (currentImage) {
        const formData = new FormData()
        formData.append('message', text)
        formData.append('user_type', 'guest')
        formData.append('session_id', convId)
        formData.append('incognito', 'false')
        formData.append('base64_image', currentImage.base64)
        formData.append('mime', currentImage.mime)

        res = await fetch(`${API_BASE}/chat-with-image`, {
          method: 'POST',
          headers: { 'X-Guest-ID': guestId },
          body: formData,
          signal: controller.signal,
        })
      } else if (pendingFile) {
        const formData = new FormData()
        formData.append('message', text)
        formData.append('user_type', 'guest')
        formData.append('session_id', convId)
        formData.append('incognito', 'false')
        formData.append('file_type', pendingFile.type)
        formData.append('size_mb', pendingFile.size_mb)
        formData.append('filename', pendingFile.filename)
        formData.append('file_content', pendingFile.content || '')

        res = await fetch(`${API_BASE}/chat-with-file`, {
          method: 'POST',
          headers: { 'X-Guest-ID': guestId },
          body: formData,
          signal: controller.signal,
        })
      } else {
        res = await fetch(`${API_BASE}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Guest-ID': guestId },
          body: JSON.stringify({
            message: text,
            user_type: 'guest',
            session_id: convId,
            incognito: false,
            web_search: true,
          }),
          signal: controller.signal,
        })
      }

      if (!res.ok) throw new Error(`Server error: ${res.status}`)

      const data = await res.json()
      const assistantContent = data.response || 'No response'
      const newConvId = data.conv_id || convId
      const finalMessages = [
        ...newMessages,
        { role: 'assistant', content: assistantContent, timestamp: new Date().toISOString(), sources: data.sources || [] },
      ]

      setMessages(finalMessages)
      setConversations(prev => prev.map(c => c.id === convId ? {
        ...c,
        id: newConvId,
        messages: finalMessages,
        title: data.title || c.title,
      } : c))
      if (newConvId !== convId) setActiveConvId(newConvId)
    } catch (err) {
      if (err.name !== 'AbortError') {
        const errorMsg = {
          role: 'assistant',
          content: `Warning: ${err.message || 'Something went wrong. Please try again.'}`,
          timestamp: new Date().toISOString(),
        }
        setMessages(prev => [...prev, errorMsg])
      }
    } finally {
      setLoading(false)
      abortRef.current = null
    }
  }, [input, loading, messages, activeConvId, guestId, pendingImage, pendingFile])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }, [sendMessage])

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort()
    setLoading(false)
  }, [])

  const activeConv = conversations.find(c => c.id === activeConvId)

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: palette.bg,
      color: palette.text,
      fontFamily: 'Inter, system-ui, sans-serif',
      overflow: 'hidden',
    }}>
      <div className={sidebarOpen ? 'sidebar sidebar-open' : 'sidebar'} style={{
        width: sidebarOpen ? 280 : 0,
        minWidth: sidebarOpen ? 280 : 0,
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        background: palette.surface,
        borderRight: sidebarOpen ? `1px solid ${palette.border}` : 'none',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '1.25rem 1rem',
          borderBottom: `1px solid ${palette.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{
            fontSize: '1rem',
            fontWeight: 700,
            letterSpacing: '0.2em',
            color: palette.text,
            fontFamily: 'Georgia, serif',
          }}>
            MAVIS
          </span>
          <button onClick={() => setSidebarOpen(false)} style={{
            background: 'none',
            border: 'none',
            color: palette.textMuted,
            cursor: 'pointer',
            fontSize: '1.3rem',
            padding: '0.4rem',
            minWidth: '44px',
            minHeight: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            ✕
          </button>
        </div>

        <button
          onClick={startNewChat}
          style={{
            margin: '0.75rem',
            padding: '0.65rem 1rem',
            borderRadius: '12px',
            background: palette.surfaceWarm,
            border: `1px solid ${palette.borderStrong}`,
            color: palette.text,
            fontSize: '0.82rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontFamily: 'Inter, system-ui, sans-serif',
            textAlign: 'left',
            letterSpacing: '0.02em',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#fff4e8'; e.currentTarget.style.borderColor = palette.primary }}
          onMouseLeave={e => { e.currentTarget.style.background = palette.surfaceWarm; e.currentTarget.style.borderColor = palette.borderStrong }}
        >
          + New Conversation
        </button>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 0.5rem' }}>
          {conversations.map(conv => (
            <div
              key={conv.id}
              onClick={() => selectConversation(conv.id)}
              style={{
                padding: '0.7rem 0.75rem',
                margin: '0.15rem 0.25rem',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.2s',
                background: activeConvId === conv.id ? '#fff0df' : 'transparent',
                border: activeConvId === conv.id ? `1px solid ${palette.borderStrong}` : '1px solid transparent',
              }}
              onMouseEnter={e => { if (activeConvId !== conv.id) e.currentTarget.style.background = palette.bgSoft }}
              onMouseLeave={e => { if (activeConvId !== conv.id) e.currentTarget.style.background = 'transparent' }}
            >
              <div style={{
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontSize: '0.8rem',
                color: activeConvId === conv.id ? palette.text : palette.textMuted,
                fontWeight: activeConvId === conv.id ? 500 : 400,
              }}>
                {conv.title || 'New Conversation'}
              </div>
              <button
                onClick={(e) => deleteConversation(conv.id, e)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#c0706b',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  padding: '0.25rem 0.35rem',
                  borderRadius: '6px',
                  transition: 'all 0.2s',
                  opacity: 0.5,
                  flexShrink: 0,
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'rgba(192,112,107,0.1)' }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '0.5'; e.currentTarget.style.background = 'none' }}
              >
                🗑
              </button>
            </div>
          ))}
          {conversations.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: palette.textMuted, fontSize: '0.78rem' }}>
              No conversations yet
            </div>
          )}
        </div>

        <div style={{
          padding: '0.75rem 1rem',
          borderTop: `1px solid ${palette.border}`,
          fontSize: '0.7rem',
          color: palette.textMuted,
          textAlign: 'center',
        }}>
          Mavis Demo
        </div>
      </div>

      {/* Mobile backdrop */}
      {sidebarOpen && window.innerWidth <= 768 && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.3)',
            zIndex: 99,
          }}
        />
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative' }}>
        <div style={{
          padding: '0.85rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${palette.border}`,
          background: 'rgba(255,255,255,0.78)',
          backdropFilter: 'blur(12px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} className="sidebar-toggle" style={{
                background: 'none',
                border: 'none',
                color: palette.textMuted,
                cursor: 'pointer',
                fontSize: '1.2rem',
                padding: '0.25rem',
              }}>
                <span className="menu-icon">☰</span>
              </button>
            )}
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: palette.text, letterSpacing: '0.03em' }}>
              {activeConv?.title || 'Mavis'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button onClick={() => onNavigate?.('home')} style={{
              background: 'none',
              border: 'none',
              color: palette.textMuted,
              cursor: 'pointer',
              fontSize: '0.78rem',
              fontWeight: 500,
              letterSpacing: '0.03em',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}>
              Home
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 1.25rem' }}>
          {messages.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: '1rem',
            }}>
              <div style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: `
                  radial-gradient(circle at 40% 35%, rgba(255,255,255,0.85), transparent 38%),
                  radial-gradient(circle at 55% 50%, rgba(232,159,113,0.32), transparent 45%),
                  radial-gradient(circle at 50% 50%, rgba(212,165,116,0.28), transparent 62%)
                `,
                boxShadow: `0 12px 36px ${palette.shadow}`,
                border: `1px solid ${palette.borderStrong}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                fontWeight: 700,
                color: palette.text,
                marginBottom: '0.5rem',
                animation: 'pulse 3s ease-in-out infinite',
              }}>
                M
              </div>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 600,
                color: palette.text,
                margin: 0,
                fontFamily: 'Playfair Display, Georgia, serif',
                letterSpacing: '-0.01em',
              }}>
                Hey! I'm Mavis
              </h2>
              <p style={{
                fontSize: '0.9rem',
                color: palette.textMuted,
                margin: 0,
                textAlign: 'center',
                maxWidth: 360,
                lineHeight: 1.5,
              }}>
                Ask me anything - research, code, creative writing, or just a conversation.
              </p>
            </div>
          ) : (
            messages.map((msg, i) => <ARIAMessage key={i} msg={msg} onEdit={editMessage} onDelete={(id) => setMessages(prev => prev.filter(m => m.id !== id))} />)
          )}
          <div ref={messagesEndRef} />
        </div>

        <div style={{
          padding: '1rem 1.25rem 1.25rem',
          borderTop: `1px solid ${palette.border}`,
          background: 'rgba(255,255,255,0.78)',
          backdropFilter: 'blur(12px)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '0.5rem',
            background: palette.surface,
            borderRadius: '16px',
            border: `1px solid ${palette.border}`,
            padding: '0.5rem 0.5rem 0.5rem 1rem',
            transition: 'border-color 0.2s',
            boxShadow: `0 12px 36px ${palette.shadow}`,
          }}
            onFocusCapture={e => { e.currentTarget.style.borderColor = palette.primary }}
            onBlurCapture={e => { e.currentTarget.style.borderColor = palette.border }}
          >
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Attach file"
              disabled={uploading}
              style={{
                background: 'none',
                border: 'none',
                color: uploading ? palette.primary : palette.textMuted,
                cursor: uploading ? 'default' : 'pointer',
                fontSize: '1.3rem',
                fontWeight: 600,
                padding: '0.4rem 0.5rem',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => { if (!uploading) e.currentTarget.style.color = palette.primary }}
              onMouseLeave={e => { if (!uploading) e.currentTarget.style.color = palette.textMuted }}
            >
              {uploading ? '...' : '📎'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  setPendingFile(null) // Clear previous file
                  handleFileUpload(file)
                }
                e.target.value = ''
              }}
            />
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Mavis anything..."
              rows={1}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: palette.text,
                fontSize: '0.9rem',
                fontFamily: 'Inter, system-ui, sans-serif',
                resize: 'none',
                lineHeight: 1.5,
                padding: '0.3rem 0',
                maxHeight: '150px',
              }}
              onInput={e => {
                e.target.style.height = 'auto'
                e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px'
              }}
            />
            {loading ? (
              <button onClick={stopGeneration} style={{
                padding: '0.5rem 0.9rem',
                borderRadius: '12px',
                background: palette.bgSoft,
                border: `1px solid ${palette.borderStrong}`,
                color: palette.text,
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'Inter, system-ui, sans-serif',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
              }}>
                Stop
              </button>
            ) : (
              <button onClick={sendMessage} disabled={!input.trim()} style={{
                padding: '0.5rem 0.9rem',
                borderRadius: '12px',
                background: input.trim() ? palette.secondary : palette.bgSoft,
                border: 'none',
                color: input.trim() ? '#fff' : palette.textMuted,
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: input.trim() ? 'pointer' : 'default',
                fontFamily: 'Inter, system-ui, sans-serif',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}>
                <span className="send-btn-text">Send</span>
                <span className="send-btn-icon" style={{ display: 'none', fontSize: '1rem' }}>↑</span>
              </button>
            )}
          </div>
          {pendingFile && (
            <FileAttachmentCard
              file={pendingFile}
              onRemove={() => setPendingFile(null)}
            />
          )}
          {uploadError && (
            <div style={{ color: palette.danger, fontSize: '0.75rem', marginTop: '0.5rem' }}>
              {uploadError}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes msgIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.04); }
        }
        .delete-btn { opacity: 0; }
        div:hover > .delete-btn { opacity: 1; }
      `}</style>
    </div>
  )
}
