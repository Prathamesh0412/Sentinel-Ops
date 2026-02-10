"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, BarChart3, PackageCheck, TrendingUp } from "lucide-react"
import { useDataStore } from "@/lib/core/data-store"

const statusRank = {
  CRITICAL: 0,
  WATCH: 1,
  HEALTHY: 2,
  NO_SALES_DATA: 3
}

const statusTone = {
  CRITICAL: {
    label: "Critical",
    className: "border-red-500/40 bg-red-500/10 text-red-600"
  },
  WATCH: {
    label: "Watch",
    className: "border-amber-500/40 bg-amber-500/10 text-amber-600"
  },
  HEALTHY: {
    label: "Healthy",
    className: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600"
  },
  NO_SALES_DATA: {
    label: "No Data",
    className: "border-muted bg-muted/30 text-muted-foreground"
  }
}

function formatDays(value) {
  if (value === null || value === undefined) return "—"
  return `${value.toFixed(1)}d`
}

function clusterLabels(clusters = []) {
  if (clusters.length === 0) return {}
  const totals = clusters.reduce((acc, cluster) => {
    const record = acc.get(cluster.cluster) || { total: 0, count: 0 }
    record.total += cluster.total_sales ?? 0
    record.count += 1
    acc.set(cluster.cluster, record)
    return acc
  }, new Map())

  const sorted = Array.from(totals.entries())
    .map(([clusterId, data]) => ({ clusterId, avg: data.total / data.count }))
    .sort((a, b) => b.avg - a.avg)

  const labels = ["High Demand", "Growth", "Monitor"]
  return sorted.reduce((acc, entry, index) => {
    acc[entry.clusterId] = labels[index] || `Segment ${entry.clusterId}`
    return acc
  }, {})
}

