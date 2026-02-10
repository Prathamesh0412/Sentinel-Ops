"use client"

import { useEffect } from "react"
import { useDataStore } from "@/lib/core/data-store"

export function RealTimeInitializer() {
  const { simulateRealTimeData } = useDataStore()

  useEffect(() => {
    // Start real-time data simulation
    const cleanup = simulateRealTimeData()
    
    return cleanup
  }, [simulateRealTimeData])

  return null
}
