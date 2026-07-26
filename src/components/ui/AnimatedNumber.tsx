import { useState, useEffect } from 'react'

interface AnimatedNumberProps {
  value: number
  duration?: number
}

export default function AnimatedNumber({ value, duration = 1200 }: AnimatedNumberProps) {
  const [display, setDisplay] = useState<number>(0)

  useEffect(() => {
    let frameId: number
    const startTime = Date.now()
    const tick = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(eased * value))
      if (progress < 1) frameId = requestAnimationFrame(tick)
    }
    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [value, duration])

  return <span>{display}</span>
}
