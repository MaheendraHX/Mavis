import { useState, useRef, useEffect } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const GUEST_LIMIT = 10

function getGuestId() {
  let id = localStorage.getItem('aria_guest_id')
  if (!id) {
    id = 'guest_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
    localStorage.setItem('aria_guest_id', id)
  }
  return id
}

function useTypewriter(text, active, speed = 12) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!active) {
      setDisplayed(text)
      setDone(true)
      return
    }

    setDisplayed('')
    setDone(false)

    let i = 0
    let timeoutId

    const tick = () => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1))
        i++
        timeoutId = setTimeout(tick, text[i - 1] === '\n' ? 40 : speed)
      } else {
        setDone(true)
      }
    }

    tick()

    return () => clearTimeout(timeoutId)
  }, [text, active, speed])

  return { displayed, done }
}

function ARIAMessage({ content, isLatest, sources }) {
  const { displayed, done } = useTypewriter(content, isLatest)
  const text = isLatest ? displayed : content

  const renderLine = (line, j) => {
    if (line.trim() === '') return <div key={j} style={{ height: '0.5rem' }} />
    if (/^[◆\-—•]\s/.test(line.trim())) {
      return (
        <div key={j} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', margin: '5px 0' }}>
          <span style={{ color: 'rgba(9,12,155,0.4)', flexShrink: 0, fontSize: '8px', marginTop: '5px' }}>◆</span>
          <span>{line.replace(/^[◆\-—•]\s*/, '')}</span>
        </div>
      )
    }
    if (line.includes('**')) {
      const parts = line.split('**')
      return (
        <p key={j} style={{ margin: '4px 0' }}>
          {parts.map((p, k) =>
            k % 2 === 1 ? (
              <strong key={k} style={{ color: '#d5dcf9', fontWeight: '500' }}>{p}</strong>
            ) : p
          )}
        </p>
      )
    }
    return <p key={j} style={{ margin: '4px 0' }}>{line}</p>
  }

  const renderContent = (text) => {
    const parts = text.split(/(```[\s\S]*?```)/g)
    return parts.map((part, i) => {
      if (part.startsWith('```')) {
        const code = part.replace(/```(\w+)?/g, '').trim()
        return (
          <div key={i} style={{
            background: 'rgba(8,7,8,0.8)',
            border: '1px solid rgba(213,220,249,0.06)',
            borderLeft: '2px solid rgba(9,12,155,0.3)',
            padding: '1rem 1.2rem',
            margin: '0.8rem 0',
            borderRadius: '8px',
          }}>
            <pre style={{
              margin: 0, fontSize: '12px', color: 'rgba(213,220,249,0.6)',
              fontFamily: 'monospace', lineHeight: '1.7', whiteSpace: 'pre-wrap',
            }}>{code}</pre>
          </div>
        )
      }
      return <div key={i}>{part.split('\n').map((line, j) => renderLine(line, j))}</div>
    })
  }

return (
    <div>
      {renderContent(text)}
      {sources && sources.length > 0 && (
        <div style={{ marginTop: '1rem', paddingTop: '0.6rem', borderTop: '1px solid rgba(9,12,155,0.12)' }}>
          <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(9,12,155,0.5)', marginBottom: '0.4rem' }}>Sources</div>
          {sources.map((s, i) => (
            <a
              key={i}
              href={s.url}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'block',
                fontSize: '0.75rem',
                color: 'rgba(9,12,155,0.7)',
                textDecoration: 'none',
                padding: '3px 0',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#090c9b'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(9,12,155,0.7)'}
            >
              ↗ {s.title}
            </a>
          ))}
        </div>
      )}
      {isLatest && !done && (
        <span style={{
          display: 'inline-block', width: '2px', height: '14px',
          background: 'rgba(9,12,155,0.6)', marginLeft: '2px',
          verticalAlign: 'middle', animation: 'blink 0.8s step-end infinite',
        }} />
      )}
    </div>
  )
}

const SUGGESTIONS = [
  'Help me write something',
  'Explain this topic simply',
  'Search and summarize this',
  'Plan this step by step',
]

function FilePreview({ file, onRemove }) {
  const isImage = file.type.startsWith('image/')
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '6px 10px',
      background: 'rgba(9,12,155,0.08)',
      border: '1px solid rgba(9,12,155,0.2)',
      borderRadius: '8px',
      marginBottom: '8px',
    }}>
      <span style={{ fontSize: '14px' }}>{isImage ? '🖼' : '📄'}</span>
      <span style={{ fontSize: '0.75rem', color: 'rgba(213,220,249,0.7)', fontFamily: 'Inter, sans-serif', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {file.name}
      </span>
      <button
        onClick={onRemove}
        style={{ background: 'none', border: 'none', color: 'rgba(213,220,249,0.4)', cursor: 'pointer', fontSize: '12px', padding: '0 2px' }}
        onMouseEnter={e => e.currentTarget.style.color = 'rgba(220,80,90,0.7)'}
        onMouseLeave={e => e.currentTarget.style.color = 'rgba(213,220,249,0.4)'}
      >✕</button>
    </div>
  )
}

function Composer({ value, onChange, onSend, loading, inputRef, focused, setFocused, large, home = false, onFileSelect, selectedFile, onRemoveFile }) {
  const fileInputRef = useRef()

  return (
    <div>
      {selectedFile && (
        <FilePreview file={selectedFile} onRemove={onRemoveFile} />
      )}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
          background: focused ? 'rgba(213,220,249,0.04)' : 'rgba(213,220,249,0.025)',
          border: focused ? '1px solid rgba(9,12,155,0.25)' : '1px solid rgba(213,220,249,0.06)',
          borderRadius: large ? '20px' : '14px',
          padding: large ? '16px 18px' : '10px 14px',
          transition: 'all 0.3s ease',
          boxShadow: focused ? '0 0 35px rgba(9,12,155,0.06)' : 'none',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt,.md,.png,.jpg,.jpeg,.webp"
          onChange={e => onFileSelect(e.target.files[0])}
          style={{ display: 'none' }}
        />
        <button
          onClick={() => fileInputRef.current.click()}
          title="Attach a file"
          style={{
            background: 'none',
            border: 'none',
            color: selectedFile ? '#090c9b' : 'rgba(213,220,249,0.25)',
            cursor: 'pointer',
            fontSize: '20px',
            padding: '0',
            flexShrink: 0,
            
            transition: 'color 0.3s ease',
          }}
          onMouseEnter={e => { if (!selectedFile) e.currentTarget.style.color = 'rgba(213,220,249,0.6)' }}
          onMouseLeave={e => { if (!selectedFile) e.currentTarget.style.color = 'rgba(213,220,249,0.25)' }}
        >
          ⌂
        </button>

        <textarea
          ref={inputRef}
          value={value}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={e => {
            onChange(e.target.value)
            e.target.style.height = 'auto'
            e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px'
          }}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              onSend()
            }
          }}
          placeholder={selectedFile ? `Ask something about ${selectedFile.name}...` : 'Ask Mavis anything...'}
          rows={1}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            color: '#d5dcf9',
            fontSize: large ? '1rem' : '0.9rem',
            outline: 'none',
            fontFamily: 'Inter, sans-serif',
            fontWeight: '300',
            letterSpacing: '0.01em',
            resize: 'none',
            lineHeight: '1.5',
            padding: home ? '0' : '2px 0',
            overflowY: 'auto',
            textAlign: 'left',
          }}
        />
        <button
          onClick={onSend}
          disabled={loading || (!value.trim() && !selectedFile)}
          style={{
            width: large ? '38px' : '32px',
            height: large ? '38px' : '32px',
            borderRadius: '10px',
            background: (value.trim() || selectedFile) && !loading ? 'rgba(9,12,155,0.2)' : 'transparent',
            border: `1px solid ${(value.trim() || selectedFile) && !loading ? 'rgba(9,12,155,0.4)' : 'rgba(213,220,249,0.08)'}`,
            color: (value.trim() || selectedFile) && !loading ? '#090c9b' : 'rgba(213,220,249,0.2)',
            cursor: loading || (!value.trim() && !selectedFile) ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '15px',
            flexShrink: 0,
            alignSelf: 'flex-end',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={e => {
            if (!loading && (value.trim() || selectedFile)) {
              e.currentTarget.style.background = 'rgba(9,12,155,0.3)'
              e.currentTarget.style.borderColor = '#090c9b'
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = (value.trim() || selectedFile) && !loading ? 'rgba(9,12,155,0.2)' : 'transparent'
            e.currentTarget.style.borderColor = (value.trim() || selectedFile) && !loading ? 'rgba(9,12,155,0.4)' : 'rgba(213,220,249,0.08)'
          }}
        >
          ↑
        </button>
      </div>
    </div>
  )
}

function HomePrompt({ input, setInput, sendMessage, loading, inputRef, focused, setFocused, selectedFile, onFileSelect, onRemoveFile }) {
  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 2rem',
      position: 'relative',
      zIndex: 1,
    }}>
      <h1 style={{
        fontSize: 'clamp(2.5rem, 6vw, 4rem)',
        fontWeight: '400',
        letterSpacing: '0.2em',
        color: '#d5dcf9',
        fontFamily: 'Playfair Display, serif',
        marginBottom: '0.8rem',
        textShadow: '0 0 60px rgba(9,12,155,0.15)',
}}>
        Mavis
      </h1>
      <p style={{
        fontSize: '1rem',
        color: 'rgba(213,220,249,0.35)',
        fontFamily: 'Inter, sans-serif',
        fontWeight: '300',
        marginBottom: '2.5rem',
      }}>
        How can I help today?
      </p>

      <div style={{ width: '100%', maxWidth: '620px' }}>
        <Composer
          value={input}
          onChange={setInput}
          onSend={sendMessage}
          loading={loading}
          inputRef={inputRef}
          focused={focused}
          setFocused={setFocused}
          large
          home
          onFileSelect={onFileSelect}
          selectedFile={selectedFile}
          onRemoveFile={onRemoveFile}
        />

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', justifyContent: 'center', marginTop: '1.5rem' }}>
          {SUGGESTIONS.map((s, i) => (
            <button
              key={i}
              onClick={() => setInput(s)}
              style={{
                padding: '0.6rem 1.1rem',
                borderRadius: '20px',
                background: 'rgba(213,220,249,0.03)',
                border: '1px solid rgba(213,220,249,0.08)',
                color: 'rgba(213,220,249,0.45)',
                fontSize: '0.8rem',
                fontFamily: 'Inter, sans-serif',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(9,12,155,0.3)'; e.currentTarget.style.color = '#d5dcf9' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(213,220,249,0.08)'; e.currentTarget.style.color = 'rgba(213,220,249,0.45)' }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function ChatShell({ messages, loading, bottomRef, input, setInput, sendMessage, inputRef, focused, setFocused, selectedFile, onFileSelect, onRemoveFile }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', zIndex: 1 }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '2rem 0' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: '12px', alignItems: 'flex-start', animation: 'fadeUp 0.4s ease forwards' }}>
              {msg.role === 'aria' && (
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, rgba(9,12,155,0.35), rgba(9,12,155,0.1))', border: '1px solid rgba(9,12,155,0.2)', flexShrink: 0, marginTop: '2px', boxShadow: '0 0 10px rgba(9,12,155,0.1)' }} />
              )}
              <div style={{
                maxWidth: msg.role === 'user' ? '70%' : '85%',
                fontSize: '0.93rem',
                lineHeight: '1.85',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '300',
                letterSpacing: '0.01em',
                ...(msg.role === 'user' ? {
                  background: 'rgba(9,12,155,0.1)',
                  border: '1px solid rgba(9,12,155,0.15)',
                  color: '#d5dcf9',
                  padding: '0.8rem 1.2rem',
                  borderRadius: '16px 16px 2px 16px',
                } : { color: 'rgba(213,220,249,0.75)' })
              }}>
                {msg.role === 'aria'
                  ? <ARIAMessage content={msg.content} isLatest={i === messages.length - 1} sources={msg.sources} />
                  : msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', animation: 'fadeUp 0.3s ease forwards' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, rgba(9,12,155,0.35), rgba(9,12,155,0.1))', border: '1px solid rgba(9,12,155,0.2)', flexShrink: 0, boxShadow: '0 0 15px rgba(9,12,155,0.15)', animation: 'orbGlow 1s ease infinite' }} />
              <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(9,12,155,0.4)', animation: `dotPulse 1.4s ease ${i * 0.2}s infinite` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <div style={{ padding: '1rem 2rem 1.5rem', flexShrink: 0 }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <Composer
            value={input}
            onChange={setInput}
            onSend={sendMessage}
            loading={loading}
            inputRef={inputRef}
            focused={focused}
            setFocused={setFocused}
            onFileSelect={onFileSelect}
            selectedFile={selectedFile}
            onRemoveFile={onRemoveFile}
          />
          <p style={{ fontSize: '0.55rem', letterSpacing: '0.15em', color: 'rgba(213,220,249,0.1)', textTransform: 'uppercase', marginTop: '0.6rem', textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
            Enter to send · Shift+Enter for new line · 📎 Attach files
          </p>
        </div>
      </div>
    </div>
  )
}

export default function Chat({ userType }) {
  const [conversations, setConversations] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [loadingConvs, setLoadingConvs] = useState(true)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [guestCount, setGuestCount] = useState(0)
  const [limitReached, setLimitReached] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [focused, setFocused] = useState(false)
  const [incognito, setIncognito] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const bottomRef = useRef()
  const inputRef = useRef()
  const orbRef = useRef()

  const activeConv = conversations.find(c => c.id === activeId)
  const messages = activeConv?.messages || []
  const isHome = messages.length === 0

  useEffect(() => {
    const loadConversations = async () => {
      try {
        const res = await fetch(`${API_URL}/conversations`, { headers: { 'X-Guest-Id': getGuestId() } })
        const data = await res.json()

        const loaded = await Promise.all(
          data.conversations.map(async (c) => {
            const msgRes = await fetch(`${API_URL}/conversations/${c.id}/messages`, { headers: { 'X-Guest-Id': getGuestId() } })
            const msgData = await msgRes.json()
            return {
              id: c.id,
              title: c.title,
              messages: msgData.messages.map(m => ({
                role: m.role === 'assistant' ? 'aria' : 'user',
                content: m.content,
              })),
            }
          })
        )

        setConversations(loaded)
        setActiveId(null)
      } catch (err) {
        console.error('Failed to load conversations:', err)
        setConversations([])
        setActiveId(null)
      } finally {
        setLoadingConvs(false)
      }
    }

    loadConversations()
  }, [userType])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    let t = 0, animId
    const pulse = () => {
      t += 0.015
      const scale = 1 + Math.sin(t) * 0.08
      const glow = loading
        ? `0 0 30px rgba(9,12,155,0.5), 0 0 60px rgba(9,12,155,0.2)`
        : `0 0 15px rgba(9,12,155,0.15)`
      if (orbRef.current) {
        orbRef.current.style.transform = `scale(${scale})`
        orbRef.current.style.boxShadow = glow
      }
      animId = requestAnimationFrame(pulse)
    }
    pulse()
    return () => cancelAnimationFrame(animId)
  }, [loading])

  const generateTitle = (message) => {
    const words = message.split(' ').slice(0, 5).join(' ')
    return words.length > 30 ? words.slice(0, 30) + '...' : words
  }

  const extractUrls = (text) => {
    const urlPattern = /https?:\/\/[^\s<>"']+/g
    return text.match(urlPattern) || []
  }

  const newConversation = () => {
    const id = Date.now().toString()
    setConversations(prev => [{ id, title: 'Untitled', messages: [] }, ...prev])
    setActiveId(id)
    setInput('')
    setSelectedFile(null)
  }

  const deleteConversation = async (convId, e) => {
    e.stopPropagation()
    try {
      await fetch(`${API_URL}/conversations/${convId}`, { method: 'DELETE', headers: { 'X-Guest-Id': getGuestId() } })
    } catch {}
    setConversations(prev => {
      const filtered = prev.filter(c => c.id !== convId)
      if (convId === activeId) {
        setActiveId(filtered.length > 0 ? filtered[0].id : null)
      }
      return filtered
    })
  }

  const sendMessage = async () => {
    if (!input.trim() && !selectedFile) return
    if (loading) return
    if (userType === 'guest' && guestCount >= GUEST_LIMIT) {
      setLimitReached(true)
      return
    }

    let convId = activeId
    if (!convId) {
      convId = Date.now().toString()
      setConversations(prev => [{ id: convId, title: 'Untitled', messages: [] }, ...prev])
      setActiveId(convId)
    }

    const userMessage = input.trim() || (selectedFile ? `Analyze this file: ${selectedFile.name}` : '')
    const fileToSend = selectedFile

    setInput('')
    setSelectedFile(null)
    if (inputRef.current) inputRef.current.style.height = 'auto'

    const displayMessage = fileToSend
      ? `📎 ${fileToSend.name}${userMessage !== `Analyze this file: ${fileToSend.name}` ? `\n${userMessage}` : ''}`
      : userMessage

    setConversations(prev =>
      prev.map(c => {
        if (c.id !== convId) return c
        const isFirst = c.messages.length === 0
        return {
          ...c,
          title: isFirst ? generateTitle(userMessage) : c.title,
          messages: [...c.messages, { role: 'user', content: displayMessage }],
        }
      })
    )

    setLoading(true)
    if (userType === 'guest') setGuestCount(n => n + 1)

    try {
      let response, data

      if (fileToSend) {
        // Upload file first
        const formData = new FormData()
        formData.append('file', fileToSend)

        const uploadRes = await fetch(`${API_URL}/upload-file`, { headers: { 'X-Guest-Id': getGuestId() },
          method: 'POST',
          body: formData,
        })

        if (!uploadRes.ok) throw new Error('File upload failed')
        const uploadData = await uploadRes.json()

        if (uploadData.type === 'image') {
          // Send to vision endpoint
          const visionForm = new FormData()
          visionForm.append('message', userMessage || 'What is in this image? Describe it in detail.')
          visionForm.append('user_type', userType)
          visionForm.append('session_id', convId)
          visionForm.append('incognito', incognito)
          visionForm.append('base64_image', uploadData.base64)
          visionForm.append('mime', uploadData.mime)

response = await fetch(`${API_URL}/chat-with-image`, {
            method: 'POST',
            headers: { 'X-Guest-Id': getGuestId() },
            body: visionForm,
          })
        } else {
          // Send file content to regular chat
          const fileMessage = `${userMessage}\n\n[FILE CONTENT FROM ${fileToSend.name}]:\n${uploadData.content}\n\n[Answer based on this file content. Be specific and accurate.]`

response = await fetch(`${API_URL}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Guest-Id': getGuestId() },
            body: JSON.stringify({
              message: fileMessage,
              user_type: userType,
              session_id: convId,
              incognito,
            }),
          })
        }
      } else {
        // Regular message with optional URL reading
        let finalMessage = userMessage
        const urls = extractUrls(userMessage)

        if (urls.length > 0) {
          try {
const urlRes = await fetch(`${API_URL}/fetch-url`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'X-Guest-Id': getGuestId() },
              body: JSON.stringify({ url: urls[0] }),
            })
            if (urlRes.ok) {
              const urlData = await urlRes.json()
              finalMessage = `${userMessage}\n\n[PAGE CONTENT FROM ${urls[0]}]\nTitle: ${urlData.title}\n\n${urlData.content}\n\n[Answer using ONLY the page content above.]`
            } else {
              finalMessage = `${userMessage}\n\n[Note: couldn't fetch content from ${urls[0]}. Let the user know.]`
            }
          } catch {
            finalMessage = `${userMessage}\n\n[Note: couldn't fetch content from ${urls[0]} due to a network error.]`
          }
        }

response = await fetch(`${API_URL}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Guest-Id': getGuestId() },
          body: JSON.stringify({
            message: finalMessage,
            user_type: userType,
            session_id: convId,
            incognito,
          }),
        })
      }

if (!response.ok) {
        let errorDetail = 'Something went wrong. Try again.'
        try {
          const errData = await response.json()
          errorDetail = errData.detail || errorDetail
        } catch {}
        setConversations(prev =>
          prev.map(c =>
            c.id === convId
              ? { ...c, messages: [...c.messages, { role: 'aria', content: errorDetail }] }
              : c
          )
        )
        setLoading(false)
        return
      }

      data = await response.json()

      if (data.limit_reached) {
        setLimitReached(true)
        setLoading(false)
        return
      }

      setConversations(prev =>
        prev.map(c =>
          c.id === convId
            ? {
                ...c,
                title: incognito ? c.title : (data.title || c.title),
                messages: [...c.messages, { role: 'aria', content: data.response, sources: data.sources || [] }],
              }
            : c
        )
      )
    } catch (err) {
      setConversations(prev =>
        prev.map(c =>
          c.id === convId
            ? {
                ...c,
                messages: [...c.messages, { role: 'aria', content: 'Network error — check your connection or try again.' }],
              }
            : c
        )
      )
    }

    setLoading(false)
  }

  if (loadingConvs) {
    return (
      <div style={{ width: '100vw', height: '100vh', background: '#080708', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, rgba(9,12,155,0.4), rgba(9,12,155,0.1))', border: '1px solid rgba(9,12,155,0.25)', animation: 'orbGlow 1.2s ease infinite' }} />
      </div>
    )
  }

  if (limitReached) {
    return (
      <div style={{ width: '100vw', height: '100vh', background: '#080708', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2rem' }}>
        <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: '1px solid rgba(9,12,155,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'rgba(9,12,155,0.3)' }} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.9rem', color: 'rgba(213,220,249,0.5)', fontFamily: 'Playfair Display, serif' }}>Demo limit reached</p>
          <p style={{ fontSize: '0.75rem', color: 'rgba(213,220,249,0.2)', fontFamily: 'Inter, sans-serif', marginTop: '0.5rem' }}>Full access is private</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#080708', display: 'flex', overflow: 'hidden', position: 'relative' }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-150px', left: '15%', width: '600px', height: '500px', background: 'radial-gradient(ellipse, rgba(44,140,153,0.08) 0%, transparent 70%)', filter: 'blur(50px)', animation: 'auroraFloat1 12s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', top: '20%', right: '10%', width: '500px', height: '400px', background: 'radial-gradient(ellipse, rgba(9,12,155,0.07) 0%, transparent 70%)', filter: 'blur(50px)', animation: 'auroraFloat2 15s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '-150px', left: '30%', width: '500px', height: '400px', background: 'radial-gradient(ellipse, rgba(9,12,155,0.06) 0%, transparent 70%)', filter: 'blur(50px)', animation: 'auroraFloat3 18s ease-in-out infinite' }} />
      </div>

      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? '250px' : '56px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'width 0.25s cubic-bezier(0.16,1,0.3,1)',
        background: 'rgba(8,7,8,0.85)',
        backdropFilter: 'blur(20px)',
        position: 'relative',
        zIndex: 10,
      }}>
        <div style={{ padding: '1rem 0.7rem', display: 'flex', alignItems: 'center', justifyContent: sidebarOpen ? 'space-between' : 'center', flexShrink: 0, gap: '8px' }}>
          <button
            onClick={newConversation}
            title="New chat"
            style={{ background: 'rgba(9,12,155,0.08)', border: '1px solid rgba(9,12,155,0.2)', color: 'rgba(9,12,155,0.7)', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.3s ease' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#090c9b'; e.currentTarget.style.color = '#090c9b' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(9,12,155,0.2)'; e.currentTarget.style.color = 'rgba(9,12,155,0.7)' }}
          >+</button>
          {sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(false)}
              style={{ background: 'none', border: 'none', color: 'rgba(213,220,249,0.3)', cursor: 'pointer', fontSize: '20px', padding: '4px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', transition: 'all 0.3s ease' }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(213,220,249,0.7)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(213,220,249,0.3)'}
            >☰</button>
          )}
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              style={{ background: 'none', border: 'none', color: 'rgba(213,220,249,0.3)', cursor: 'pointer', fontSize: '20px', padding: '4px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', position: 'absolute', top: '60px' }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(213,220,249,0.7)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(213,220,249,0.3)'}
            >☰</button>
          )}
        </div>

        {sidebarOpen && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0.7rem', marginTop: '0.5rem' }}>
            {conversations.map(conv => (
              <div
                key={conv.id}
                onClick={() => setActiveId(conv.id)}
                style={{
                  padding: '0.7rem 0.9rem',
                  cursor: 'pointer',
                  borderRadius: '10px',
                  background: conv.id === activeId ? 'rgba(9,12,155,0.1)' : 'transparent',
                  transition: 'all 0.2s ease',
                  marginBottom: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                }}
                onMouseEnter={e => { if (conv.id !== activeId) e.currentTarget.style.background = 'rgba(213,220,249,0.04)' }}
                onMouseLeave={e => { if (conv.id !== activeId) e.currentTarget.style.background = 'transparent' }}
              >
                <p style={{ fontSize: '0.8rem', color: conv.id === activeId ? '#d5dcf9' : 'rgba(213,220,249,0.4)', fontFamily: 'Inter, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                  {conv.title}
                </p>
                <button
                  onClick={e => deleteConversation(conv.id, e)}
                  title="Delete"
                  style={{ background: 'none', border: 'none', color: 'rgba(213,220,249,0.2)', cursor: 'pointer', fontSize: '12px', padding: '2px 4px', flexShrink: 0, transition: 'color 0.2s ease' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'rgba(220,80,90,0.7)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(213,220,249,0.2)'}
                >✕</button>
              </div>
            ))}
          </div>
        )}

        {sidebarOpen && userType === 'guest' && (
          <div style={{ padding: '0.8rem', flexShrink: 0 }}>
            <div style={{ background: 'rgba(9,12,155,0.07)', padding: '0.7rem', borderRadius: '10px' }}>
              <p style={{ fontSize: '0.65rem', color: 'rgba(9,12,155,0.55)', fontFamily: 'Inter, sans-serif', textAlign: 'center' }}>
                {GUEST_LIMIT - guestCount} / {GUEST_LIMIT} messages
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', zIndex: 1 }}>
        <div style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0, position: 'relative', zIndex: 2 }}>
          <div ref={orbRef} style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, rgba(9,12,155,0.4), rgba(9,12,155,0.1))', border: '1px solid rgba(9,12,155,0.25)', flexShrink: 0, transition: 'box-shadow 0.5s ease' }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: '0.8rem', fontWeight: '400', letterSpacing: '0.15em', color: '#d5dcf9', fontFamily: 'Playfair Display, serif' }}>Mavis</h1>
            <p style={{ fontSize: '0.48rem', letterSpacing: '0.2em', color: loading ? 'rgba(9,12,155,0.6)' : 'rgba(213,220,249,0.2)', textTransform: 'uppercase', marginTop: '1px', transition: 'color 0.3s ease', fontFamily: 'Inter, sans-serif' }}>
              {loading ? 'Processing' : 'Online'}
            </p>
          </div>

          <button
            onClick={() => setIncognito(i => !i)}
            title={incognito ? "Incognito on — this chat won't be saved" : "Turn on incognito mode"}
            style={{
              width: '34px', height: '34px', borderRadius: '50%',
              background: incognito ? 'rgba(9,12,155,0.15)' : 'rgba(213,220,249,0.03)',
              border: `1px solid ${incognito ? 'rgba(9,12,155,0.4)' : 'rgba(213,220,249,0.08)'}`,
              color: incognito ? '#090c9b' : 'rgba(213,220,249,0.35)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '15px', flexShrink: 0, transition: 'all 0.3s ease',
            }}
            onMouseEnter={e => { if (!incognito) { e.currentTarget.style.borderColor = 'rgba(9,12,155,0.3)'; e.currentTarget.style.color = 'rgba(9,12,155,0.7)' } }}
            onMouseLeave={e => { if (!incognito) { e.currentTarget.style.borderColor = 'rgba(213,220,249,0.08)'; e.currentTarget.style.color = 'rgba(213,220,249,0.35)' } }}
          >👁</button>

          <button
            onClick={newConversation}
            style={{ padding: '0.5rem 1.1rem', borderRadius: '10px', background: 'rgba(213,220,249,0.03)', border: '1px solid rgba(213,220,249,0.08)', color: 'rgba(213,220,249,0.4)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.3s ease', flexShrink: 0 }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(9,12,155,0.3)'; e.currentTarget.style.color = 'rgba(9,12,155,0.7)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(213,220,249,0.08)'; e.currentTarget.style.color = 'rgba(213,220,249,0.4)' }}
          >New chat</button>
        </div>

        {incognito && (
          <div style={{ padding: '0.5rem 1.5rem', background: 'rgba(9,12,155,0.06)', position: 'relative', zIndex: 2, flexShrink: 0 }}>
            <p style={{ fontSize: '0.6rem', letterSpacing: '0.1em', color: 'rgba(9,12,155,0.6)', fontFamily: 'Inter, sans-serif', textAlign: 'center' }}>
              Incognito mode — this conversation won't be saved
            </p>
          </div>
        )}

        {isHome ? (
          <HomePrompt
            input={input} setInput={setInput} sendMessage={sendMessage}
            loading={loading} inputRef={inputRef} focused={focused} setFocused={setFocused}
            selectedFile={selectedFile} onFileSelect={setSelectedFile} onRemoveFile={() => setSelectedFile(null)}
          />
        ) : (
          <ChatShell
            messages={messages} loading={loading} bottomRef={bottomRef}
            input={input} setInput={setInput} sendMessage={sendMessage}
            inputRef={inputRef} focused={focused} setFocused={setFocused}
            selectedFile={selectedFile} onFileSelect={setSelectedFile} onRemoveFile={() => setSelectedFile(null)}
          />
        )}
      </div>

      <style>{`
        @keyframes fadeUp { from{ opacity:0; transform:translateY(8px); } to{ opacity:1; transform:translateY(0); } }
        @keyframes dotPulse { 0%,100%{ opacity:0.2; transform:scale(1); } 50%{ opacity:1; transform:scale(1.6); } }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes orbGlow { 0%,100%{ box-shadow:0 0 10px rgba(9,12,155,0.1); } 50%{ box-shadow:0 0 25px rgba(9,12,155,0.3); } }
        @keyframes auroraFloat1 { 0%,100%{ transform:translate(0,0) scale(1); } 50%{ transform:translate(40px,30px) scale(1.1); } }
        @keyframes auroraFloat2 { 0%,100%{ transform:translate(0,0) scale(1); } 50%{ transform:translate(-30px,40px) scale(1.05); } }
        @keyframes auroraFloat3 { 0%,100%{ transform:translate(0,0) scale(1); } 50%{ transform:translate(30px,-30px) scale(1.08); } }
        ::-webkit-scrollbar{ width:2px; }
        ::-webkit-scrollbar-track{ background:transparent; }
        ::-webkit-scrollbar-thumb{ background:rgba(9,12,155,0.2); border-radius:2px; }
      `}</style>
    </div>
  )
}