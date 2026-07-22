import React from 'react'
import { useTheme } from './ThemeContext'

export default function ThemeToggle() {
  const { isDark, toggle } = useTheme()
  return (
    <button
      onClick={toggle}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '0.75rem',
        fontWeight: 500,
        padding: '0.25rem 0.5rem',
        borderRadius: '6px',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        color: 'var(--text)',
        fontFamily: 'Inter, system-ui, sans-serif',
        letterSpacing: '0.02em',
      }}
    >
      {isDark ? 'Light' : 'Dark'}
    </button>
  )
}
