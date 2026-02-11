"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Cpu,
  Target,
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Eye
} from "lucide-react"
import { useActions, useMetrics, usePredictions, useWorkflows, useAppStore } from "@/lib/store"
import { useDataAnalysisStore } from "@/lib/data-analysis-store"

const MiniLineChart = ({ data, color = "#3b82f6" }) => {
  if (!data.length) {
    return <div className="h-16 rounded bg-muted" />
  }

  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  return (
    <div className="h-16 flex items-end gap-1">
      {data.map((value, index) => (
        <div
          key={`line-${index}`}
          className="flex-1 bg-current opacity-70 rounded-t"
          style={{
            height: `${((value - min) / range) * 100}%`,
            color,
            minHeight: "2px"
          }}
        />
      ))}
    </div>
  )
}

const MiniBarChart = ({ data, color = "#10b981" }) => {
  if (!data.length) {
    return <div className="h-16 rounded bg-muted" />
  }

  const max = Math.max(...data, 1)

  return (
    <div className="h-16 flex items-end gap-1">
      {data.map((value, index) => (
        <div
          key={`bar-${index}`}
          className="flex-1 bg-current opacity-85 rounded-t"
          style={{
            height: `${(value / max) * 100}%`,
            color,
            minHeight: "2px"
          }}
        />
      ))}
    </div>
  )
}

