"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Target, 
  Clock, 
  Activity, 
  BarChart3,
  Zap,
  DollarSign,
  Package
} from "lucide-react"
import { useDataStore } from "@/lib/core/data-store"
import { useState, useEffect } from "react"

export function IntelligentDashboard() {
  const { metrics, customers, products, orders, actions, insights } = useDataStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-4 w-24 skeleton rounded" />
                <div className="h-8 w-16 skeleton rounded" />
                <div className="h-2 w-full skeleton rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const metricCards = [
    {
      title: "Total Customers",
      value: metrics.total_customers,
      change: customers.filter(c => c.engagement_score > 80).length,
      changeType: "increase",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10"
    },
    {
      title: "Active Products",
      value: metrics.total_products,
      change: products.filter(p => p.stock_quantity > p.reorder_threshold).length,
      changeType: "increase",
      icon: Package,
      color: "text-green-600",
      bgColor: "bg-green-500/10"
    },
    {
      title: "Total Revenue",
      value: `$${(metrics.total_revenue / 1000).toFixed(1)}K`,
      change: orders.filter(o => new Date(o.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length,
      changeType: "increase",
      icon: DollarSign,
      color: "text-amber-600",
      bgColor: "bg-amber-500/10"
    },
    {
      title: "System Health",
      value: `${metrics.system_health}%`,
      change: metrics.confidence_score - 85,
      changeType: metrics.confidence_score > 85 ? "increase" : "decrease",
      icon: Activity,
      color: metrics.system_health > 80 ? "text-green-600" : "text-red-600",
      bgColor: metrics.system_health > 80 ? "bg-green-500/10" : "bg-red-500/10"
    }
  ]

  const recentInsights = insights.slice(0, 3)
  const pendingActions = actions.filter(a => a.status === 'pending').slice(0, 3)

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((metric, index) => {
          const Icon = metric.icon
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {metric.title}
                    </p>
                    <p className="text-2xl font-bold">{metric.value}</p>
                  </div>
                  <div className={`flex size-8 items-center justify-center rounded-lg ${metric.bgColor}`}>
                    <Icon className={`size-4 ${metric.color}`} />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  {metric.changeType === "increase" ? (
                    <TrendingUp className="size-4 text-green-600" />
                  ) : (
                    <TrendingDown className="size-4 text-red-600" />
                  )}
                  <span className={`text-sm ${
                    metric.changeType === "increase" ? "text-green-600" : "text-red-600"
                  }`}>
                    {metric.changeType === "increase" ? "+" : ""}{metric.change}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    from last period
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent AI Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="size-5 text-primary" />
              Recent AI Insights
            </CardTitle>
            <CardDescription>
              Latest intelligence from the AI engine
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentInsights.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  <Activity className="size-12 mx-auto mb-4 opacity-50" />
                  <p>Analyzing data for new insights...</p>
                </div>
              ) : (
                recentInsights.map((insight) => (
                  <div key={insight.id} className="flex items-start gap-3 p-3 rounded-lg border">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Target className="size-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="font-medium text-sm">{insight.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {insight.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {Math.round(insight.confidence)}% confident
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          ${insight.business_impact.toLocaleString()} impact
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pending Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="size-5 text-amber-500" />
              Pending Actions
            </CardTitle>
            <CardDescription>
              AI-generated actions awaiting approval
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingActions.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  <Target className="size-12 mx-auto mb-4 opacity-50" />
                  <p>No pending actions</p>
                </div>
              ) : (
                pendingActions.map((action) => (
                  <div key={action.id} className="flex items-start gap-3 p-3 rounded-lg border">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                      <Activity className="size-4 text-amber-500" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="font-medium text-sm">{action.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {action.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={action.priority === 'High' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {action.priority}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          ${action.expected_impact.toLocaleString()} impact
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="size-5 text-primary" />
            System Performance
          </CardTitle>
          <CardDescription>
            Real-time AI system metrics and efficiency
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Time Saved</span>
                <span className="text-sm text-muted-foreground">
                  {metrics.time_saved_hours} hours
                </span>
              </div>
              <Progress value={Math.min(100, metrics.time_saved_hours * 2)} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Actions Executed</span>
                <span className="text-sm text-muted-foreground">
                  {metrics.executed_actions}
                </span>
              </div>
              <Progress 
                value={Math.min(100, (metrics.executed_actions / Math.max(1, metrics.executed_actions + metrics.pending_actions)) * 100)} 
                className="h-2" 
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">AI Confidence</span>
                <span className="text-sm text-muted-foreground">
                  {metrics.confidence_score}%
                </span>
              </div>
              <Progress value={metrics.confidence_score} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
