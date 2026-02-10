"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Zap } from "lucide-react"

export function InsightsHeader() {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-balance">
          AI Insights & Predictions
        </h1>
        <p className="mt-2 text-lg text-muted-foreground text-pretty">
          Real-time analysis and forecasting across your business operations
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="bg-primary/10">
          <Zap className="mr-1 size-3" />
          91% Accuracy
        </Badge>
      </div>
    </div>
  )
}
