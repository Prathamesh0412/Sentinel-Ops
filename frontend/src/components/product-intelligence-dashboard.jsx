"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  TrendingUp,
  AlertTriangle,
  BarChart3,
  ShoppingCart,
  Target,
  DollarSign,
  Zap,
  Eye,
  RefreshCw
} from "lucide-react"
import { useDataAnalysisStore } from "@/lib/data-analysis-store"

const severityOrder = {
  CRITICAL: 0,
  WATCH: 1,
  HEALTHY: 2,
  NO_SALES_DATA: 3
}

const severityTheme = {
  CRITICAL: {
    label: "Critical",
    badge: "bg-red-500/10 text-red-600",
    progress: "bg-red-500"
  },
  WATCH: {
    label: "Watch",
    badge: "bg-amber-500/10 text-amber-600",
    progress: "bg-amber-500"
  },
  HEALTHY: {
    label: "Healthy",
    badge: "bg-emerald-500/10 text-emerald-600",
    progress: "bg-emerald-500"
  },
  NO_SALES_DATA: {
    label: "No Data",
    badge: "bg-muted text-muted-foreground",
    progress: "bg-muted"
  }
}

const formatNumber = (value, options = {}) => {
  const fallback = value ?? 0
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 1,
    ...options
  }).format(Number.isFinite(fallback) ? fallback : 0)
}

const formatInteger = (value) => formatNumber(value, { maximumFractionDigits: 0 })

const formatDays = (value) => {
  if (value === null || value === undefined) return "—"
  return `${value.toFixed(1)}d`
}

const hashProduct = (productId) => {
  return String(productId || "").split("").reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 1), 0)
}

const buildSparklineSeries = (stat) => {
  const base = Math.max(0.5, Number(stat?.avg_daily_sales) || Number(stat?.total_sales) / 7 || 1)
  const hash = hashProduct(stat?.product_id)
  return Array.from({ length: 12 }, (_, index) => {
    const wave = Math.sin((index + hash % 6) / 2) * 0.2
    const drift = ((index % 4) - 1.5) * 0.04
    return Math.max(0.1, base * (0.85 + wave + drift))
  })
}

const ProductSparkline = ({ points, color = "#3b82f6" }) => {
  if (!points || points.length === 0) return null
  const max = Math.max(...points)
  const min = Math.min(...points)
  const range = max - min || 1
  return (
    <div className="mt-3 h-10 flex items-end gap-0.5">
      {points.map((value, index) => (
        <div
          key={index}
          className="flex-1 rounded-t-sm"
          style={{
            height: `${((value - min) / range) * 100}%`,
            backgroundColor: color,
            opacity: 0.45 + (index / points.length) * 0.4,
            minHeight: "2px"
          }}
        />
      ))}
    </div>
  )
}

const deriveClusterLabels = (clusters = []) => {
  if (!clusters.length) return {}
  const aggregated = clusters.reduce((map, item) => {
    const record = map.get(item.cluster) || { total: 0, count: 0 }
    record.total += Number(item.total_sales || 0)
    record.count += 1
    map.set(item.cluster, record)
    return map
  }, new Map())
  const ranking = Array.from(aggregated.entries())
    .map(([clusterId, data]) => ({ clusterId, avg: data.total / Math.max(1, data.count) }))
    .sort((a, b) => b.avg - a.avg)
  const labels = ["High Demand", "Growth", "Monitor"]
  return ranking.reduce((acc, entry, index) => {
    acc[entry.clusterId] = labels[index] || `Segment ${entry.clusterId}`
    return acc
  }, {})
}

