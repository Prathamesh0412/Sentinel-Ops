"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Zap, AlertTriangle, TrendingDown, Package, Users, ChevronRight, DollarSign, Clock, Target, AlertCircle, FileText } from "lucide-react"
import { useEffect, useState } from "react"
import { useDataStore } from "@/lib/core/data-store"
import { useDataAnalysisStore } from "@/lib/data-analysis-store"

const iconMap = {
  churn_risk: TrendingDown,
  inventory_shortage: Package,
  lead_insight: Users,
  payment_delay: DollarSign,
  pricing_opportunity: Target,
  customer_satisfaction: Users,
}

const severityColors = {
  High: "text-red-500 bg-red-500/10 border-red-500/20",
  Medium: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  Low: "text-blue-500 bg-blue-500/10 border-blue-500/20",
}

export function PredictionsPanel() {
  const { insights, generateInsights } = useDataStore()
  const { uploadedFiles } = useDataAnalysisStore()
  const [filter, setFilter] = useState('All')
  const [expandedId, setExpandedId] = useState(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Check if any files have been analyzed
  const hasAnalyzedFiles = uploadedFiles.some(file => file.status === 'completed')
  const hasUploadedFiles = uploadedFiles.length > 0
  
  // Combine insights with file-based predictions
  const allPredictions = [
    ...insights.map(insight => ({
      ...insight,
      name: insight.title,
      prediction_type: insight.type,
      impact: `₹${insight.business_impact.toLocaleString()}`,
      recommendation: insight.reason_breakdown.join(', '),
      source_file_id: undefined,
      source_file_name: undefined
    }))
  ]
  
  // Filter predictions based on severity
  const filteredPredictions = allPredictions.filter((prediction) => {
    const confidence = prediction.confidence
    let severity
    if (confidence >= 80) severity = 'High'
    else if (confidence >= 60) severity = 'Medium'
    else severity = 'Low'
    
    return filter === 'All' || severity === filter
  }).slice(0, 6)

  // Calculate confidence score programmatically
  const calculateConfidence = (prediction) => {
    // Apply decay factor to confidence over time
    const ageInHours = (Date.now() - new Date(prediction.created_at).getTime()) / (1000 * 60 * 60)
    const ageDecay = Math.max(0.7, 1 - (ageInHours / 168)) // Decay over a week
    
    return Math.min(99, Math.round(prediction.confidence * ageDecay * (prediction.decay_factor || 1)))
  }

  const toggleExpanded = (id) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const generateNewInsight = () => {
    generateInsights()
  }

  const avgConfidence = allPredictions.length > 0
    ? Math.round(allPredictions.reduce((sum, prediction) => sum + calculateConfidence(prediction), 0) / allPredictions.length)
    : 0

  // Determine what message to show
  const getEmptyStateMessage = () => {
    if (!hasUploadedFiles) {
      return "Upload and analyze a file to generate AI predictions."
    } else if (!hasAnalyzedFiles) {
      return "File uploaded. Click 'Analyze' to generate AI predictions."
    } else {
      return "File analyzed. No significant patterns detected."
    }
  }

  return (
    <Card className="col-span-1">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="size-5 text-primary" />
              AI Predictions
            </CardTitle>
            <CardDescription className="mt-1">
              Proactive business intelligence and forecasting
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-primary/5">
            <AlertTriangle className="mr-1 size-3" />
            {allPredictions.length} Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {!mounted ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Analyzing data...
          </div>
        ) : filteredPredictions.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            {getEmptyStateMessage()}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Filter controls */}
            <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Filter by severity:</span>
                <Select value={filter} onValueChange={(value) => setFilter(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All ({allPredictions.length})</SelectItem>
                    <SelectItem value="High">High ({allPredictions.filter(p => p.confidence >= 80).length})</SelectItem>
                    <SelectItem value="Medium">Medium ({allPredictions.filter(p => p.confidence >= 60 && p.confidence < 80).length})</SelectItem>
                    <SelectItem value="Low">Low ({allPredictions.filter(p => p.confidence < 60).length})</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                size="sm" 
                onClick={generateNewInsight}
                className="btn-primary"
              >
                <Zap className="mr-1 size-3" />
                Generate New
              </Button>
            </div>

            {/* Predictions list */}
            {filteredPredictions.map((prediction) => {
              const Icon = iconMap[prediction.prediction_type] || Zap
              const calculatedConfidence = calculateConfidence(prediction)
              const isExpanded = expandedId === prediction.id
              
              return (
                <div
                  key={prediction.id}
                  className={`rounded-lg border p-4 transition-all duration-200 cursor-pointer ${
                    prediction.confidence >= 80 ? severityColors.High : 
                    prediction.confidence >= 60 ? severityColors.Medium : 
                    severityColors.Low
                  } ${
                    isExpanded ? 'ring-2 ring-primary/20 shadow-md' : 'shadow-sm hover:shadow-md'
                  }`}
                  onClick={() => toggleExpanded(prediction.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-background/50">
                      <Icon className="size-5" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{prediction.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {calculatedConfidence}% confident
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm opacity-90">
                          {prediction.description}
                        </p>
                        {prediction.source_file_name && (
                          <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                            <FileText className="size-3" />
                            Source: {prediction.source_file_name}
                          </p>
                        )}
                      </div>
                      
                      {isExpanded && (
                        <div className="mt-3 space-y-3 border-t border-border/50 pt-3 text-sm">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-xs font-medium text-muted-foreground">Business Impact</span>
                              <p className="font-medium">{prediction.impact}</p>
                            </div>
                            <div>
                              <span className="text-xs font-medium text-muted-foreground">Action Type</span>
                              <p className="font-medium capitalize">{prediction.prediction_type.replace('_', ' ')}</p>
                            </div>
                          </div>
                          <div>
                            <span className="text-xs font-medium text-muted-foreground">Recommendation</span>
                            <p className="mt-0.5">{prediction.recommendation}</p>
                          </div>
                          <Button size="sm" className="w-full h-8 mt-1" variant="outline">
                            View Analysis Details <ChevronRight className="ml-1 size-3" />
                          </Button>
                        </div>
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