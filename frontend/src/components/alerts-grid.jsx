"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  TrendingDown, 
  Package, 
  Users, 
  DollarSign, 
  AlertCircle, 
  ChevronRight,
  Calendar,
  Target,
  Zap
} from "lucide-react"
import { useEffect, useState } from "react"

const iconMap = {
  customer_churn: TrendingDown,
  inventory_shortage: Package,
  high_value_lead: Users,
  payment_delay: DollarSign,
  pricing_opportunity: DollarSign,
  customer_satisfaction: Users,
}

const severityConfig = {
  critical: {
    color: "text-destructive",
    bg: "bg-destructive/10 border-destructive/20",
    badge: "bg-destructive text-destructive-foreground",
    icon: AlertCircle,
  },
  high: {
    color: "text-destructive",
    bg: "bg-destructive/10 border-destructive/20",
    badge: "bg-destructive text-destructive-foreground",
    icon: AlertCircle,
  },
  medium: {
    color: "text-amber-500",
    bg: "bg-amber-500/10 border-amber-500/20",
    badge: "bg-amber-500 text-white",
    icon: AlertCircle,
  },
  low: {
    color: "text-accent",
    bg: "bg-accent/10 border-accent/20",
    badge: "bg-accent text-white",
    icon: Target,
  },
}

export function AlertsGrid() {
  const [predictions, setPredictions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPredictions() {
      try {
        const response = await fetch('/api/predictions')
        if (!response.ok) {
          console.error('[v0] API error:', response.status)
          setPredictions([])
          return
        }
        const data = await response.json()
        console.log('[v0] All predictions received:', data)
        if (Array.isArray(data)) {
          setPredictions(data)
        } else {
          console.error('[v0] Data is not an array:', data)
          setPredictions([])
        }
      } catch (error) {
        console.error('[v0] Error fetching predictions:', error)
        setPredictions([])
      } finally {
        setLoading(false)
      }
    }

    fetchPredictions()
    const interval = setInterval(fetchPredictions, 20000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Analyzing predictions...
      </div>
    )
  }

  if (predictions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No active predictions. System is monitoring your data.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {predictions.map((prediction) => {
        const Icon = iconMap[prediction.type] || Zap
        const config = severityConfig[prediction.severity] || severityConfig.low
        const SeverityIcon = config.icon
        
        return (
          <Card key={prediction.id} className={`border ${config.bg}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`flex size-12 shrink-0 items-center justify-center rounded-lg bg-background/50`}>
                    <Icon className={`size-6 ${config.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {prediction.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                      <Badge className={`${config.badge} text-xs`}>
                        <SeverityIcon className="mr-1 size-3" />
                        {prediction.severity.toUpperCase()}
                      </Badge>
                    </div>
                    <CardTitle className="mt-2 text-xl">{prediction.title}</CardTitle>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{prediction.description}</p>
              
              {prediction.metrics && typeof prediction.metrics === 'object' && (
                <div className="grid grid-cols-3 gap-4 rounded-lg bg-background/50 p-4">
                  {Object.entries(prediction.metrics).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <p className="text-xs text-muted-foreground">
                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </p>
                      <p className={`mt-1 text-lg font-bold ${config.color}`}>{String(value)}</p>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="rounded-lg bg-background/50 p-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    AI Confidence: {prediction.confidence_score}%
                  </Badge>
                  <span className="text-xs text-muted-foreground">Recommended Action:</span>
                </div>
                <p className="mt-2 text-sm font-medium">{prediction.recommended_action}</p>
              </div>
              
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Created: {new Date(prediction.created_at).toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
