import { useEffect, useRef } from 'react'

export default function Background() {
  const canvasRef = useRef(null)

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

    const offscreen = document.createElement('canvas')
    const offCtx = offscreen.getContext('2d')

    const animate = () => {
      t += 0.002
      const w = canvas.width
      const h = canvas.height

      offscreen.width = w
      offscreen.height = h

      offCtx.fillStyle = '#faf9f7'
      offCtx.fillRect(0, 0, w, h)

      const cornerGlow = offCtx.createRadialGradient(w * 0.08, h * 0.1, 0, w * 0.08, h * 0.1, Math.max(w, h) * 0.42)
      cornerGlow.addColorStop(0, 'rgba(212,165,116,0.09)')
      cornerGlow.addColorStop(1, 'rgba(212,165,116,0)')
      offCtx.fillStyle = cornerGlow
      offCtx.fillRect(0, 0, w, h)

      const coralGlow = offCtx.createRadialGradient(w * 0.9, h * 0.9, 0, w * 0.9, h * 0.9, Math.max(w, h) * 0.38)
      coralGlow.addColorStop(0, 'rgba(232,159,113,0.08)')
      coralGlow.addColorStop(1, 'rgba(232,159,113,0)')
      offCtx.fillStyle = coralGlow
      offCtx.fillRect(0, 0, w, h)

      const waves = [
        { color: '212,165,116', y: 0.28, amp: 0.05, freq: 0.4, speed: 0.08, opacity: 0.045, spread: 0.2 },
        { color: '168,213,186', y: 0.5, amp: 0.045, freq: 0.5, speed: 0.1, opacity: 0.035, spread: 0.18 },
        { color: '232,159,113', y: 0.72, amp: 0.04, freq: 0.35, speed: 0.06, opacity: 0.04, spread: 0.15 },
      ]

      waves.forEach(wave => {
        const centerY = h * wave.y
        const waveH = h * wave.spread
        for (let x = 0; x <= w; x += 10) {
          const progress = x / w
          const waveY = centerY + Math.sin(progress * Math.PI * wave.freq * 2 + t * wave.speed) * h * wave.amp
          const grad = offCtx.createLinearGradient(x, waveY - waveH, x, waveY + waveH)
          grad.addColorStop(0, `rgba(${wave.color},0)`)
          grad.addColorStop(0.5, `rgba(${wave.color},${wave.opacity})`)
          grad.addColorStop(1, `rgba(${wave.color},0)`)
          offCtx.fillStyle = grad
          offCtx.fillRect(x, waveY - waveH, 10, waveH * 2)
        }
      })

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

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }} />
}
