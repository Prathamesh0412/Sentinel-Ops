import { useNavigate } from "react-router-dom"
import { MetricCard } from "@/components/ui/metric-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Zap, Target, Clock, Activity, BarChart3, Users } from "lucide-react"
import { useEffect, useState } from "react"
import { useAppStore, useMetrics, useIsProcessing } from "@/lib/store"
import { NoSSR } from "@/components/no-ssr"

export function DashboardOverview() {
  const navigate = useNavigate()
  const metrics = useMetrics()
  const isProcessing = useIsProcessing()
  const { updateMetrics } = useAppStore()
  const [mounted, setMounted] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  useEffect(() => {
    setMounted(true)
    
    const interval = setInterval(() => {
      updateMetrics()
      setLastUpdated(new Date())
    }, 5000)

    return () => clearInterval(interval)
  }, [updateMetrics])

  const handleMetricClick = (metricType) => {
    switch (metricType) {
      case 'workflows':
        navigate('/workflows')
        break
      case 'predictions':
        navigate('/insights')
        break
      case 'actions':
        navigate('/actions')
        break
      default:
        break
    }
  }

  const metricCards = [
    {
      title: "Active Workflows",
      value: metrics.activeWorkflows,
      icon: Zap,
      description: "AI agents running",
      trend: 'up',
      trendValue: 12,
    },
    {
      title: "Predictions Generated",
      value: metrics.predictionsGenerated,
      icon: BarChart3,
      description: "AI insights created",
      trend: 'up',
      trendValue: 8,
    },
    {
      title: "Actions Executed",
      value: metrics.totalActions,
      icon: Target,
      description: "Automated tasks completed",
      trend: 'up',
      trendValue: 15,
    },
    {
      title: "Time Saved",
      value: metrics.timeSaved,
      icon: Clock,
      description: "Hours saved this week",
      suffix: "h",
      trend: 'up',
      trendValue: 24,
    }
  ]

  return (
    <NoSSR fallback={
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-muted animate-pulse rounded" />
        ))}
      </div>
    }>
      <div className="space-y-6">
        {/* Last updated indicator */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">System Overview</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {metricCards.map((metric, index) => (
            <MetricCard
              key={index}
              title={metric.title}
              value={metric.value}
              suffix={metric.suffix}
              icon={metric.icon}
              description={metric.description}
              trend={metric.trend}
              trendValue={metric.trendValue}
              onClick={() => handleMetricClick(metric.title.toLowerCase().includes('workflow') ? 'workflows' : 
                             metric.title.toLowerCase().includes('prediction') ? 'predictions' : 
                             metric.title.toLowerCase().includes('action') ? 'actions' : '')}
            />
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Activity Overview</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                Activity Chart Placeholder
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Recent Predictions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Prediction #{i}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        High confidence anomaly detected
                      </p>
                    </div>
                    <div className="ml-auto font-medium">
                      +{(Math.random() * 10).toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </NoSSR>
  )
}
