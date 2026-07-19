import React, { useState } from 'react'

export default function FullscreenToggle() {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const toggle = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true))
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false))
    }
  }

  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  return (
    <button
      onClick={toggle}
      title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
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
      {isFullscreen ? '⊡' : '⛶'}
    </button>
  )
}
