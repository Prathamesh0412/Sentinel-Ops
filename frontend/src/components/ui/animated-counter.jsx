"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export function AnimatedCounter({ 
  value, 
  duration = 2000, 
  className,
  suffix = "",
  prefix = ""
}) {
  const [currentValue, setCurrentValue] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    setIsAnimating(true)
    const startTime = Date.now()
    const startValue = currentValue

    const animate = () => {
      const now = Date.now()
      const progress = Math.min((now - startTime) / duration, 1)
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const newValue = Math.floor(startValue + (value - startValue) * easeOutQuart)
      
      setCurrentValue(newValue)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setIsAnimating(false)
      }
    }

    requestAnimationFrame(animate)
  }, [value, duration])

  return (
    <span className={cn("tabular-nums", isAnimating && "transition-all duration-75", className)}>
      {prefix}{currentValue.toLocaleString()}{suffix}
    </span>
  )
}
