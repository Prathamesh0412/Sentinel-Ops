"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Zap, TrendingUp, Activity, Target } from "lucide-react"

const modelPerformance = [
  { name: "Churn Prediction", accuracy: 94, predictions: 1234 },
  { name: "Lead Scoring", accuracy: 91, predictions: 856 },
  { name: "Inventory Forecast", accuracy: 87, predictions: 543 },
  { name: "Revenue Projection", accuracy: 88, predictions: 421 },
]

const recentActivity = [
  { event: "Customer churn model updated", time: "5 min ago" },
  { event: "15 new predictions generated", time: "12 min ago" },
  { event: "Lead scoring model trained", time: "1 hour ago" },
  { event: "Weekly analysis completed", time: "3 hours ago" },
]

export function PredictionDetailsCard() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="size-5 text-primary" />
            Model Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {modelPerformance.map((model) => (
            <div key={model.name} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{model.name}</span>
                <Badge variant="outline">{model.accuracy}%</Badge>
              </div>
              <Progress value={model.accuracy} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {model.predictions.toLocaleString()} predictions made
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="size-5 text-primary" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-start gap-3 pb-3 last:pb-0 border-b last:border-0">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Zap className="size-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{activity.event}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="size-5 text-primary" />
            This Month
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Predictions</span>
            <span className="text-2xl font-bold">1,429</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Actions Executed</span>
            <span className="text-2xl font-bold">856</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Avg Confidence</span>
            <span className="text-2xl font-bold">91%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Time Saved</span>
            <span className="text-2xl font-bold">127h</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
