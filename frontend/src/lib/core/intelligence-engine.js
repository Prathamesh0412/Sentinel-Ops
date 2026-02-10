export class IntelligenceEngine {
  // Churn Risk Calculation
  static calculateChurnRisk(customer, recentOrders) {
    let risk = 0
    
    // Engagement decay factor (40% weight)
    const engagementWeight = 0.4
    const engagementRisk = (100 - customer.engagement_score) * engagementWeight
    
    // Purchase frequency drop (30% weight)
    const purchaseWeight = 0.3
    const recentPurchaseFreq = recentOrders.length / 4 // last 4 months
    const freqDrop = Math.max(0, (customer.purchase_frequency - recentPurchaseFreq) / customer.purchase_frequency)
    const purchaseRisk = freqDrop * 100 * purchaseWeight
    
    // LTV consideration (20% weight) - higher LTV = lower risk
    const ltvWeight = 0.2
    const avgLtv = 5000 // baseline
    const ltvRisk = Math.max(0, (avgLtv - customer.ltv) / avgLtv) * 100 * ltvWeight
    
    // Recency factor (10% weight)
    const recencyWeight = 0.1
    const daysSinceLastPurchase = (Date.now() - new Date(customer.last_purchase).getTime()) / (1000 * 60 * 60 * 24)
    const recencyRisk = Math.min(100, daysSinceLastPurchase / 30 * 100) * recencyWeight
    
    risk = engagementRisk + purchaseRisk + ltvRisk + recencyRisk
    
    return Math.min(100, Math.round(risk))
  }

  // Inventory Shortage Prediction
  static calculateInventoryRisk(product, recentOrders) {
    const weeklyDemand = recentOrders
      .filter(order => order.product_id === product.id)
      .reduce((sum, order) => sum + order.quantity, 0) / 4 // last 4 weeks
    
    const currentStock = product.stock_quantity
    
    // Handle edge cases where weeklyDemand is 0 or invalid
    if (weeklyDemand <= 0 || !isFinite(weeklyDemand)) {
      return {
        risk: 0,
        stockout_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
        demand_gap: 0
      }
    }
    
    const daysOfStock = (currentStock / weeklyDemand) * 7
    const risk = Math.min(100, Math.max(0, (30 - daysOfStock) / 30 * 100))
    
    // Ensure daysOfStock is a finite number
    const validDaysOfStock = isFinite(daysOfStock) ? daysOfStock : 365
    const stockoutDate = new Date()
    stockoutDate.setDate(stockoutDate.getDate() + Math.max(0, validDaysOfStock))
    
    const demandGap = Math.max(0, weeklyDemand - currentStock / 4)
    
    return {
      risk: Math.round(risk),
      stockout_date: stockoutDate.toISOString(),
      demand_gap: Math.round(demandGap)
    }
  }

  // Lead Value Calculation
  static calculateLeadValue(leadData) {
    const reasoning = []
    let value = 0
    let confidence = 50 // baseline

    // Company size factor
    const sizeMultiplier = leadData.company_size / 500 // normalized to 500 employees
    value += leadData.deal_size * sizeMultiplier
    reasoning.push(`Company size (${leadData.company_size} employees) increases deal value by ${Math.round(sizeMultiplier * 100)}%`)

    // Intent signals
    const intentBonus = leadData.intent_signals * 1000
    value += intentBonus
    confidence += leadData.intent_signals * 10
    reasoning.push(`${leadData.intent_signals} intent signals add ₹${intentBonus.toLocaleString()} to value`)

    // Budget alignment
    if (leadData.budget_range >= leadData.deal_size) {
      confidence += 20
      reasoning.push('Budget aligns with deal size, increasing confidence')
    }

    // Recency
    confidence += leadData.recency_score * 15
    reasoning.push(`Recent activity (${Math.round(leadData.recency_score * 100)}%) boosts confidence`)

    return {
      value: Math.round(value),
      confidence: Math.min(100, Math.round(confidence)),
      reasoning
    }
  }

  // Generate Insights from Data
  static generateInsights(customers, products, orders, campaigns) {
    const insights = []
    const now = new Date()

    // Customer Churn Insights
    customers.forEach(customer => {
      const customerOrders = orders.filter(order => order.customer_id === customer.id)
      const churnRisk = this.calculateChurnRisk(customer, customerOrders)
      
      if (churnRisk > 60) {
        insights.push({
          id: `churn_${customer.id}_${Date.now()}`,
          type: 'churn_risk',
          title: `High Churn Risk: ${customer.name}`,
          description: `Customer shows ${churnRisk}% churn risk due to engagement decline`,
          confidence: Math.min(95, churnRisk + 10),
          business_impact: customer.ltv * (churnRisk / 100),
          reason_breakdown: [
            `Engagement score: ${customer.engagement_score}/100`,
            `Purchase frequency dropped by ${Math.round((1 - customerOrders.length / 4 / customer.purchase_frequency) * 100)}%`,
            `LTV at risk: ₹${customer.ltv.toLocaleString()}`
          ],
          trend_data: {
            current: churnRisk,
            previous: Math.max(0, churnRisk - 15),
            trend: 'up'
          },
          decay_factor: 1.0,
          target_entity_id: customer.id,
          target_entity_type: 'customer',
          created_at: now.toISOString(),
          expires_at: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        })
      }
    })

    // Inventory Shortage Insights
    products.forEach(product => {
      const productOrders = orders.filter(order => order.product_id === product.id)
      const inventoryRisk = this.calculateInventoryRisk(product, productOrders)
      
      if (inventoryRisk.risk > 50) {
        insights.push({
          id: `inventory_${product.id}_${Date.now()}`,
          type: 'inventory_shortage',
          title: `Inventory Shortage Risk: ${product.name}`,
          description: `Product may run out of stock by ${new Date(inventoryRisk.stockout_date).toLocaleDateString()}`,
          confidence: Math.min(90, inventoryRisk.risk + 15),
          business_impact: inventoryRisk.demand_gap * product.price,
          reason_breakdown: [
            `Current stock: ${product.stock_quantity} units`,
            `Weekly demand: ${Math.round(productOrders.reduce((sum, order) => sum + order.quantity, 0) / 4)} units`,
            `Stockout predicted in ${Math.round((new Date(inventoryRisk.stockout_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days`
          ],
          trend_data: {
            current: inventoryRisk.risk,
            previous: Math.max(0, inventoryRisk.risk - 10),
            trend: 'up'
          },
          decay_factor: 1.0,
          target_entity_id: product.id,
          target_entity_type: 'product',
          created_at: now.toISOString(),
          expires_at: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days
        })
      }
    })

    return insights.sort((a, b) => b.confidence - a.confidence)
  }

  // Generate Actions from Insights
  static generateActions(insights) {
    const actions = []
    const now = new Date()

    insights.forEach(insight => {
      if (insight.type === 'churn_risk') {
        actions.push({
          id: `action_retention_${insight.id}`,
          title: `Customer Retention Campaign`,
          description: `Automated retention campaign for high-churn-risk customer`,
          action_type: 'email_campaign',
          status: 'pending',
          priority: insight.business_impact > 10000 ? 'High' : 'Medium',
          confidence: insight.confidence,
          expected_impact: insight.business_impact * 0.7, // 70% recovery rate
          trigger_insight_id: insight.id,
          generated_content: `Dear valued customer,\n\nWe've noticed your recent decrease in engagement and want to ensure you're getting the most value from our service. As one of our valued customers, we'd like to offer you an exclusive 20% discount on your next renewal.\n\nYour success is important to us. Can we schedule a call to discuss how we can better serve your needs?\n\nBest regards,\nCustomer Success Team`,
          created_at: now.toISOString()
        })
      } else if (insight.type === 'inventory_shortage') {
        actions.push({
          id: `action_inventory_${insight.id}`,
          title: `Inventory Purchase Order`,
          description: `Automatic reorder for product with stock shortage risk`,
          action_type: 'inventory_order',
          status: 'pending',
          priority: insight.business_impact > 5000 ? 'High' : 'Medium',
          confidence: insight.confidence,
          expected_impact: insight.business_impact,
          trigger_insight_id: insight.id,
          generated_content: `Purchase Order #PO-${Date.now()}\n\nProduct: Auto-generated based on demand forecast\nQuantity: Based on sales velocity analysis\nPriority: High - Stock shortage risk\nDelivery: Express shipping recommended`,
          created_at: now.toISOString()
        })
      }
    })

    return actions.sort((a, b) => b.expected_impact - a.expected_impact)
  }

  // Calculate System Metrics
  static calculateSystemMetrics(customers, products, orders, actions, workflows) {
    const totalRevenue = orders.reduce((sum, order) => sum + order.revenue, 0)
    const totalProfit = orders.reduce((sum, order) => sum + order.profit, 0)
    const executedActions = actions.filter(action => action.status === 'executed')
    const avgConfidence = actions.length > 0 
      ? actions.reduce((sum, action) => sum + action.confidence, 0) / actions.length 
      : 0

    return {
      total_customers: customers.length,
      total_products: products.length,
      total_revenue: totalRevenue,
      total_profit: totalProfit,
      active_workflows: workflows.filter(w => w.is_active).length,
      pending_actions: actions.filter(a => a.status === 'pending').length,
      executed_actions: executedActions.length,
      system_health: Math.min(100, Math.round(avgConfidence * 0.9 + (executedActions.length / actions.length) * 10)),
      time_saved_hours: executedActions.length * 2, // 2 hours saved per executed action
      confidence_score: Math.round(avgConfidence),
      last_updated: new Date().toISOString()
    }
  }
}
