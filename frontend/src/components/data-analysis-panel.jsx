"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Upload, FileText, Mail, DollarSign, Star, BarChart3, Database, CheckCircle2, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { useDataAnalysisStore } from "@/lib/data-analysis-store"

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
    simulateRealTimeUpdates 
  } = useDataAnalysisStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const cleanup = simulateRealTimeUpdates()
    return cleanup
  }, [])

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
        <div>
          <CardTitle className="flex items-center gap-2">
            <FileText className="size-5 text-primary" />
            Data Analysis Results
          </CardTitle>
          <CardDescription className="mt-1">
            Processed data sources and insights
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
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
        ) : dataSources.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            <Database className="size-12 mx-auto mb-4 opacity-50" />
            <p>No processed data sources yet. Upload and analyze files to see results here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {dataSources.map((source) => {
              const Icon = iconMap[source.type] || FileText
              const statusInfo = statusConfig[source.status]
              const StatusIcon = statusInfo.icon
              
              return (
                <div
                  key={source.id}
                  className="group flex items-start gap-4 rounded-lg border border-border bg-card p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                    <Icon className="size-6 text-primary" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{source.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {source.records_count.toLocaleString()} records
                        </p>
                      </div>
                      <Badge className={`${statusInfo.className} gap-1`}>
                        <StatusIcon className="size-3" />
                        {statusInfo.label}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {source.status === 'processing' ? 'Processing' : 'Completed'}
                        </span>
                        <span className="font-medium">{Math.round(source.progress)}%</span>
                      </div>
                      <div className="relative">
                        <Progress 
                          value={source.progress} 
                          className="h-2 transition-all duration-500"
                        />
                        {source.status === 'processing' && (
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-pulse" />
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Last sync: {formatLastSync(source.last_processed)}</span>
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
      </CardContent>
    </Card>
  )
}
