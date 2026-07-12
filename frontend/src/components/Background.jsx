import { useEffect, useRef } from 'react'

export default function Background() {
  const canvasRef = useRef()

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animId
    let t = 0

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Pre-create offscreen canvas for aurora
    const offscreen = document.createElement('canvas')
    const offCtx = offscreen.getContext('2d')

    const animate = () => {
      t += 0.003
      const w = canvas.width
      const h = canvas.height

      offscreen.width = w
      offscreen.height = h

      // Base
      offCtx.fillStyle = '#0d1a0f'
      offCtx.fillRect(0, 0, w, h)

      // Simplified aurora — fewer waves, bigger steps
      const waves = [
        { color: '45,120,50', y: 0.25, amp: 0.08, freq: 0.5, speed: 0.1, opacity: 0.1, spread: 0.25 },
        { color: '212,136,58', y: 0.45, amp: 0.06, freq: 0.7, speed: 0.15, opacity: 0.06, spread: 0.2 },
        { color: '30,90,35', y: 0.65, amp: 0.07, freq: 0.4, speed: 0.08, opacity: 0.08, spread: 0.22 },
      ]

      waves.forEach(wave => {
        const centerY = h * wave.y
        const waveH = h * wave.spread

        // Bigger step = less computation = no lag
        for (let x = 0; x <= w; x += 8) {
          const progress = x / w
          const waveY = centerY + Math.sin(progress * Math.PI * wave.freq * 2 + t * wave.speed) * h * wave.amp
          const grad = offCtx.createLinearGradient(x, waveY - waveH, x, waveY + waveH)
          grad.addColorStop(0, `rgba(${wave.color},0)`)
          grad.addColorStop(0.5, `rgba(${wave.color},${wave.opacity})`)
          grad.addColorStop(1, `rgba(${wave.color},0)`)
          offCtx.fillStyle = grad
          offCtx.fillRect(x, waveY - waveH, 8, waveH * 2)
        }
      })

      // Corner glows — simple radial, drawn once
      const topLeft = offCtx.createRadialGradient(0, 0, 0, 0, 0, w * 0.4)
      topLeft.addColorStop(0, 'rgba(45,120,50,0.07)')
      topLeft.addColorStop(1, 'rgba(45,120,50,0)')
      offCtx.fillStyle = topLeft
      offCtx.fillRect(0, 0, w, h)

      const bottomRight = offCtx.createRadialGradient(w, h, 0, w, h, w * 0.4)
      bottomRight.addColorStop(0, 'rgba(212,136,58,0.05)')
      bottomRight.addColorStop(1, 'rgba(212,136,58,0)')
      offCtx.fillStyle = bottomRight
      offCtx.fillRect(0, 0, w, h)

      // Draw offscreen to main canvas in one shot
      ctx.clearRect(0, 0, w, h)
      ctx.drawImage(offscreen, 0, 0)

      animId = requestAnimationFrame(animate)
    }

    animate()
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas ref={canvasRef} style={{
      position: 'fixed',
      inset: 0,
      width: '100%',
      height: '100%',
      zIndex: 0,
      pointerEvents: 'none',
    }} />
  )
}