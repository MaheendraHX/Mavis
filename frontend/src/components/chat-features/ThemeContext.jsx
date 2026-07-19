import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const lightPalette = {
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
  sidebarBg: '#ffffff',
  headerBg: 'rgba(255,255,255,0.78)',
  codeBg: '#1e1e1e',
}

export const darkPalette = {
  bg: '#0f0f0f',
  bgSoft: '#1a1a1a',
  surface: '#1e1e1e',
  surfaceWarm: '#252525',
  text: '#e4e4e7',
  textMuted: '#a1a1aa',
  primary: '#d4a574',
  secondary: '#e89f71',
  accent: '#a8d5ba',
  border: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(212,165,116,0.25)',
  shadow: 'rgba(0,0,0,0.3)',
  danger: '#ef6b6b',
  sidebarBg: '#141414',
  headerBg: 'rgba(15,15,15,0.85)',
  codeBg: '#0d0d0d',
}

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('mavis_theme')
    if (saved) return saved === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  const toggle = () => {
    setIsDark(prev => {
      const next = !prev
      localStorage.setItem('mavis_theme', next ? 'dark' : 'light')
      return next
    })
  }

  useEffect(() => {
    document.body.style.background = isDark ? darkPalette.bg : lightPalette.bg
    document.body.style.color = isDark ? darkPalette.text : lightPalette.text
    document.body.style.transition = 'background 0.3s, color 0.3s'
  }, [isDark])

  const palette = isDark ? darkPalette : lightPalette

  return (
    <ThemeContext.Provider value={{ isDark, toggle, palette }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
