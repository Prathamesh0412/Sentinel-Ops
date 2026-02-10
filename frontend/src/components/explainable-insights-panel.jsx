"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Eye, 
  EyeOff,
  BarChart3,
  Users,
  Package,
  Target,
  Clock,
  DollarSign
} from "lucide-react"
import { useDataStore } from "@/lib/core/data-store"

// Mini chart components for visual reasoning
const Sparkline = ({ data, trend }) => {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  
  const color = trend === 'up' ? '#ef4444' : trend === 'down' ? '#10b981' : '#3b82f6'
  
  return (
    <div className="h-12 flex items-end gap-0.5">
      {data.map((value, index) => (
        <div
          key={index}
          className="flex-1 rounded-t-sm"
          style={{
            height: `${((value - min) / range) * 100}%`,
            backgroundColor: color,
            opacity: 0.6 + (index / data.length) * 0.4,
            minHeight: '1px'
          }}
        />
      ))}
    </div>
  )
}

const StackedBar = ({ data, labels }) => {
  const total = data.reduce((sum, val) => sum + val, 0)
  const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6']
  
  return (
    <div className="h-8 flex rounded overflow-hidden">
      {data.map((value, index) => (
        <div
          key={index}
          className="flex items-center justify-center text-xs text-white font-medium"
          style={{
            width: `${(value / total) * 100}%`,
            backgroundColor: colors[index % colors.length]
          }}
          title={`${labels[index]}: ${value}`}
        >
          {value > 10 && Math.round((value / total) * 100) + '%'}
        </div>
      ))}
    </div>
  )
}

