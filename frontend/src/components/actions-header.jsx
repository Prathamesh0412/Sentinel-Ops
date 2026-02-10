"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Target, Settings, Clock } from "lucide-react"

export function ActionsHeader() {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-balance">
          Action Execution Center
        </h1>
        <p className="mt-2 text-lg text-muted-foreground text-pretty">
          Review, approve, and monitor automated business actions
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="outline" className="bg-accent/10">
          <Target className="mr-1 size-3" />
          856 Executed
        </Badge>
        <Button variant="outline" size="sm">
          <Clock className="mr-2 size-4" />
          History
        </Button>
        <Button size="sm">
          <Settings className="mr-2 size-4" />
          Configure
        </Button>
      </div>
    </div>
  )
}
