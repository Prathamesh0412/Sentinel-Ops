"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Zap, Clock, CheckCircle2, TrendingUp } from "lucide-react"
import { useEffect, useState } from "react"

export function WorkflowStats() {
  const [stats, setStats] = useState({
    totalWorkflows: 0,
    activeWorkflows: 0,
    successRate: 0,
    actionsThisWeek: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/workflows/stats')
        if (!response.ok) {
          console.error('[v0] API error:', response.status)
          return
        }
        const data = await response.json()
        console.log('[v0] Workflow stats received:', data)
        if (data && typeof data === 'object') {
          setStats(data)
        } else {
          console.error('[v0] Invalid stats data:', data)
        }
      } catch (error) {
        console.error('[v0] Error fetching workflow stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const statCards = [
    {
      label: "Total Workflows",
      value: loading ? "..." : stats.totalWorkflows,
      icon: Zap,
      color: "text-primary",
    },
    {
      label: "Active Now",
      value: loading ? "..." : stats.activeWorkflows,
      icon: Clock,
      color: "text-accent",
    },
    {
      label: "Success Rate",
      value: loading ? "..." : `${stats.successRate}%`,
      icon: CheckCircle2,
      color: "text-accent",
    },
    {
      label: "Actions This Week",
      value: loading ? "..." : stats.actionsThisWeek,
      icon: TrendingUp,
      color: "text-primary",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {statCards.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Icon className={`size-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