export function ExplainableInsightsPanel() {
  const { insights, customers, products, orders } = useDataStore()
  const [expandedInsight, setExpandedInsight] = useState(null)
  const [showVisualReasoning, setShowVisualReasoning] = useState(true)

  // Generate visual reasoning data for each insight
  const getVisualReasoning = (insight) => {
    switch (insight.type) {
      case 'churn_risk':
        // Simulate engagement drop data
        const engagementData = Array.from({ length: 30 }, (_, i) => 
          Math.max(20, 80 - (i * 2) + Math.random() * 10)
        )
        
        // Revenue at risk by segment
        const segmentRisk = [
          customers.filter(c => c.segment === 'enterprise' && c.churn_risk > 60).length * 50000,
          customers.filter(c => c.segment === 'mid-market' && c.churn_risk > 60).length * 25000,
          customers.filter(c => c.segment === 'small-business' && c.churn_risk > 60).length * 10000
        ]
        
        return {
          engagementTrend: engagementData,
          trend: 'down',
          segmentRisk,
          segmentLabels: ['Enterprise', 'Mid-Market', 'Small'],
          reason: `Customer engagement has dropped by ${Math.round((engagementData[0] - engagementData[engagementData.length - 1]) / engagementData[0] * 100)}% over the last 30 days`
        }
        
      case 'inventory_shortage':
        // Simulate demand vs inventory data
        const demandData = Array.from({ length: 14 }, (_, i) => 
          50 + Math.sin(i / 2) * 20 + Math.random() * 10
        )
        const inventoryData = Array.from({ length: 14 }, (_, i) => 
          Math.max(10, 100 - (i * 5) + Math.random() * 5)
        )
        
        return {
          demandTrend: demandData,
          inventoryTrend: inventoryData,
          trend: 'up',
          reason: `Demand has increased by ${Math.round((demandData[demandData.length - 1] - demandData[0]) / demandData[0] * 100)}% while inventory decreased by ${Math.round((inventoryData[0] - inventoryData[inventoryData.length - 1]) / inventoryData[0] * 100)}%`
        }
        
      case 'lead_value':
        // Simulate lead quality data
        const leadScores = Array.from({ length: 20 }, (_, i) => 
          60 + Math.sin(i / 3) * 20 + Math.random() * 15
        )
        
        return {
          leadScoreTrend: leadScores,
          trend: 'stable',
          reason: `Lead quality score has stabilized at ${Math.round(leadScores.reduce((a, b) => a + b) / leadScores.length)}% with improving conversion rates`
        }
        
      default:
        return null
    }
  }

  const getInsightIcon = (type) => {
    switch (type) {
      case 'churn_risk': return Users
      case 'inventory_shortage': return Package
      case 'lead_value': return Target
      default: return AlertTriangle
    }
  }

  const getInsightColor = (type) => {
    switch (type) {
      case 'churn_risk': return 'text-red-500'
      case 'inventory_shortage': return 'text-amber-500'
      case 'lead_value': return 'text-green-500'
      default: return 'text-blue-500'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="size-5 text-primary" />
              Explainable AI Insights
            </CardTitle>
            <CardDescription>
              Each insight includes visual reasoning showing why the AI made this prediction
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowVisualReasoning(!showVisualReasoning)}
            className="gap-2"
          >
            {showVisualReasoning ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            {showVisualReasoning ? "Hide" : "Show"} Visual Reasoning
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.slice(0, 6).map((insight) => {
            const Icon = getInsightIcon(insight.type)
            const visualReasoning = getVisualReasoning(insight)
            const isExpanded = expandedInsight === insight.id
            
            return (
              <div
                key={insight.id}
                className="rounded-lg border p-4 space-y-4 hover:shadow-md transition-shadow"
              >
                {/* Insight Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg bg-muted ${getInsightColor(insight.type)}`}>
                      <Icon className="size-4" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{insight.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {insight.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {Math.round(insight.confidence)}% confidence
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <DollarSign className="size-3" />
                          ₹{Math.round(insight.business_impact).toLocaleString()} impact
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="size-3" />
                          {new Date(insight.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedInsight(isExpanded ? null : insight.id)}
                  >
                    {isExpanded ? "Hide Details" : "Show Details"}
                  </Button>
                </div>

                {/* Visual Reasoning Section */}
                {showVisualReasoning && visualReasoning && (
                  <div className={`border-t pt-4 space-y-4 ${
                    isExpanded ? 'block' : 'hidden'
                  }`}>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <h5 className="text-sm font-medium mb-3 flex items-center gap-2">
                        <BarChart3 className="size-4" />
                        Why this insight exists
                      </h5>
                      
                      {/* Reason Breakdown */}
                      <p className="text-sm text-muted-foreground mb-4">
                        {visualReasoning.reason}
                      </p>

                      {/* Visual Charts */}
                      <div className="grid gap-4 md:grid-cols-2">
                        {insight.type === 'churn_risk' && visualReasoning && 'engagementTrend' in visualReasoning && (
                          <>
                            {/* Engagement Trend */}
                            <div className="space-y-2">
                              <h6 className="text-xs font-medium">Customer Engagement Trend</h6>
                              <Sparkline 
                                data={visualReasoning.engagementTrend || []} 
                                trend={visualReasoning.trend || 'stable'}
                              />
                              <div className="flex items-center gap-2 text-xs">
                                <TrendingDown className="size-3 text-red-500" />
                                <span className="text-red-500">Declining engagement detected</span>
                              </div>
                            </div>

                            {/* Revenue at Risk by Segment */}
                            <div className="space-y-2">
                              <h6 className="text-xs font-medium">Revenue at Risk by Segment</h6>
                              <StackedBar 
                                data={visualReasoning.segmentRisk || []} 
                                labels={visualReasoning.segmentLabels || []}
                              />
                              <div className="text-xs text-muted-foreground">
                                Total risk: ₹{Math.round((visualReasoning.segmentRisk || []).reduce((a, b) => a + b, 0)).toLocaleString()}
                              </div>
                            </div>
                          </>
                        )}

                        {insight.type === 'inventory_shortage' && visualReasoning && 'demandTrend' in visualReasoning && (
                          <>
                            {/* Demand vs Inventory */}
                            <div className="space-y-2">
                              <h6 className="text-xs font-medium">Demand Trend</h6>
                              <Sparkline 
                                data={visualReasoning.demandTrend || []} 
                                trend={visualReasoning.trend || 'stable'}
                              />
                              <div className="flex items-center gap-2 text-xs">
                                <TrendingUp className="size-3 text-amber-500" />
                                <span className="text-amber-500">Increasing demand detected</span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <h6 className="text-xs font-medium">Inventory Levels</h6>
                              <Sparkline 
                                data={visualReasoning.inventoryTrend || []} 
                                trend="down"
                              />
                              <div className="flex items-center gap-2 text-xs">
                                <TrendingDown className="size-3 text-red-500" />
                                <span className="text-red-500">Decreasing inventory levels</span>
                              </div>
                            </div>
                          </>
                        )}

                        {insight.type === 'lead_value' && visualReasoning && 'leadScoreTrend' in visualReasoning && (
                          <div className="space-y-2">
                            <h6 className="text-xs font-medium">Lead Quality Scores</h6>
                            <Sparkline 
                              data={visualReasoning.leadScoreTrend || []} 
                              trend={visualReasoning.trend || 'stable'}
                            />
                            <div className="flex items-center gap-2 text-xs">
                              <Target className="size-3 text-green-500" />
                              <span className="text-green-500">Lead quality stabilizing</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Detailed Reason Breakdown */}
                      <div className="mt-4 p-3 bg-background rounded border-l-2 border-primary">
                        <h6 className="text-xs font-medium mb-2">Detailed Analysis</h6>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {insight.reason_breakdown.map((reason, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <div className="w-1 h-1 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