export function InventoryInsightsPanel() {
  const { products, orders } = useDataStore()
  const [status, setStatus] = useState("idle")
  const [error, setError] = useState(null)
  const [insights, setInsights] = useState(null)

  const productDirectory = useMemo(() => {
    return products.reduce((acc, product) => {
      acc[product.id] = product.name
      return acc
    }, {})
  }, [products])

  const payload = useMemo(() => {
    const productPayload = products.map((product) => ({
      product_id: product.id,
      product_name: product.name,
      price: Number(product.price) || 0
    }))

    const inventoryPayload = products.map((product) => ({
      product_id: product.id,
      current_stock: Number(product.stock_quantity) || 0,
      reorder_level: Number(product.reorder_threshold) || 0
    }))

    const salesPayload = orders.map((order) => ({
      product_id: order.product_id,
      sale_date: order.created_at,
      quantity_sold: Number(order.quantity ?? order.quantity_sold ?? 1)
    }))

    return {
      products: productPayload,
      inventory: inventoryPayload,
      sales: salesPayload
    }
  }, [products, orders])

  useEffect(() => {
    const controller = new AbortController()

    const fetchInsights = async () => {
      setStatus("loading")
      setError(null)
      try {
        const response = await fetch("/api/inventory-insights", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload),
          signal: controller.signal
        })

        if (!response.ok) {
          const message = (await response.text()) || "Unable to fetch inventory insights"
          throw new Error(message)
        }

        const data = await response.json()
        setInsights(data)
        setStatus("success")
      } catch (err) {
        if (err.name === "AbortError") return
        setError(err.message)
        setStatus("error")
      }
    }

    fetchInsights()
    return () => controller.abort()
  }, [payload])

  const demandLabels = useMemo(() => clusterLabels(insights?.demand_clusters), [insights])

  const stockRows = useMemo(() => {
    if (!insights?.stock_status) return []
    return [...insights.stock_status].sort((a, b) => {
      const rankA = statusRank[a.stock_status] ?? 4
      const rankB = statusRank[b.stock_status] ?? 4
      return rankA - rankB
    })
  }, [insights])

  const bestSellerName = insights?.best_selling_product?.product_id
    ? productDirectory[insights.best_selling_product.product_id] || insights.best_selling_product.product_id
    : "—"

  const generatedAt = insights?.generated_at
    ? new Date(insights.generated_at).toLocaleString()
    : null

  const risingCount = insights?.sales_trends
    ? insights.sales_trends.filter((trend) => trend.trend === "INCREASING").length
    : 0

  return (
    <Card className="col-span-1">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <PackageCheck className="size-5 text-primary" />
              Inventory Intelligence
            </CardTitle>
            <CardDescription className="mt-1">
              ML-powered stock signals refreshed from your live catalog
            </CardDescription>
          </div>
          {generatedAt && (
            <Badge variant="outline" className="bg-primary/5">
              Updated {generatedAt}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {status === "loading" && (
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="rounded-lg border p-4">
                <div className="skeleton h-4 w-1/2" />
                <div className="mt-2 skeleton h-3 w-2/3" />
              </div>
            ))}
          </div>
        )}

        {status === "error" && (
          <div className="rounded-lg border border-red-500/30 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-semibold">Unable to load insights</p>
            <p className="mt-1 text-red-600/80">{error}</p>
          </div>
        )}

        {status === "success" && insights && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border bg-card/50 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Best Seller</p>
                <p className="mt-2 text-lg font-semibold leading-tight">{bestSellerName}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {Math.round(insights.best_selling_product?.total_sales ?? 0)} units sold
                </p>
              </div>
              <div className="rounded-xl border bg-card/50 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Signals</p>
                <p className="mt-2 text-lg font-semibold">{stockRows.length}</p>
                <p className="mt-1 text-sm text-muted-foreground">Tracked SKUs</p>
              </div>
              <div className="rounded-xl border bg-card/50 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Trend Momentum</p>
                <p className="mt-2 text-lg font-semibold">{risingCount} rising</p>
                <p className="mt-1 text-sm text-muted-foreground">based on last cycle</p>
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <AlertTriangle className="size-4 text-amber-500" />
                  Stock Health Alerts
                </div>
                <span className="text-xs text-muted-foreground">Next 30-day runway</span>
              </div>
              {stockRows.length === 0 ? (
                <p className="text-sm text-muted-foreground">No inventory signals detected.</p>
              ) : (
                <div className="space-y-3">
                  {stockRows.map((stock) => {
                    const tone = statusTone[stock.stock_status] || statusTone.HEALTHY
                    const percent = Math.max(0, Math.min(100, ((stock.days_until_stock_out ?? 30) / 30) * 100))
                    return (
                      <div key={stock.product_id} className="rounded-lg border p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="font-medium">{productDirectory[stock.product_id] || stock.product_id}</p>
                            <p className="text-sm text-muted-foreground">{formatDays(stock.days_until_stock_out)} horizon</p>
                          </div>
                          <Badge className={tone.className}>{tone.label}</Badge>
                        </div>
                        <Progress value={percent} className="mt-3 h-2" />
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <TrendingUp className="size-4 text-primary" />
                Demand Signals
              </div>
              {(!insights.demand_clusters || insights.demand_clusters.length === 0) ? (
                <p className="text-sm text-muted-foreground">Waiting for more sales data...</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {insights.demand_clusters.map((cluster) => (
                    <div key={`${cluster.product_id}-${cluster.cluster}`} className="rounded-lg border bg-muted/20 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold">{productDirectory[cluster.product_id] || cluster.product_id}</p>
                          <p className="text-xs text-muted-foreground">{demandLabels[cluster.cluster] || `Segment ${cluster.cluster}`}</p>
                        </div>
                        <BarChart3 className="size-4 text-primary" />
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">{Math.round(cluster.total_sales)} units / cycle</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {status === "idle" && (
          <p className="text-sm text-muted-foreground">Initializing insight engine...</p>
        )}
      </CardContent>
    </Card>
  )
}
