import { useState, useRef, useEffect, useCallback } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || 'https://aria-backend-b6qb.onrender.com'

const palette = {
  espresso: '#382B27',
  steel: '#236088',
  indigo: '#5364B1',
  olive: '#88AE4D',
  sage: '#D2DEA0',
  espressoLight: '#4a3d39',
  espressoDark: '#1f1815',
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

function ARIAMessage({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: isUser ? 'flex-end' : 'flex-start',
      marginBottom: '1.25rem',
      animation: 'msgIn 0.35s ease-out',
    }}>
      <div style={{
        maxWidth: '72%',
        padding: '0.85rem 1.2rem',
        borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        background: isUser ? palette.steel : 'rgba(74,61,57,0.5)',
        border: isUser ? 'none' : '1px solid rgba(210,222,160,0.06)',
        color: isUser ? '#fff' : palette.sage,
        fontSize: '0.92rem',
        lineHeight: 1.65,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}>
        {msg.content}
      </div>
      <span style={{
        fontSize: '0.65rem',
        color: 'rgba(210,222,160,0.3)',
        marginTop: '0.3rem',
        padding: '0 0.3rem',
      }}>
        {formatTime(msg.timestamp)}
      </span>
    </div>
  )
}

export default function Chat({ onNavigate, userType }) {
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
  const [webSearchOn, setWebSearchOn] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const abortRef = useRef(null)
  const guestId = useRef(getOrCreateGuestId()).current

  // Save conversations to localStorage
  useEffect(() => {
    localStorage.setItem('mavis_conversations', JSON.stringify(conversations))
  }, [conversations])

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const startNewChat = useCallback(() => {
    setActiveConvId(null)
    setMessages([])
    setInput('')
    inputRef.current?.focus()
  }, [])

  const selectConversation = useCallback((convId) => {
    const conv = conversations.find(c => c.id === convId)
    if (conv) {
      setActiveConvId(convId)
      setMessages(conv.messages || [])
    }
  }, [conversations])

  const deleteConversation = useCallback((convId, e) => {
    e.stopPropagation()
    const updated = conversations.filter(c => c.id !== convId)
    setConversations(updated)
    if (activeConvId === convId) {
      startNewChat()
    }
  }, [conversations, activeConvId, startNewChat])

  const sendMessage = useCallback(async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMsg = { role: 'user', content: text, timestamp: new Date().toISOString() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    // Create or update conversation
    let convId = activeConvId
    if (!convId) {
      convId = 'conv_' + Date.now()
      setActiveConvId(convId)
      const newConv = { id: convId, title: text.slice(0, 40) + (text.length > 40 ? '...' : ''), messages: newMessages, createdAt: new Date().toISOString() }
      setConversations(prev => [newConv, ...prev])
    } else {
      setConversations(prev => prev.map(c => c.id === convId ? { ...c, messages: newMessages } : c))
    }

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Guest-ID': guestId },
        body: JSON.stringify({
          message: text,
          user_type: 'guest',
          session_id: convId,
          incognito: false,
        }),
        signal: controller.signal,
      })

      if (!res.ok) throw new Error(`Server error: ${res.status}`)

      const data = await res.json()
      const assistantContent = data.response || 'No response'
      const newConvId = data.conv_id || convId

      const finalMessages = [...newMessages, { role: 'assistant', content: assistantContent, timestamp: new Date().toISOString() }]
      setMessages(finalMessages)
      setConversations(prev => prev.map(c => c.id === newConvId ? { ...c, messages: finalMessages, title: data.title || c.title } : c))
      if (newConvId !== convId) setActiveConvId(newConvId)

    } catch (err) {
      if (err.name === 'AbortError') return
      const errorMsg = { role: 'assistant', content: `⚠️ ${err.message || 'Something went wrong. Please try again.'}`, timestamp: new Date().toISOString() }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setLoading(false)
      abortRef.current = null
    }
  }, [input, loading, messages, activeConvId, guestId, webSearchOn])

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
      background: palette.espresso,
      color: palette.sage,
      fontFamily: 'Inter, system-ui, sans-serif',
      overflow: 'hidden',
    }}>
      {/* ── SIDEBAR ── */}
      <div style={{
        width: sidebarOpen ? 280 : 0,
        minWidth: sidebarOpen ? 280 : 0,
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        background: 'rgba(31,24,21,0.85)',
        borderRight: sidebarOpen ? '1px solid rgba(210,222,160,0.06)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Sidebar header */}
        <div style={{
          padding: '1.25rem 1rem',
          borderBottom: '1px solid rgba(210,222,160,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{
            fontSize: '1rem',
            fontWeight: 700,
            letterSpacing: '0.2em',
            color: palette.sage,
            fontFamily: 'Georgia, serif',
          }}>
            MAVIS
          </span>
          <button
            onClick={() => setSidebarOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(210,222,160,0.4)',
              cursor: 'pointer',
              fontSize: '1.1rem',
              padding: '0.25rem',
            }}
          >
            ✕
          </button>
        </div>

        {/* New chat button */}
        <button
          onClick={startNewChat}
          style={{
            margin: '0.75rem',
            padding: '0.65rem 1rem',
            borderRadius: '12px',
            background: 'rgba(74,61,57,0.4)',
            border: '1px solid rgba(210,222,160,0.08)',
            color: palette.sage,
            fontSize: '0.82rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontFamily: 'Inter, system-ui, sans-serif',
            textAlign: 'left',
            letterSpacing: '0.02em',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(136,174,77,0.1)'; e.currentTarget.style.borderColor = 'rgba(136,174,77,0.25)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(74,61,57,0.4)'; e.currentTarget.style.borderColor = 'rgba(210,222,160,0.08)' }}
        >
          + New Conversation
        </button>

        {/* Conversation list */}
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
                background: activeConvId === conv.id ? 'rgba(35,96,136,0.15)' : 'transparent',
                border: activeConvId === conv.id ? '1px solid rgba(35,96,136,0.2)' : '1px solid transparent',
              }}
              onMouseEnter={e => {
                if (activeConvId !== conv.id) {
                  e.currentTarget.style.background = 'rgba(210,222,160,0.03)'
                }
              }}
              onMouseLeave={e => {
                if (activeConvId !== conv.id) {
                  e.currentTarget.style.background = 'transparent'
                }
              }}
            >
              <div style={{
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontSize: '0.8rem',
                color: activeConvId === conv.id ? palette.sage : 'rgba(210,222,160,0.55)',
                fontWeight: activeConvId === conv.id ? 500 : 400,
              }}>
                {conv.title || 'New Conversation'}
              </div>
              <button
                onClick={(e) => deleteConversation(conv.id, e)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(210,222,160,0.25)',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  padding: '0.2rem 0.3rem',
                  opacity: 0,
                  transition: 'opacity 0.2s',
                }}
                className="delete-btn"
              >
                🗑
              </button>
            </div>
          ))}
          {conversations.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '2rem 1rem',
              color: 'rgba(210,222,160,0.3)',
              fontSize: '0.78rem',
            }}>
              No conversations yet
            </div>
          )}
        </div>

        {/* Sidebar footer */}
        <div style={{
          padding: '0.75rem 1rem',
          borderTop: '1px solid rgba(210,222,160,0.06)',
          fontSize: '0.7rem',
          color: 'rgba(210,222,160,0.25)',
          textAlign: 'center',
        }}>
          Mavis Demo
        </div>
      </div>

      {/* ── MAIN CHAT AREA ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        position: 'relative',
      }}>
        {/* Top bar */}
        <div style={{
          padding: '0.85rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(210,222,160,0.05)',
          background: 'rgba(56,43,39,0.5)',
          backdropFilter: 'blur(12px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(210,222,160,0.5)',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  padding: '0.25rem',
                }}
              >
                ☰
              </button>
            )}
            <span style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              color: palette.sage,
              letterSpacing: '0.03em',
            }}>
              {activeConv?.title || 'Mavis'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Web search toggle */}
            <button
              onClick={() => setWebSearchOn(!webSearchOn)}
              title="Toggle web search"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.4rem 0.75rem',
                borderRadius: '999px',
                background: webSearchOn ? 'rgba(35,96,136,0.2)' : 'rgba(74,61,57,0.4)',
                border: webSearchOn ? '1px solid rgba(35,96,136,0.35)' : '1px solid rgba(210,222,160,0.08)',
                color: webSearchOn ? palette.sage : 'rgba(210,222,160,0.5)',
                fontSize: '0.72rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontFamily: 'Inter, system-ui, sans-serif',
                letterSpacing: '0.03em',
              }}
            >
              <span style={{ fontSize: '0.85rem' }}>{webSearchOn ? '🌐' : '🌐'}</span>
              Web
            </button>

            <button
              onClick={() => onNavigate?.('home')}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(210,222,160,0.4)',
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontWeight: 500,
                letterSpacing: '0.03em',
                fontFamily: 'Inter, system-ui, sans-serif',
              }}
            >
              ← Home
            </button>
          </div>
        </div>

        {/* Messages area */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.5rem 1.25rem',
        }}>
          {messages.length === 0 ? (
            /* Empty state */
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: '1rem',
            }}>
              {/* Mavis orb icon */}
              <div style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: `
                  radial-gradient(circle at 40% 35%, rgba(210,222,160,0.2), transparent 40%),
                  radial-gradient(circle at 55% 50%, rgba(35,96,136,0.3), transparent 45%),
                  radial-gradient(circle at 50% 50%, rgba(136,174,77,0.12), transparent 60%)
                `,
                boxShadow: '0 0 40px rgba(35,96,136,0.12)',
                border: '1px solid rgba(210,222,160,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.6rem',
                marginBottom: '0.5rem',
                animation: 'pulse 3s ease-in-out infinite',
              }}>
                ◈
              </div>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 600,
                color: palette.sage,
                margin: 0,
                fontFamily: 'Playfair Display, Georgia, serif',
                letterSpacing: '-0.01em',
              }}>
                Hey! I'm Mavis
              </h2>
              <p style={{
                fontSize: '0.9rem',
                color: 'rgba(210,222,160,0.45)',
                margin: 0,
                textAlign: 'center',
                maxWidth: 360,
                lineHeight: 1.5,
              }}>
                Ask me anything — research, code, creative writing, or just a conversation.
              </p>
            </div>
          ) : (
            messages.map((msg, i) => <ARIAMessage key={i} msg={msg} />)
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div style={{
          padding: '1rem 1.25rem 1.25rem',
          borderTop: '1px solid rgba(210,222,160,0.05)',
          background: 'rgba(56,43,39,0.5)',
          backdropFilter: 'blur(12px)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '0.6rem',
            background: 'rgba(74,61,57,0.5)',
            borderRadius: '16px',
            border: '1px solid rgba(210,222,160,0.08)',
            padding: '0.5rem 0.5rem 0.5rem 1rem',
            transition: 'border-color 0.2s',
          }}
            onFocusCapture={e => {
              e.currentTarget.style.borderColor = 'rgba(136,174,77,0.3)'
            }}
            onBlurCapture={e => {
              e.currentTarget.style.borderColor = 'rgba(210,222,160,0.08)'
            }}
          >
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
                color: palette.sage,
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
              <button
                onClick={stopGeneration}
                style={{
                  padding: '0.5rem 0.9rem',
                  borderRadius: '12px',
                  background: 'rgba(210,222,160,0.1)',
                  border: '1px solid rgba(210,222,160,0.15)',
                  color: palette.sage,
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s',
                }}
              >
                ■ Stop
              </button>
            ) : (
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                style={{
                  padding: '0.5rem 0.9rem',
                  borderRadius: '12px',
                  background: input.trim() ? palette.steel : 'rgba(74,61,57,0.4)',
                  border: 'none',
                  color: input.trim() ? '#fff' : 'rgba(210,222,160,0.25)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: input.trim() ? 'pointer' : 'default',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s',
                }}
              >
                ↑
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Animations */}
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
