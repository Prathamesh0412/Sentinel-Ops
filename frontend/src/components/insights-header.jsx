"use client"

import { useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Zap, Database, Activity, CalendarDays } from "lucide-react"
import { useDataAnalysisStore } from "@/lib/data-analysis-store"

const formatNumber = (value) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value || 0)

export function InsightsHeader() {
  const { analysisSummary, latestInsights } = useDataAnalysisStore()
  const stockStatuses = latestInsights?.stock_status || []
  const healthyCount = stockStatuses.filter((entry) => (entry.stock_status || "").toUpperCase() === "HEALTHY").length
  const confidence = stockStatuses.length ? Math.round((healthyCount / stockStatuses.length) * 100) : 0
  const bestProduct = latestInsights?.best_selling_product
  const generatedAt = analysisSummary?.generatedAt || latestInsights?.generated_at

  const summaryChips = useMemo(() => ([
    {
      label: "Products Analyzed",
      value: formatNumber(analysisSummary?.productsAnalyzed || stockStatuses.length),
      icon: Database,
    },
    {
      label: "Records Processed",
      value: formatNumber(analysisSummary?.recordsProcessed),
      icon: Activity,
    },
    {
      label: "Last Generated",
      value: generatedAt ? new Date(generatedAt).toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" }) : "Awaiting upload",
      icon: CalendarDays,
    },
  ]), [analysisSummary, generatedAt, stockStatuses.length])

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-balance">
          AI Insights & Predictions
        </h1>
        <p className="mt-2 text-lg text-muted-foreground text-pretty">
          Real-time analysis directly from the latest ML upload
        </p>
        {bestProduct && (
          <p className="mt-2 text-sm text-muted-foreground">
            Highest velocity: <span className="font-semibold">{bestProduct.product_id}</span> • {Math.round(bestProduct.total_sales || 0).toLocaleString("en-IN")}&nbsp;units sold
          </p>
        )}
      </div>
      <div className="flex flex-col items-start gap-3 md:items-end">
        <Badge variant="outline" className="bg-primary/10">
          <Zap className="mr-1 size-3" />
          {confidence || 0}% Stock Confidence
        </Badge>
        <div className="flex flex-wrap gap-3">
          {summaryChips.map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground">
              <Icon className="size-3" />
              <span className="font-medium text-foreground">{value}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
