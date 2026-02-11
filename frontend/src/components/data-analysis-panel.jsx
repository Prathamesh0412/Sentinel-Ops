"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Upload, FileText, Mail, DollarSign, Star, BarChart3, Database, CheckCircle2, AlertCircle, Trash2 } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { useDataAnalysisStore } from "@/lib/data-analysis-store"
import { useToast } from "@/hooks/use-toast"

const iconMap = {
  customer_database: Database,
  sales_records: BarChart3,
  email_campaigns: Mail,
  invoice: DollarSign,
  review: Star,
  sales_log: BarChart3,
}

const statusConfig = {
  processing: {
    label: 'Processing',
    className: 'status-medium',
    icon: AlertCircle,
  },
  completed: {
    label: 'Completed',
    className: 'status-success', 
    icon: CheckCircle2,
  },
  error: {
    label: 'Error',
    className: 'status-high',
    icon: AlertCircle,
  }
}

export function DataAnalysisPanel() {
  const { 
    dataSources,
    fetchDataSources,
    isLoadingSources,
    latestInsights,
    analysisSummary,
    clearAnalysisHistory,
    fetchBaselineInsights
  } = useDataAnalysisStore()
  const [mounted, setMounted] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setMounted(true)
    fetchDataSources()
    fetchBaselineInsights()
  }, [fetchDataSources, fetchBaselineInsights])

  const bestProduct = latestInsights?.best_selling_product
  const stockAlerts = useMemo(() => (latestInsights?.stock_status ?? []).slice(0, 3), [latestInsights])
  const salesStats = useMemo(() => (latestInsights?.sales_stats ?? []).slice(0, 3), [latestInsights])
  const hasHistory = Boolean(latestInsights || analysisSummary || dataSources.length)

  const handleClearHistory = () => {
    if (!hasHistory) return
    const confirmed = window.confirm('Clear analysis history? This removes stored insights until you upload again.')
    if (!confirmed) return
    clearAnalysisHistory()
    toast({
      title: "Analysis history cleared",
      description: "Upload new files to regenerate ML insights.",
    })
  }

  const formatLastSync = (date) => {
    if (!date) return 'Never'
    const now = new Date()
    const lastSync = new Date(date)
    const diffInMinutes = Math.floor((now.getTime() - lastSync.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`
    return lastSync.toLocaleDateString()
  }

  return (
    <Card className="col-span-1">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-5 text-primary" />
              Data Analysis Results
            </CardTitle>
            <CardDescription className="mt-1">
              Processed data sources and insights
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleClearHistory}
            disabled={!hasHistory}
          >
            <Trash2 className="size-4" />
            Clear history
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!mounted ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 border rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="skeleton size-12 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-5 w-48 rounded" />
                    <div className="skeleton h-4 w-24 rounded" />
                    <div className="skeleton h-2 w-full rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {latestInsights ? (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-lg border p-4">
                    <p className="text-xs text-muted-foreground">Best Selling Product</p>
                    <p className="text-lg font-semibold mt-1">
                      {bestProduct?.product_id || 'N/A'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {bestProduct ? `${Math.round(bestProduct.total_sales)} units` : 'Awaiting data'}
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-xs text-muted-foreground">Records Processed</p>
                    <p className="text-lg font-semibold mt-1">
                      {(analysisSummary?.recordsProcessed || 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">Across {analysisSummary?.filesProcessed || 0} file(s)</p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-xs text-muted-foreground">Generated</p>
                    <p className="text-lg font-semibold mt-1">
                      {analysisSummary?.generatedAt ? formatLastSync(analysisSummary.generatedAt) : 'Just now'}
                    </p>
                    <p className="text-sm text-muted-foreground">{analysisSummary?.productsAnalyzed || 0} products analyzed</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border p-4">
                    <h4 className="text-sm font-semibold mb-3">Stock Health Alerts</h4>
                    {stockAlerts.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No active stock alerts.</p>
                    ) : (
                      <div className="space-y-2">
                        {stockAlerts.map((item) => (
                          <div key={item.product_id} className="flex items-center justify-between text-sm">
                            <span className="font-medium">{item.product_id}</span>
                            <span className={`text-xs ${item.stock_status === 'CRITICAL' ? 'text-red-500' : item.stock_status === 'WATCH' ? 'text-amber-500' : 'text-green-500'}`}>
                              {item.stock_status} ({item.days_until_stock_out ? `${item.days_until_stock_out.toFixed(1)}d` : 'n/a'})
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="rounded-lg border p-4">
                    <h4 className="text-sm font-semibold mb-3">Sales Momentum</h4>
                    {salesStats.length === 0 ? (
                      <p className="text-xs text-muted-foreground">Upload data to unlock sales stats.</p>
                    ) : (
                      <div className="space-y-2">
                        {salesStats.map((stat) => (
                          <div key={stat.product_id} className="flex items-center justify-between text-sm">
                            <span className="font-medium">{stat.product_id}</span>
                            <span className="text-muted-foreground">{Math.round(stat.total_sales)} units</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-muted-foreground">
                <Database className="size-12 mx-auto mb-4 opacity-50" />
                <p>Upload and analyze a CSV file to generate ML-driven insights.</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">Processed Data Sources</h4>
                <Badge variant="outline" className="text-xs">
                  {dataSources.length} connected
                </Badge>
              </div>
              {isLoadingSources ? (
                <div className="space-y-3">
                  {[1, 2].map((index) => (
                    <div key={`skeleton-ds-${index}`} className="p-4 border rounded-lg">
                      <div className="flex items-start gap-4">
                        <div className="skeleton size-10 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <div className="skeleton h-4 w-32" />
                          <div className="skeleton h-3 w-24" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : dataSources.length === 0 ? (
                <p className="text-xs text-muted-foreground">No datasets synced yet.</p>
              ) : (
                <div className="space-y-4">
                  {dataSources.map((source) => {
                    const Icon = iconMap[source.type] || FileText
                    const statusInfo = statusConfig[source.status]?.label ? statusConfig[source.status] : statusConfig.completed
                    const StatusIcon = statusInfo.icon
                    return (
                      <div
                        key={source.id}
                        className="group flex items-start gap-4 rounded-lg border border-border bg-card p-4 transition-all duration-200 hover:shadow-md"
                      >
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <Icon className="size-6 text-primary" />
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold">{source.name}</h4>
                              <p className="text-xs text-muted-foreground capitalize">
                                {(source.type || '').replace(/_/g, ' ') || 'uploaded dataset'}
                              </p>
                            </div>
                            <Badge className={`${statusInfo.className} gap-1`}>
                              <StatusIcon className="size-3" />
                              {statusInfo.label}
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-medium">{Math.round(source.progress || 0)}%</span>
                            </div>
                            <Progress value={source.progress || 0} className="h-2" />
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Last sync: {formatLastSync(source.lastUpdated)}</span>
                            {source.status === 'processing' && (
                              <span className="flex items-center gap-1 text-primary">
                                <AlertCircle className="size-3 animate-pulse" />
                                Processing...
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
