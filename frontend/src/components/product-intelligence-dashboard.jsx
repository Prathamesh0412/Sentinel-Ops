"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  DollarSign, 
  Target, 
  AlertTriangle,
  BarChart3,
  ShoppingCart,
  Zap,
  Eye,
  BarChart,
  LineChart
} from "lucide-react"
import { useDataStore } from "@/lib/core/data-store"
import { IntelligenceEngine } from "@/lib/core/intelligence-engine"

export function ProductIntelligenceDashboard() {
  const { 
    products, 
    orders, 
    actions, 
    generateActions,
    executeAction 
  } = useDataStore()
  
  const [timeFilter, setTimeFilter] = useState('30d')
  const [mounted, setMounted] = useState(false)
  const [showVisualCharts, setShowVisualCharts] = useState(true)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Mini chart components for product visualization
  const ProductSparkline = ({ data, color = "#3b82f6" }) => {
    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min || 1
    
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

  const DemandInventoryChart = ({ product }) => {
    // Generate simulated demand vs inventory data
    const demandData = Array.from({ length: 14 }, (_, i) => 
      Math.max(5, product.metrics.weeklyDemand + Math.sin(i / 2) * 10 + Math.random() * 5)
    )
    const inventoryData = Array.from({ length: 14 }, (_, i) => 
      Math.max(5, product.stock_quantity - (i * 2) + Math.random() * 3)
    )
    
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h6 className="text-xs font-medium text-blue-600">Demand Trend</h6>
            <ProductSparkline data={demandData} color="#3b82f6" />
          </div>
          <div>
            <h6 className="text-xs font-medium text-green-600">Inventory Level</h6>
            <ProductSparkline data={inventoryData} color="#10b981" />
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          Stockout in {Math.max(1, Math.round(product.stock_quantity / product.metrics.weeklyDemand))} weeks
        </div>
      </div>
    )
  }

  // Calculate product metrics
  const getProductMetrics = (product) => {
    const productOrders = orders.filter(order => order.product_id === product.id)
    const totalSold = productOrders.reduce((sum, order) => sum + order.quantity, 0)
    const totalRevenue = productOrders.reduce((sum, order) => sum + order.revenue, 0)
    const totalProfit = productOrders.reduce((sum, order) => sum + order.profit, 0)
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : product.profit_margin
    
    // Calculate demand vs stock gap
    const weeklyDemand = productOrders.reduce((sum, order) => sum + order.quantity, 0) / 4
    const stockWeeks = product.stock_quantity / weeklyDemand
    const demandGap = Math.max(0, weeklyDemand - product.stock_quantity / 4)
    
    return {
      totalSold,
      totalRevenue,
      totalProfit,
      profitMargin,
      weeklyDemand,
      stockWeeks,
      demandGap,
      stockoutRisk: stockWeeks < 2 ? 100 - (stockWeeks * 50) : 0
    }
  }

  // Sort products by different metrics
  const mostBoughtProducts = [...products]
    .map((product, index) => ({
      ...product,
      metrics: getProductMetrics(product),
      uniqueKey: `${product.id}_${index}` // Ensure unique key
    }))
    .sort((a, b) => b.metrics.totalSold - a.metrics.totalSold)
    .slice(0, 5)

  const mostDemandedProducts = [...products]
    .map((product, index) => ({
      ...product,
      metrics: getProductMetrics(product),
      uniqueKey: `${product.id}_${index}` // Ensure unique key
    }))
    .sort((a, b) => b.metrics.weeklyDemand - a.metrics.weeklyDemand)
    .slice(0, 5)

  const mostProfitableProducts = [...products]
    .map((product, index) => ({
      ...product,
      metrics: getProductMetrics(product),
      uniqueKey: `${product.id}_${index}` // Ensure unique key
    }))
    .sort((a, b) => b.metrics.totalProfit - a.metrics.totalProfit)
    .slice(0, 5)

  const generateProductRecommendations = (product) => {
    const metrics = getProductMetrics(product)
    const recommendations = []

    if (metrics.stockoutRisk > 60) {
      recommendations.push({
        type: 'inventory',
        title: 'Increase Inventory',
        description: `Order ${Math.ceil(metrics.demandGap * 2)} units to prevent stockout`,
        impact: metrics.weeklyDemand * product.price * 4,
        priority: 'High'
      })
    }

    if (metrics.profitMargin < 30) {
      recommendations.push({
        type: 'pricing',
        title: 'Price Adjustment',
        description: 'Consider price increase or cost reduction',
        impact: metrics.totalRevenue * 0.1,
        priority: 'Medium'
      })
    }

    if (metrics.weeklyDemand > product.sales_velocity * 1.5) {
      recommendations.push({
        type: 'promotion',
        title: 'Run Promotion',
        description: 'Capitalize on increased demand',
        impact: metrics.weeklyDemand * product.price * 0.2,
        priority: 'Medium'
      })
    }

    return recommendations
  }

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 skeleton rounded" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 w-32 skeleton rounded" />
                  <div className="h-8 w-20 skeleton rounded" />
                  <div className="h-2 w-full skeleton rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Visual Mode Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="size-6 text-primary" />
            Product Intelligence
          </h2>
          <p className="text-muted-foreground">
            Real-time product analytics and AI-powered recommendations
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Eye className="size-4" />
            <Button
              variant={showVisualCharts ? "default" : "outline"}
              size="sm"
              onClick={() => setShowVisualCharts(!showVisualCharts)}
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

      {/* Main Dashboard */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Most Bought Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="size-5 text-primary" />
              Most Bought Products
            </CardTitle>
            <CardDescription>
              Ranked by quantity sold
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mostBoughtProducts.map((product, index) => (
                <div key={product.uniqueKey} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.metrics.totalSold} units sold
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{product.metrics.totalRevenue.toLocaleString()}</p>
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <TrendingUp className="size-3" />
                      +{Math.round(Math.random() * 20 + 5)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Most Demanded Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="size-5 text-amber-500" />
              Most Demanded Products
            </CardTitle>
            <CardDescription>
              Demand vs stock gap analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mostDemandedProducts.map((product, index) => (
                <div key={product.uniqueKey} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {Math.round(product.metrics.weeklyDemand)} units/week
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant={product.metrics.stockoutRisk > 60 ? "destructive" : "secondary"}
                      className="gap-1"
                    >
                      {product.metrics.stockoutRisk > 60 ? (
                        <>
                          <AlertTriangle className="size-3" />
                          High Risk
                        </>
                      ) : (
                        'Normal'
                      )}
                    </Badge>
                  </div>
                  
                  {/* Visual Demand vs Inventory Chart */}
                  {showVisualCharts && (
                    <DemandInventoryChart product={product} />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Most Profitable Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="size-5 text-green-600" />
              Most Profitable Products
            </CardTitle>
            <CardDescription>
              Revenue minus cost analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mostProfitableProducts.map((product, index) => (
                <div key={product.uniqueKey} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-green-500/10 text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {Math.round(product.metrics.profitMargin)}% margin
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{product.metrics.totalProfit.toLocaleString()}</p>
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <TrendingUp className="size-3" />
                      +{Math.round(product.metrics.profitMargin)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="size-5 text-primary" />
            AI Recommendations
          </CardTitle>
          <CardDescription>
            Actionable insights generated from product data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {products.slice(0, 6).map((product, productIndex) => {
              const recommendations = generateProductRecommendations(product)
              return recommendations.map((rec, recIndex) => (
                <div key={`${product.id}_${productIndex}-${recIndex}`} className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{rec.title}</h4>
                      <p className="text-sm text-muted-foreground">{product.name}</p>
                    </div>
                    <Badge 
                      variant={rec.priority === 'High' ? 'destructive' : 'secondary'}
                      className="gap-1"
                    >
                      {rec.priority}
                    </Badge>
                  </div>
                  <p className="text-sm">{rec.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-600">
                      +₹{rec.impact.toLocaleString()} impact
                    </span>
                    <Button 
                      size="sm" 
                      onClick={() => {
                        // Generate and execute action
                        const action = {
                          id: `action_${product.id}_${Date.now()}`,
                          title: rec.title,
                          description: rec.description,
                          action_type: rec.type === 'inventory' ? 'inventory_order' : 'price_adjustment',
                          status: 'pending',
                          priority: rec.priority,
                          confidence: 85,
                          expected_impact: rec.impact,
                          trigger_insight_id: `product_insight_${product.id}`,
                          generated_content: `AI Recommendation: ${rec.title}\n\n${rec.description}\n\nProjected impact: ₹${rec.impact.toLocaleString()}\nPriority: ${rec.priority}`,
                          created_at: new Date().toISOString()
                        }
                        executeAction(action.id)
                      }}
                    >
                      Execute
                    </Button>
                  </div>
                </div>
              ))
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
