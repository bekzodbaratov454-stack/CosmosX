import { useMemo } from 'react'

export default function StarsBackground() {
  const stars = useMemo(() => {
    return Array.from({ length: 150 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.5 + 0.5,
      duration: Math.random() * 4 + 2,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.7 + 0.3,
    }))
  }, [])

  const meteors = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => ({
      id: i,
      top: Math.random() * 50,
      left: Math.random() * 100,
      delay: Math.random() * 10,
      duration: Math.random() * 3 + 2,
    }))
  }, [])

  return (
    <div className="stars-container" aria-hidden="true">
      {/* Nebula gradients */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at 20% 50%, rgba(99, 102, 241, 0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(168, 85, 247, 0.06) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(6, 182, 212, 0.05) 0%, transparent 50%)'
      }} />

      {/* Stars */}
      {stars.map(star => (
        <div
          key={star.id}
          className="star"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            '--duration': `${star.duration}s`,
            '--delay': `${star.delay}s`,
          }}
        />
      ))}

      {/* Meteors */}
      {meteors.map(meteor => (
        <div
          key={meteor.id}
          className="absolute"
          style={{
            top: `${meteor.top}%`,
            left: `${meteor.left}%`,
            animation: `meteor ${meteor.duration}s linear ${meteor.delay}s infinite`,
          }}
        >
          <div style={{
            width: '100px',
            height: '1px',
            background: 'linear-gradient(90deg, rgba(255,255,255,0.8), transparent)',
            transform: 'rotate(-45deg)',
          }} />
        </div>
      ))}
    </div>
  )
}
