"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  Zap,
  Eye
} from "lucide-react"

const recentActions = [
  {
    id: 1,
    title: "Retention offer sent",
    description: "Sarah Chen - 20% discount",
    status: "success",
    timestamp: "2 min ago",
    impact: "$12,500 protected",
  },
  {
    id: 2,
    title: "PO generated",
    description: "Widget Pro 3000 - 500 units",
    status: "success",
    timestamp: "15 min ago",
    impact: "Stockout prevented",
  },
  {
    id: 3,
    title: "Lead prioritized",
    description: "TechCorp Inc. - Sales pipeline",
    status: "success",
    timestamp: "1 hour ago",
    impact: "$45K opportunity",
  },
  {
    id: 4,
    title: "Report generated",
    description: "Weekly executive summary",
    status: "success",
    timestamp: "3 hours ago",
    impact: "5h saved",
  },
  {
    id: 5,
    title: "Email campaign",
    description: "Q1 product updates",
    status: "pending",
    timestamp: "5 hours ago",
    impact: "2,891 recipients",
  },
]

const stats = [
  { label: "Success Rate", value: "96.5%", icon: CheckCircle2 },
  { label: "Avg Response Time", value: "2.3s", icon: Clock },
  { label: "Total Impact", value: "$2.4M", icon: TrendingUp },
]

export function ActionHistoryPanel() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="size-5 text-primary" />
            Quick Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="size-4 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                </div>
                <span className="text-lg font-bold">{stat.value}</span>
              </div>
            )
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="size-5 text-primary" />
              Recent Activity
            </CardTitle>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentActions.map((action) => (
            <div
              key={action.id}
              className="flex items-start gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-accent/5"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                {action.status === "success" ? (
                  <CheckCircle2 className="size-5 text-accent" />
                ) : (
                  <Clock className="size-5 text-amber-500" />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-semibold">{action.title}</h4>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="size-7 shrink-0">
                    <Eye className="size-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{action.timestamp}</span>
                  <Badge variant="outline" className="text-xs">
                    {action.impact}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