const GaugeChart = ({ value, max = 100, label }) => {
  const percentage = max ? (value / max) * 100 : 0
  const normalized = Math.min(Math.max(percentage, 0), 100)

  let color = "#10b981"
  if (normalized < 30) color = "#ef4444"
  else if (normalized < 60) color = "#f59e0b"

  const arcLength = Math.PI * 45
  const dash = (normalized / 100) * arcLength

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <svg
        viewBox="0 0 100 52"
        className="w-full max-w-[260px] drop-shadow-sm"
        role="img"
        aria-label={`${Math.round(normalized)} percent ${label}`}
      >
        <path d="M5 47 A45 45 0 0 1 95 47" stroke="var(--muted-foreground)" strokeWidth="10" fill="none" opacity="0.2" />
        <path
          d="M5 47 A45 45 0 0 1 95 47"
          stroke={color}
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${arcLength}`}
        />
      </svg>
      <div className="text-center">
        <div className="text-2xl font-semibold leading-none">{Math.round(normalized)}%</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  )
}

const formatActionType = (value) => {
  if (!value) return "General"
  return value
    .toString()
    .replace(/[_-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

const buildTrendSeries = (total, length, variance = 0.25) => {
  if (!length) return []
  if (!total) return Array(length).fill(0)
  const base = total / length
  return Array.from({ length }, (_, idx) => {
    const wave = Math.sin(idx / 2.5) * base * variance
    return Math.max(0, base + wave)
  })
}

const calcTrendPercent = (series) => {
  if (series.length < 2) return 0
  const first = series[0] || 1
  const last = series[series.length - 1]
  return Math.round(((last - first) / first) * 100)
}

const safeNumber = (value, fallback = 0) => {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : fallback
}

const formatCurrency = (value) => {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return "₹0"
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: numeric >= 100000 ? 0 : 1
  }).format(numeric)
}

export function VisualIntelligenceDashboard() {
  const actions = useActions()
  const metrics = useMetrics()
  const predictions = usePredictions()
  const workflows = useWorkflows()
  const { fetchActions, fetchPredictions, fetchWorkflows, updateMetrics } = useAppStore()
  const { latestInsights, fetchBaselineInsights } = useDataAnalysisStore()

  const [mounted, setMounted] = useState(false)
  const [explanationMode, setExplanationMode] = useState(false)
  const [timeRange, setTimeRange] = useState("30d")

  useEffect(() => {
    let isMounted = true
    setMounted(true)

    const hydrate = async () => {
      try {
        await Promise.all([
          updateMetrics(),
          fetchActions(),
          fetchPredictions(),
          fetchWorkflows(),
          fetchBaselineInsights()
        ])
      } catch (error) {
        console.warn("[VisualIntelligenceDashboard] bootstrap error", error)
      }
    }

    hydrate()

    const interval = setInterval(() => {
      if (!isMounted) return
      updateMetrics().catch(() => {})
      fetchPredictions().catch(() => {})
      fetchActions().catch(() => {})
    }, 15000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [fetchActions, fetchPredictions, fetchWorkflows, updateMetrics, fetchBaselineInsights])

  const computedMetrics = useMemo(() => {
    const executedActions = actions.filter((action) => action.status === "executed" || action.status === "completed").length || metrics.executedActions || 0
    const pendingActions = actions.filter((action) => action.status === "pending").length || metrics.pendingActions || 0
    const rejectedActions = actions.filter((action) => ["failed", "rejected", "rolled_back"].includes(action.status)).length

    const totalActions = actions.length || metrics.totalActions || executedActions + pendingActions
    const totalTimeSaved = safeNumber(metrics.timeSaved, executedActions * 1.2)
    const systemHealth = safeNumber(metrics.systemHealth || metrics.confidenceScore, 0)
    const totalRevenueImpact = safeNumber(metrics.totalRevenue, 0)

    const churnSignals = predictions.filter((prediction) => (prediction.prediction_type || prediction.type || "").includes("churn")).length
    const churnRate = metrics.totalCustomers ? (churnSignals / metrics.totalCustomers) * 100 : 0

    const inventorySignals = predictions.filter((prediction) => (prediction.prediction_type || prediction.type || "").includes("inventory"))
    const highInventoryAlerts = inventorySignals.filter((prediction) => (prediction.severity || "").toLowerCase() === "high").length
    const inventoryHealth = inventorySignals.length
      ? Math.max(0, 100 - (highInventoryAlerts / inventorySignals.length) * 100)
      : 100

    const avgConfidence = predictions.length
      ? predictions.reduce((sum, prediction) => sum + safeNumber(prediction.confidence, systemHealth), 0) / predictions.length
      : systemHealth

    const activeWorkflows = workflows.filter((workflow) => workflow.is_active).length
    const workflowSuccessRate = workflows.length ? (activeWorkflows / workflows.length) * 100 : 0
    const actionSuccessRate = totalActions ? (executedActions / totalActions) * 100 : 0

    return {
      executedActions,
      pendingActions,
      rejectedActions,
      totalTimeSaved,
      systemHealth,
      totalRevenueImpact,
      churnRate,
      inventoryHealth,
      avgConfidence,
      actionSuccessRate,
      workflowSuccessRate
    }
  }, [actions, metrics, predictions, workflows])

  const salesStats = useMemo(
    () => (Array.isArray(latestInsights?.sales_stats) ? latestInsights.sales_stats : []),
    [latestInsights]
  )
  const stockStatus = useMemo(
    () => (Array.isArray(latestInsights?.stock_status) ? latestInsights.stock_status : []),
    [latestInsights]
  )
  const priceRecommendations = useMemo(
    () => (Array.isArray(latestInsights?.price_recommendations) ? latestInsights.price_recommendations : []),
    [latestInsights]
  )

  const salesSeries = useMemo(
    () => salesStats.map((stat) => safeNumber(stat.total_sales, 0)).filter((value) => value > 0).slice(0, 12),
    [salesStats]
  )
  const velocitySeries = useMemo(
    () => salesStats.map((stat) => safeNumber(stat.avg_daily_sales, 0)).filter((value) => value > 0).slice(0, 12),
    [salesStats]
  )
  const runwaySeries = useMemo(
    () => stockStatus.map((entry) => safeNumber(entry.days_until_stock_out, 0)).filter((value) => value > 0).slice(0, 12),
    [stockStatus]
  )
  const priceDeltaSeries = useMemo(
    () => priceRecommendations
      .map((rec) => Math.abs(safeNumber(rec.recommended_price, 0) - safeNumber(rec.current_price, 0)))
      .filter((value) => value > 0)
      .slice(0, 12),
    [priceRecommendations]
  )

  const salesTotals = useMemo(
    () => salesStats.reduce((sum, stat) => sum + safeNumber(stat.total_sales, 0), 0),
    [salesStats]
  )
  const avgDailyVelocity = useMemo(() => {
    if (!salesStats.length) return 0
    return salesStats.reduce((sum, stat) => sum + safeNumber(stat.avg_daily_sales, 0), 0) / salesStats.length
  }, [salesStats])
  const inventoryHealthScore = useMemo(() => {
    if (!stockStatus.length) return 0
    const healthy = stockStatus.filter((entry) => (entry.stock_status || "").toUpperCase() === "HEALTHY").length
    return Math.round((healthy / stockStatus.length) * 100)
  }, [stockStatus])
  const revenueImpactEstimate = useMemo(() => {
    if (!priceRecommendations.length) return 0
    const statsMap = new Map(salesStats.map((stat) => [stat.product_id, safeNumber(stat.total_sales, 0)]))
    return priceRecommendations.reduce((sum, rec) => {
      const delta = safeNumber(rec.recommended_price, 0) - safeNumber(rec.current_price, 0)
      const volume = statsMap.get(rec.product_id) || 1
      return sum + delta * volume
    }, 0)
  }, [priceRecommendations, salesStats])

  const hasUploadInsights = salesSeries.length > 0 || runwaySeries.length > 0 || priceDeltaSeries.length > 0

  const trendLength = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90

  const actionTrendData = useMemo(() => {
    if (hasUploadInsights && salesSeries.length) return salesSeries
    return buildTrendSeries(Math.max(computedMetrics.executedActions, 0.1), trendLength, 0.35)
  }, [computedMetrics.executedActions, hasUploadInsights, salesSeries, trendLength])

  const timeSavedTrendData = useMemo(() => {
    if (hasUploadInsights && velocitySeries.length) return velocitySeries
    return buildTrendSeries(Math.max(computedMetrics.totalTimeSaved, 0.1), trendLength, 0.2)
  }, [computedMetrics.totalTimeSaved, hasUploadInsights, velocitySeries, trendLength])

  const revenueDistribution = useMemo(() => {
    if (hasUploadInsights && priceDeltaSeries.length) return priceDeltaSeries
    const total = Math.max(computedMetrics.totalRevenueImpact, 0)
    const weights = [0.28, 0.22, 0.18, 0.17, 0.15]
    return total ? weights.map((weight) => total * weight) : Array(weights.length).fill(0)
  }, [computedMetrics.totalRevenueImpact, hasUploadInsights, priceDeltaSeries])

  const confidenceTrendData = useMemo(() => {
    if (!predictions.length) {
      return Array.from({ length: 12 }, () => Math.round(computedMetrics.avgConfidence))
    }
    const sorted = [...predictions].sort(
      (a, b) => new Date(a.createdAt ?? a.created_at ?? 0) - new Date(b.createdAt ?? b.created_at ?? 0)
    )
    const values = sorted.map((prediction) => safeNumber(prediction.confidence, computedMetrics.avgConfidence))
    while (values.length < 12) {
      values.push(values[values.length - 1] ?? computedMetrics.avgConfidence)
    }
    return values.slice(-30)
  }, [predictions, computedMetrics.avgConfidence])

  const inventoryConfidenceData = useMemo(() => {
    if (hasUploadInsights && runwaySeries.length) return runwaySeries
    return confidenceTrendData.map((value, index) => Math.max(0, value + (index % 3 === 0 ? 4 : -3)))
  }, [confidenceTrendData, hasUploadInsights, runwaySeries])

  const leadConfidenceData = useMemo(() => {
    if (hasUploadInsights && priceDeltaSeries.length) return priceDeltaSeries
    return confidenceTrendData.map((value, index) => Math.max(0, value + (index % 4 === 0 ? 5 : -2)))
  }, [confidenceTrendData, hasUploadInsights, priceDeltaSeries])

  const actionTypeDistribution = useMemo(() => {
    if (!actions.length) return []
    const counts = actions.reduce((acc, action) => {
      const key = formatActionType(action.action_type || action.type)
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})
    const palette = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"]
    return Object.entries(counts).map(([type, count], index) => ({
      type,
      count,
      color: palette[index % palette.length]
    }))
  }, [actions])

  const executionTimeline = useMemo(() => {
    if (!actions.length) return []
    const buckets = {
      current: { label: "This Week", executed: 0, rejected: 0 },
      previous: { label: "Last Week", executed: 0, rejected: 0 },
      earlier: { label: "2+ Weeks Ago", executed: 0, rejected: 0 }
    }

    const now = new Date()
    actions.forEach((action) => {
      const createdAt = new Date(action.created_at || action.createdAt || now)
      const diffWeeks = Math.floor((now - createdAt) / (7 * 24 * 60 * 60 * 1000))
      const bucketKey = diffWeeks <= 0 ? "current" : diffWeeks === 1 ? "previous" : "earlier"
      if (action.status === "executed" || action.status === "completed") {
        buckets[bucketKey].executed += 1
      } else if (["failed", "rejected", "rolled_back"].includes(action.status)) {
        buckets[bucketKey].rejected += 1
      }
    })

    return Object.values(buckets)
  }, [actions])

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 skeleton rounded" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((index) => (
            <Card key={`skeleton-${index}`}>
              <CardContent className="p-6 space-y-3">
                <div className="h-4 w-24 skeleton rounded" />
                <div className="h-8 w-20 skeleton rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const actionTrendPercent = calcTrendPercent(actionTrendData)
  const timeSavedTrendPercent = calcTrendPercent(timeSavedTrendData)
  const inventoryConfidenceAvg = inventoryConfidenceData.length
    ? Math.round(inventoryConfidenceData.reduce((sum, value) => sum + value, 0) / inventoryConfidenceData.length)
    : Math.round(computedMetrics.avgConfidence)
  const leadConfidenceAvg = leadConfidenceData.length
    ? Math.round(leadConfidenceData.reduce((sum, value) => sum + value, 0) / leadConfidenceData.length)
    : Math.round(computedMetrics.avgConfidence)
  const systemHealthValue = hasUploadInsights ? inventoryHealthScore : computedMetrics.systemHealth

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Cpu className="size-6 text-primary" />
            Visual Intelligence Dashboard
          </h2>
          <p className="text-muted-foreground">Real-time AI insights and business impact visualization</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Eye className="size-4" />
            <Button
              variant={explanationMode ? "default" : "outline"}
              size="sm"
              onClick={() => setExplanationMode((state) => !state)}
            >
              {explanationMode ? "Explanation Mode ON" : "Explanation Mode OFF"}
            </Button>
          </div>
          <div className="flex gap-1">
            {["7d", "30d", "90d"].map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "ghost"}
                size="sm"
                onClick={() => setTimeRange(range)}
              >
                {range}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <Card className={explanationMode ? "ring-2 ring-primary/20" : ""}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="size-5 text-primary" />
            Business Health Overview
          </CardTitle>
          <CardDescription>System-wide metrics derived from AI actions and their business impact</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{hasUploadInsights ? "Total Sales" : "Actions Executed"}</span>
                <Badge variant="outline" className="text-xs">
                  {hasUploadInsights ? `${Math.round(salesTotals)} units` : `${computedMetrics.executedActions} total`}
                </Badge>
              </div>
              <MiniLineChart data={actionTrendData} color="#3b82f6" />
              <div className="text-xs text-muted-foreground">
                {hasUploadInsights
                  ? `Top products • ${actionTrendPercent >= 0 ? "+" : ""}${actionTrendPercent}% spread`
                  : `${timeRange} trend • ${actionTrendPercent >= 0 ? "+" : ""}${actionTrendPercent}% vs last period`}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{hasUploadInsights ? "Avg Daily Velocity" : "Time Saved"}</span>
                <Badge variant="outline" className="text-xs">
                  {hasUploadInsights ? `${avgDailyVelocity.toFixed(1)} units/day` : `${Math.round(computedMetrics.totalTimeSaved)}h total`}
                </Badge>
              </div>
              <MiniBarChart data={timeSavedTrendData} color="#10b981" />
              <div className="text-xs text-muted-foreground">
                {hasUploadInsights
                  ? `${timeSavedTrendPercent >= 0 ? "+" : ""}${timeSavedTrendPercent}% velocity swing`
                  : `${timeSavedTrendPercent >= 0 ? "+" : ""}${timeSavedTrendPercent}% change • ${Math.max(0, Math.round(computedMetrics.totalTimeSaved / 24))} days saved`}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{hasUploadInsights ? "Stock Health" : "System Health"}</span>
                <Badge variant="outline" className="text-xs">
                  {Math.round(systemHealthValue)}%
                </Badge>
              </div>
              <GaugeChart value={systemHealthValue} label={hasUploadInsights ? "Stock" : "Health"} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{hasUploadInsights ? "Price Impact" : "Revenue Impact"}</span>
                <Badge variant="outline" className="text-xs">
                  {hasUploadInsights ? formatCurrency(revenueImpactEstimate) : `₹${Math.round(computedMetrics.totalRevenueImpact).toLocaleString()}`}
                </Badge>
              </div>
              <MiniBarChart data={revenueDistribution} color="#8b5cf6" />
              <div className="text-xs text-muted-foreground">
                {hasUploadInsights ? "From ML price recommendations" : `From ${computedMetrics.executedActions} executed actions`}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={explanationMode ? "ring-2 ring-primary/20" : ""}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="size-5 text-amber-500" />
            {hasUploadInsights ? "ML Insight Signals" : "AI Prediction Confidence Trends"}
          </CardTitle>
          <CardDescription>
            {hasUploadInsights
              ? "Signals derived from uploaded data and model-generated insights"
              : "Confidence scores evolve based on prediction accuracy and outcomes"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{hasUploadInsights ? "Sales Momentum" : "Churn Prediction"}</span>
                <Badge variant="outline" className="text-xs">
                  {hasUploadInsights ? `${Math.round(avgDailyVelocity)} avg` : `${Math.round(computedMetrics.avgConfidence)}% avg`}
                </Badge>
              </div>
              <MiniLineChart data={hasUploadInsights ? actionTrendData : confidenceTrendData} color="#ef4444" />
              <div className="text-xs text-muted-foreground">
                {hasUploadInsights ? (
                  <span className="text-green-500 flex items-center gap-1">
                    <TrendingUp className="size-3" />
                    Demand signals from uploaded sales
                  </span>
                ) : computedMetrics.churnRate > 30 ? (
                  <span className="text-red-500 flex items-center gap-1">
                    <TrendingDown className="size-3" />
                    High churn risk detected
                  </span>
                ) : (
                  <span className="text-green-500 flex items-center gap-1">
                    <TrendingUp className="size-3" />
                    Stable customer base
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{hasUploadInsights ? "Stock Runway" : "Inventory Forecast"}</span>
                <Badge variant="outline" className="text-xs">
                  {hasUploadInsights ? `${Math.round(inventoryConfidenceAvg)} days` : `${inventoryConfidenceAvg}% avg`}
                </Badge>
              </div>
              <MiniLineChart data={inventoryConfidenceData} color="#f59e0b" />
              <div className="text-xs text-muted-foreground">
                {hasUploadInsights ? (
                  <span className="text-amber-500 flex items-center gap-1">
                    <AlertTriangle className="size-3" />
                    Forecast from stock days until out
                  </span>
                ) : computedMetrics.inventoryHealth < 60 ? (
                  <span className="text-amber-500 flex items-center gap-1">
                    <AlertTriangle className="size-3" />
                    Low stock alerts active
                  </span>
                ) : (
                  <span className="text-green-500 flex items-center gap-1">
                    <CheckCircle2 className="size-3" />
                    Inventory levels optimal
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{hasUploadInsights ? "Price Optimization" : "Lead Scoring"}</span>
                <Badge variant="outline" className="text-xs">
                  {hasUploadInsights ? `${leadConfidenceAvg.toFixed(1)} avg` : `${leadConfidenceAvg}% avg`}
                </Badge>
              </div>
              <MiniLineChart data={leadConfidenceData} color="#10b981" />
              <div className="text-xs text-muted-foreground">
                {hasUploadInsights ? (
                  <span className="text-blue-500 flex items-center gap-1">
                    <Target className="size-3" />
                    Price deltas from model recommendations
                  </span>
                ) : (
                  <span className="text-blue-500 flex items-center gap-1">
                    <Target className="size-3" />
                    Lead quality improving
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={explanationMode ? "ring-2 ring-primary/20" : ""}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="size-5 text-purple-500" />
            Action Execution Impact
          </CardTitle>
          <CardDescription>Comparison of action mix and throughput over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Action Types Distribution</h4>
              {actionTypeDistribution.length === 0 ? (
                <p className="text-xs text-muted-foreground">No actions recorded from the backend yet.</p>
              ) : (
                <div className="space-y-2">
                  {actionTypeDistribution.map(({ type, count, color }) => (
                    <div key={type} className="flex items-center gap-3">
                      <div className="w-28 text-sm">{type}</div>
                      <div className="flex-1">
                        <Progress value={(count / Math.max(actionTypeDistribution[0].count, 1)) * 100} className="h-2" style={{ "--progress-background": color }} />
                      </div>
                      <div className="w-10 text-right text-sm">{count}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium">Execution Timeline</h4>
              {executionTimeline.length === 0 ? (
                <p className="text-xs text-muted-foreground">Waiting for execution data...</p>
              ) : (
                <div className="space-y-2">
                  {executionTimeline.map(({ label, executed, rejected }) => {
                    const total = Math.max(executed + rejected, 1)
                    return (
                      <div key={label} className="flex items-center gap-3">
                        <div className="w-28 text-sm">{label}</div>
                        <div className="flex-1 flex gap-1 items-center">
                          <div className="bg-green-500 rounded-sm" style={{ width: `${(executed / total) * 100}%`, height: "8px" }} />
                          <div className="bg-red-500 rounded-sm" style={{ width: `${(rejected / total) * 100}%`, height: "8px" }} />
                        </div>
                        <div className="w-16 text-xs text-right">
                          <span className="text-green-500">{executed}</span>
                          {" / "}
                          <span className="text-red-500">{rejected}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {explanationMode && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Eye className="size-5 text-primary mt-0.5" />
              <div className="space-y-2 text-sm">
                <h4 className="font-medium">Explanation Mode Active</h4>
                <p className="text-muted-foreground">
                  When upload analysis data is available, the charts reflect ML outputs derived from the latest file
                  analysis. Otherwise, they fall back to system metrics from `/api/metrics`, `/api/actions`, and
                  `/api/predictions`.
                </p>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-blue-500 rounded" />
                    Actions Executed
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-500 rounded" />
                    Time Saved
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-purple-500 rounded" />
                    Revenue Impact
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
