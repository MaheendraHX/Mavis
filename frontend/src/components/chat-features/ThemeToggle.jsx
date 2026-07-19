import React, { useState } from 'react'
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
        fontSize: '1.1rem',
        padding: '0.3rem',
        borderRadius: '8px',
        transition: 'transform 0.3s',
        transform: isDark ? 'rotate(180deg)' : 'rotate(0deg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  )
}
