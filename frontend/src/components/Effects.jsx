import { useMemo, useState, useEffect } from 'react'
import { BALL_COLORS } from '../data/landingData.js'

export function RippleOverlay({ x, y, ringColor = 'rgba(228,211,41,0.55)' }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className="ripple-ring"
          style={{
            width: 80, height: 80,
            left: `calc(${x}% - 40px)`,
            top: `calc(${y}% - 40px)`,
            borderColor: ringColor,
            animationDelay: `${i * 0.85}s`,
          }}
        />
      ))}
    </div>
  )
}

export function CursorRippleOverlay() {
  const [ripple, setRipple] = useState({ x: 50, y: 50, show: false })

  useEffect(() => {
    const onMove = (e) => {
      setRipple({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
        show: true,
      })
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      {ripple.show && <RippleOverlay x={ripple.x} y={ripple.y} />}
    </div>
  )
}

export function Ballpit({ dense = false }) {
  const balls = useMemo(() =>
    Array.from({ length: dense ? 30 : 22 }, (_, i) => ({
      id: i,
      size: Math.random() * 42 + 8,
      left: Math.random() * 100,
      bottom: Math.random() * 35,
      dur: Math.random() * 8 + 4,
      delay: Math.random() * 7,
      color: BALL_COLORS[Math.floor(Math.random() * 8)],
      opacity: Math.random() * 0.45 + 0.12,
    }))
    , [dense])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {balls.map(b => (
        <div
          key={b.id}
          className="ballpit-ball"
          style={{
            width: b.size, height: b.size,
            left: `${b.left}%`, bottom: `${b.bottom}%`,
            background: b.color,
            '--ball-opacity': b.opacity,
            '--ball-dur': `${b.dur}s`,
            '--ball-delay': `${b.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

export function ElectricCard({ children, dark, featured }) {
  return (
    <div className={`electric-border-outer h-full${featured ? ' ring-2 ring-offset-2 ring-[#F6FF99]/60 ring-offset-transparent' : ''}`}>
      <div className={`rounded-[12px] h-full ${dark ? 'bg-[#080640]' : 'bg-white'}`}>
        {children}
      </div>
    </div>
  )
}

export function GlowCard({ children, dark }) {
  return (
    <div className={`border-glow-card h-full ${dark ? 'bg-[#080640]' : 'bg-white/95'}`}>
      {children}
    </div>
  )
}