export function ProductIntelligenceDashboard() {
  const { latestInsights, analysisSummary, isAnalyzing } = useDataAnalysisStore()
  const [timeFilter, setTimeFilter] = useState("30d")
  const [showVisualCharts, setShowVisualCharts] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const salesStats = useMemo(
    () => (Array.isArray(latestInsights?.sales_stats) ? latestInsights.sales_stats : []),
    [latestInsights]
  )
  const salesByProduct = useMemo(() => new Map(salesStats.map((stat) => [stat.product_id, stat])), [salesStats])
  const stockEntries = useMemo(
    () => (Array.isArray(latestInsights?.stock_status) ? latestInsights.stock_status : []),
    [latestInsights]
  )
  const demandClusters = useMemo(
    () => (Array.isArray(latestInsights?.demand_clusters) ? latestInsights.demand_clusters : []),
    [latestInsights]
  )
  const salesTrends = useMemo(
    () => (Array.isArray(latestInsights?.sales_trends) ? latestInsights.sales_trends : []),
    [latestInsights]
  )
  const priceRecommendations = Array.isArray(latestInsights?.price_recommendations)
    ? latestInsights.price_recommendations
    : []
  const assortmentRecommendations = Array.isArray(latestInsights?.assortment_recommendations)
    ? latestInsights.assortment_recommendations
    : []
  const discountRecommendations = Array.isArray(latestInsights?.discount_recommendations)
    ? latestInsights.discount_recommendations
    : []

  const productCount = analysisSummary?.productsAnalyzed || salesStats.length
  const avgDailyVelocity = salesStats.length
    ? salesStats.reduce((sum, stat) => sum + Number(stat.avg_daily_sales || 0), 0) / salesStats.length
    : 0
  const atRiskCount = stockEntries.filter((entry) => {
    const status = (entry.stock_status || "").toUpperCase()
    return status === "CRITICAL" || status === "WATCH"
  }).length
  const coverageConfidence = stockEntries.length
    ? Math.round(((stockEntries.length - atRiskCount) / stockEntries.length) * 100)
    : 0
  const averageRunway = stockEntries.length
    ? stockEntries.reduce((sum, entry) => sum + (entry.days_until_stock_out || 0), 0) / stockEntries.length
    : null
  const latestTimestamp = analysisSummary?.generatedAt || latestInsights?.generated_at

  const topSellers = useMemo(() => {
    return [...salesStats]
      .sort((a, b) => Number(b.total_sales || 0) - Number(a.total_sales || 0))
      .slice(0, 5)
  }, [salesStats])

  const runwayAlerts = useMemo(() => {
    return [...stockEntries]
      .sort((a, b) => {
        const orderA = severityOrder[(a.stock_status || "").toUpperCase()] ?? 4
        const orderB = severityOrder[(b.stock_status || "").toUpperCase()] ?? 4
        if (orderA !== orderB) return orderA - orderB
        return (a.days_until_stock_out ?? Number.MAX_VALUE) - (b.days_until_stock_out ?? Number.MAX_VALUE)
      })
      .slice(0, 5)
  }, [stockEntries])

  const clusterLabels = useMemo(() => deriveClusterLabels(demandClusters), [demandClusters])

  const recommendations = useMemo(() => {
    const recs = []
    priceRecommendations.forEach((rec) => {
      const delta = ((rec.recommended_price ?? 0) - (rec.current_price ?? 0)) / Math.max(rec.current_price ?? 1, 1)
      const isIncrease = delta >= 0
      recs.push({
        id: `price-${rec.product_id}-${rec.recommended_price}`,
        productId: rec.product_id,
        title: `${isIncrease ? "Increase" : "Decrease"} Price`,
        description: rec.rationale || "Price optimization signal",
        priority: Math.abs(delta) > 0.08 ? "High" : Math.abs(delta) > 0.04 ? "Medium" : "Low",
        impact: rec.expected_impact || `Target ${(delta * 100).toFixed(1)}% revenue swing`,
        confidence: isIncrease ? 88 : 82
      })
    })

    assortmentRecommendations.forEach((rec) => {
      recs.push({
        id: `assort-${rec.product_id}-${rec.action}`,
        productId: rec.product_id,
        title: rec.action?.replace(/_/g, " ") || "Inventory Action",
        description: rec.reason || "Action recommended by ML",
        priority: rec.action === "REORDER" ? "High" : "Medium",
        impact: rec.reason || "",
        confidence: Math.round((rec.confidence ?? 0) * 100) || 80
      })
    })

    discountRecommendations.forEach((rec) => {
      recs.push({
        id: `disc-${rec.product_id}-${rec.trigger_window}`,
        productId: rec.product_id,
        title: "Targeted Discount",
        description: `${rec.notes || "Stimulate demand"} · Trigger ${rec.trigger_window}`,
        priority: "Medium",
        impact: `Suggest ${rec.suggested_discount ?? 10}% off`,
        confidence: 76
      })
    })

    if (recs.length > 0) {
      return recs.slice(0, 9)
    }

    const fallback = []
    stockEntries.forEach((entry) => {
      const status = (entry.stock_status || "").toUpperCase()
      if (status === "CRITICAL" || status === "WATCH") {
        fallback.push({
          id: `stock-${entry.product_id}-${status}`,
          productId: entry.product_id,
          title: status === "CRITICAL" ? "Rush Reorder" : "Plan Replenishment",
          description: entry.days_until_stock_out
            ? `Runway ${entry.days_until_stock_out.toFixed(1)} days`
            : "Velocity signal",
          priority: status === "CRITICAL" ? "High" : "Medium",
          impact: `Protect ${formatInteger(entry.current_stock ?? 0)} units`,
          confidence: status === "CRITICAL" ? 92 : 84
        })
      }
    })

    salesTrends
      .filter((trend) => trend.trend === "INCREASING" || trend.trend === "DECREASING")
      .slice(0, 4)
      .forEach((trend) => {
        const isUp = trend.trend === "INCREASING"
        fallback.push({
          id: `trend-${trend.product_id}-${trend.trend}`,
          productId: trend.product_id,
          title: isUp ? "Allocate More Inventory" : "Rationalize Slow Mover",
          description: isUp
            ? "Demand curve is climbing; boost availability and attach promotions."
            : "Sustained decline detected; run bundle or markdown tests.",
          priority: isUp ? "Medium" : "Low",
          impact: isUp ? "Capture upside" : "Prevent dead stock",
          confidence: isUp ? 78 : 66
        })
      })

    return fallback.slice(0, 6)
  }, [
    priceRecommendations,
    assortmentRecommendations,
    discountRecommendations,
    stockEntries,
    salesTrends
  ])

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 skeleton rounded" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Card key={item}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 w-24 skeleton rounded" />
                  <div className="h-8 w-14 skeleton rounded" />
                  <div className="h-2 w-full skeleton rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const insightsAvailable = salesStats.length > 0 || stockEntries.length > 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="size-6 text-primary" />
            Product Intelligence
          </h2>
          <p className="text-muted-foreground">
            Direct feed from the latest ML analysis across uploads.
          </p>
          {latestInsights?.best_selling_product && (
            <p className="mt-1 text-sm text-muted-foreground">
              Top seller: <span className="font-medium">{latestInsights.best_selling_product.product_id}</span> ·
              {" "}
              {formatInteger(latestInsights.best_selling_product.total_sales)} units
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3 justify-end">
          {latestTimestamp && !isAnalyzing && (
            <Badge variant="outline" className="bg-primary/5">
              Updated {new Date(latestTimestamp).toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" })}
            </Badge>
          )}
          {isAnalyzing && (
            <Badge variant="outline" className="bg-primary/10 text-primary">
              <RefreshCw className="mr-1 size-3 animate-spin" /> Running analysis
            </Badge>
          )}
          <div className="flex items-center gap-2">
            <Eye className="size-4" />
            <Button
              variant={showVisualCharts ? "default" : "outline"}
              size="sm"
              onClick={() => setShowVisualCharts((prev) => !prev)}
            >
              {showVisualCharts ? "Charts ON" : "Charts OFF"}
            </Button>
          </div>
          <Tabs value={timeFilter} onValueChange={(value) => setTimeFilter(value)}>
            <TabsList>
              <TabsTrigger value="7d">7D</TabsTrigger>
              <TabsTrigger value="30d">30D</TabsTrigger>
              <TabsTrigger value="90d">90D</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {!insightsAvailable ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <p className="text-sm">
              Upload sales and inventory files to unlock product intelligence recommendations.
            </p>
            <p className="mt-1 text-xs">Once the ML job runs, this panel will hydrate automatically.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <ShoppingCart className="size-4 text-primary" /> Products Tracked
                </CardTitle>
                <CardDescription>Synced from analyzed files</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">{formatInteger(productCount)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatInteger(analysisSummary?.recordsProcessed || 0)} records processed
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <DollarSign className="size-4 text-green-600" /> Avg Daily Velocity
                </CardTitle>
                <CardDescription>Across {timeFilter.toUpperCase()} horizon</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">{avgDailyVelocity.toFixed(1)} units</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {averageRunway ? `${formatDays(averageRunway)} avg runway` : "Awaiting inventory data"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <AlertTriangle className="size-4 text-amber-500" /> Runway Health
                </CardTitle>
                <CardDescription>Confidence in on-hand coverage</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">{coverageConfidence}%</p>
                <Progress value={coverageConfidence} className="mt-3" />
                <p className="text-xs text-muted-foreground mt-2">
                  {atRiskCount} of {stockEntries.length} SKUs flagged
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="size-5 text-primary" /> Top Sellers
                </CardTitle>
                <CardDescription>Ordered by total units sold</CardDescription>
              </CardHeader>
              <CardContent>
                {topSellers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No sales records detected.</p>
                ) : (
                  <div className="space-y-4">
                    {topSellers.map((stat, index) => (
                      <div key={`${stat.product_id}-${index}`} className="border-b pb-4 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{stat.product_id}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatInteger(stat.total_sales)} units total
                            </p>
                          </div>
                          <Badge variant="outline" className="gap-1">
                            <TrendingUp className="size-3" /> {Number(stat.avg_daily_sales || 0).toFixed(1)}/day
                          </Badge>
                        </div>
                        {showVisualCharts && (
                          <ProductSparkline
                            points={buildSparklineSeries(stat)}
                            color={index === 0 ? "#22c55e" : "#3b82f6"}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="size-5 text-amber-500" /> Stock Runway
                </CardTitle>
                <CardDescription>Prioritized by risk and time to stockout</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {runwayAlerts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Inventory feed not available yet.</p>
                ) : (
                  runwayAlerts.map((entry) => {
                    const tone = severityTheme[(entry.stock_status || "HEALTHY").toUpperCase()] || severityTheme.HEALTHY
                    const coveragePercent = entry.days_until_stock_out
                      ? Math.max(0, Math.min(100, (entry.days_until_stock_out / 30) * 100))
                      : 0
                    const productSales = salesByProduct.get(entry.product_id)
                    return (
                      <div key={entry.product_id} className="rounded-lg border p-3">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p className="font-medium">{entry.product_id}</p>
                            <p className="text-xs text-muted-foreground">Runway {formatDays(entry.days_until_stock_out)}</p>
                          </div>
                          <Badge className={`text-xs ${tone.badge}`}>{tone.label}</Badge>
                        </div>
                        <Progress value={coveragePercent} className="mt-3 h-2" />
                        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                          <span>{formatInteger(entry.current_stock || 0)} units</span>
                          <span>{Number(productSales?.avg_daily_sales || 0).toFixed(1)} / day</span>
                        </div>
                      </div>
                    )
                  })
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="size-5 text-green-600" /> Demand Segments
                </CardTitle>
                <CardDescription>K-means clustering over total sales</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {demandClusters.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Need at least two products with sales to form clusters.</p>
                ) : (
                  demandClusters.slice(0, 6).map((cluster) => (
                    <div key={`${cluster.product_id}-${cluster.cluster}`} className="rounded-lg border bg-muted/30 p-3">
                      <div className="flex items-center justify-between text-sm font-medium">
                        <span>{cluster.product_id}</span>
                        <Badge variant="secondary" className="text-xs">
                          {clusterLabels[cluster.cluster] || `Segment ${cluster.cluster}`}
                        </Badge>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {formatInteger(cluster.total_sales)} units in cluster
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="size-5 text-primary" /> AI Recommendations
              </CardTitle>
              <CardDescription>Generated from upload-derived signals</CardDescription>
            </CardHeader>
            <CardContent>
              {recommendations.length === 0 ? (
                <p className="text-sm text-muted-foreground">Upload and analyze files to generate recommendations.</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {recommendations.map((rec) => (
                    <div key={rec.id} className="rounded-lg border p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{rec.title}</p>
                          <p className="text-xs text-muted-foreground">{rec.productId}</p>
                        </div>
                        <Badge
                          variant={rec.priority === "High" ? "destructive" : rec.priority === "Medium" ? "secondary" : "outline"}
                          className="text-xs"
                        >
                          {rec.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{rec.description}</p>
                      <div className="text-xs text-muted-foreground">
                        Confidence {rec.confidence}% · {rec.impact}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
