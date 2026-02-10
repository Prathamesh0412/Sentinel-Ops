"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Zap, Plus, Settings } from "lucide-react"

export function WorkflowsHeader() {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-balance">
          AI Workflow Automation
        </h1>
        <p className="mt-2 text-lg text-muted-foreground text-pretty">
          Configure and manage automated business workflows
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="outline" className="bg-primary/10">
          <Zap className="mr-1 size-3" />
          24 Active
        </Badge>
        <Button variant="outline" size="sm">
          <Settings className="mr-2 size-4" />
          Settings
        </Button>
        <Button size="sm">
          <Plus className="mr-2 size-4" />
          New Workflow
        </Button>
      </div>
    </div>
  )
}
