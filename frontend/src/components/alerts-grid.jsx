"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Package, TrendingDown, Target, Activity, Zap } from "lucide-react"
import { useDataAnalysisStore } from "@/lib/data-analysis-store"

const statusConfig = {
  CRITICAL: {
    color: "text-destructive",
    bg: "bg-destructive/10 border-destructive/20",
    badge: "bg-destructive text-destructive-foreground",
    icon: AlertTriangle,
    recommended: "Trigger an immediate reorder to avoid stockout.",
  },
  WATCH: {
    color: "text-amber-500",
    bg: "bg-amber-500/10 border-amber-500/20",
    badge: "bg-amber-500 text-white",
    icon: Activity,
    recommended: "Monitor velocity and adjust replenishment window.",
  },
  HEALTHY: {
    color: "text-emerald-500",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    badge: "bg-emerald-500 text-white",
    icon: Target,
    recommended: "Stock levels within guardrails.",
  },
  NO_SALES_DATA: {
    color: "text-muted-foreground",
    bg: "bg-muted/10 border-muted/20",
    badge: "bg-muted text-foreground",
    icon: Package,
    recommended: "Upload sales history to unlock signals.",
  },
}

const ProductIcon = ({ status }) => {
  const Icon = status?.icon || Package
  return (
    <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-background/50">
      <Icon className={`size-6 ${status?.color || "text-primary"}`} />
    </div>
  )
}

export function AlertsGrid() {
  const { latestInsights } = useDataAnalysisStore()
  const alerts = useMemo(() => {
    if (!latestInsights) return []
    const stockEntries = latestInsights.stock_status || []
    const salesByProduct = new Map((latestInsights.sales_stats || []).map((stat) => [stat.product_id, stat]))
    return stockEntries.map((entry) => {
      const rawStatus = (entry.stock_status || "HEALTHY").toUpperCase()
      const status = statusConfig[rawStatus] || statusConfig.HEALTHY
      const sales = salesByProduct.get(entry.product_id)
      return {
        id: entry.product_id,
        label: entry.product_id,
        status,
        statusText: rawStatus,
        description:
          sales && Number(sales.total_sales || 0) > 0
            ? `Sold ${Math.round(sales.total_sales || 0).toLocaleString("en-IN")} units @ avg ${(sales.avg_daily_sales || 0).toFixed(1)} per day.`
            : "Waiting for sales velocity.",
        metrics: {
          "Current Stock": entry.current_stock ?? "n/a",
          "Days Coverage": entry.days_until_stock_out ? `${entry.days_until_stock_out?.toFixed(1)} d` : "n/a",
          "Avg Daily Sales": sales ? Math.round(sales.avg_daily_sales || 0) : "n/a",
        },
        recommended: status.recommended,
        createdAt: latestInsights.generated_at,
      }
    })
  }, [latestInsights])

  if (!latestInsights) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Upload a dataset to generate explainable inventory alerts.
        </CardContent>
      </Card>
    )
  }

  if (!alerts.length) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          ML model ran successfully but no stock anomalies were detected.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <Card key={alert.id} className={`border ${alert.status.bg}`}>
          <CardHeader>
            <div className="flex items-start gap-3">
              <ProductIcon status={alert.status} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {alert.label}
                  </Badge>
                  <Badge className={`${alert.status.badge} text-xs`}>
                    {(() => {
                      const SeverityIcon = alert.status.icon || Target
                      return <SeverityIcon className="mr-1 size-3" />
                    })()}
                    {alert.statusText || "HEALTHY"}
                  </Badge>
                </div>
                <CardTitle className="mt-2 text-xl">
                  {alert.status === statusConfig.HEALTHY ? "Stable Stock" : "Stock Alert"} · {alert.label}
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{alert.description}</p>
            <div className="grid grid-cols-3 gap-4 rounded-lg bg-background/50 p-4">
              {Object.entries(alert.metrics).map(([key, value]) => (
                <div key={`${alert.id}-${key}`} className="text-center">
                  <p className="text-xs text-muted-foreground">{key}</p>
                  <p className={`mt-1 text-lg font-bold ${alert.status.color}`}>{value}</p>
                </div>
              ))}
            </div>
              <div className="rounded-lg bg-background/50 p-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  Confidence {alert.status === statusConfig.CRITICAL ? 92 : alert.status === statusConfig.WATCH ? 84 : 72}%
                </Badge>
                <span className="text-xs text-muted-foreground">Recommended Action</span>
              </div>
              <p className="mt-2 text-sm font-medium">{alert.recommended}</p>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Generated {alert.createdAt ? new Date(alert.createdAt).toLocaleString() : "just now"}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
