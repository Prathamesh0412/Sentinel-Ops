// Virtual Database - Browser-based storage with mock data

class VirtualDatabase {
  constructor() {
    this.storageKey = 'autoops-virtual-db'
    this.isClient = typeof window !== 'undefined'
    
    if (this.isClient) {
      this.initializeData()
    }
  }

  initializeData() {
    if (!this.isClient) return
    
    const existing = localStorage.getItem(this.storageKey)
    if (!existing) {
      const mockData = this.generateMockData()
      localStorage.setItem(this.storageKey, JSON.stringify(mockData))
    }
  }

  generateMockData() {
    const now = new Date().toISOString()
    
    return {
      dataSources: [
        {
          id: '1',
          name: 'Customer Database',
          type: 'customer',
          status: 'completed',
          records_count: 15420,
          last_processed: now,
          created_at: now
        },
        {
          id: '2',
          name: 'Sales Records',
          type: 'sales',
          status: 'processing',
          records_count: 8934,
          last_processed: new Date(Date.now() - 3600000).toISOString(),
          created_at: now
        },
        {
          id: '3',
          name: 'Email Campaigns',
          type: 'email',
          status: 'completed',
          records_count: 2567,
          last_processed: new Date(Date.now() - 7200000).toISOString(),
          created_at: now
        }
      ],
      predictions: [
        {
          id: '1',
          type: 'customer_churn',
          severity: 'high',
          title: 'High Customer Churn Risk',
          description: '15 customers showing 40% engagement decline in the last 30 days',
          confidence_score: 94,
          metrics: { affected_customers: 15, revenue_at_risk: 12500 },
          recommended_action: 'Launch retention campaign with personalized offers',
          status: 'active',
          created_at: new Date(Date.now() - 1800000).toISOString()
        },
        {
          id: '2',
          type: 'inventory_shortage',
          severity: 'medium',
          title: 'Inventory Shortage Alert',
          description: 'Product SKU-1234 running low with current demand trends',
          confidence_score: 87,
          metrics: { current_stock: 45, projected_demand: 120 },
          recommended_action: 'Reorder inventory immediately',
          status: 'active',
          created_at: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: '3',
          type: 'high_value_lead',
          severity: 'low',
          title: 'High Value Lead Identified',
          description: 'New enterprise lead with estimated ₹50k+ contract value',
          confidence_score: 91,
          metrics: { lead_score: 92, estimated_value: 75000 },
          recommended_action: 'Prioritize for immediate sales outreach',
          status: 'active',
          created_at: new Date(Date.now() - 5400000).toISOString()
        }
      ],
      actions: [
        {
          id: '1',
          prediction_id: '1',
          title: 'Customer Retention Campaign',
          description: 'Send personalized retention offers to at-risk customers',
          action_type: 'retention_offer',
          status: 'pending',
          priority: 'high',
          expected_impact: 'Reduce churn by 60%',
          executed_at: null,
          result: null,
          created_at: new Date(Date.now() - 900000).toISOString()
        },
        {
          id: '2',
          prediction_id: '2',
          title: 'Inventory Reorder',
          description: 'Place purchase order for SKU-1234',
          action_type: 'purchase_order',
          status: 'completed',
          priority: 'medium',
          expected_impact: 'Prevent stockout for 2 weeks',
          executed_at: new Date(Date.now() - 1800000).toISOString(),
          result: { order_id: 'PO-12345', quantity: 200 },
          created_at: new Date(Date.now() - 2700000).toISOString()
        },
        {
          id: '3',
          prediction_id: '3',
          title: 'Lead Prioritization',
          description: 'Assign top sales representative to enterprise lead',
          action_type: 'lead_prioritization',
          status: 'in_progress',
          priority: 'high',
          expected_impact: 'Increase conversion probability by 40%',
          executed_at: null,
          result: null,
          created_at: new Date(Date.now() - 600000).toISOString()
        }
      ],
      workflows: [
        {
          id: '1',
          name: 'Customer Churn Prevention',
          description: 'Automated workflow to identify and prevent customer churn',
          trigger_type: 'customer_churn',
          trigger_conditions: { engagement_decline_threshold: 0.4 },
          actions: ['send_retention_email', 'create_support_ticket', 'notify_sales_team'],
          is_active: true,
          success_rate: 78,
          last_execution: new Date(Date.now() - 3600000).toISOString(),
          total_executions: 156,
          created_at: now
        },
        {
          id: '2',
          name: 'Inventory Management',
          description: 'Monitor inventory levels and trigger reorders',
          trigger_type: 'inventory',
          trigger_conditions: { stock_threshold: 0.2 },
          actions: ['check_supplier_availability', 'create_purchase_order', 'notify_manager'],
          is_active: true,
          success_rate: 92,
          last_execution: new Date(Date.now() - 7200000).toISOString(),
          total_executions: 89,
          created_at: now
        },
        {
          id: '3',
          name: 'Lead Scoring',
          description: 'Automated lead scoring and routing',
          trigger_type: 'lead_scoring',
          trigger_conditions: { minimum_score: 80 },
          actions: ['assign_to_rep', 'schedule_followup', 'update_crm'],
          is_active: false,
          success_rate: 85,
          last_execution: new Date(Date.now() - 86400000).toISOString(),
          total_executions: 234,
          created_at: now
        }
      ],
      metrics: [
        {
          id: '1',
          metric_type: 'active_workflows',
          value: 2,
          period: 'current',
          recorded_at: now
        },
        {
          id: '2',
          metric_type: 'predictions_made',
          value: 1247,
          period: '7_days',
          recorded_at: now
        },
        {
          id: '3',
          metric_type: 'actions_executed',
          value: 856,
          period: '7_days',
          recorded_at: now
        },
        {
          id: '4',
          metric_type: 'time_saved_hours',
          value: 124,
          period: '7_days',
          recorded_at: now
        }
      ]
    }
  }

  getData() {
    try {
      if (!this.isClient) {
        console.log('[VirtualDB] Server-side, generating mock data')
        return this.generateMockData()
      }
      const data = localStorage.getItem(this.storageKey)
      if (data) {
        const parsed = JSON.parse(data)
        console.log('[VirtualDB] Client-side, loaded from storage:', parsed)
        return parsed
      }
      console.log('[VirtualDB] Client-side, no data found, generating mock')
      const mockData = this.generateMockData()
      localStorage.setItem(this.storageKey, JSON.stringify(mockData))
      return mockData
    } catch (error) {
      console.error('[VirtualDB] Error in getData:', error)
      return this.generateMockData()
    }
  }

  saveData(data) {
    if (!this.isClient) return
    localStorage.setItem(this.storageKey, JSON.stringify(data))
  }

  // Data Sources
  async getDataSources() {
    const data = this.getData().dataSources
    return data || []
  }

  async addDataSource(dataSource) {
    const data = this.getData()
    const newDataSource = {
      ...dataSource,
      id: Date.now().toString(),
      created_at: new Date().toISOString()
    }
    data.dataSources.push(newDataSource)
    this.saveData(data)
    return newDataSource
  }

  // Predictions
  async getPredictions() {
    const data = this.getData().predictions
    return data || []
  }

  async addPrediction(prediction) {
    const data = this.getData()
    const newPrediction = {
      ...prediction,
      id: Date.now().toString(),
      created_at: new Date().toISOString()
    }
    data.predictions.push(newPrediction)
    this.saveData(data)
    return newPrediction
  }

  // Actions
  async getActions() {
    const data = this.getData().actions
    return data || []
  }

  async updateAction(id, updates) {
    const data = this.getData()
    const index = data.actions.findIndex((a) => a.id === id)
    if (index !== -1) {
      data.actions[index] = { ...data.actions[index], ...updates }
      this.saveData(data)
      return data.actions[index]
    }
    throw new Error('Action not found')
  }

  async executeAction(id) {
    return this.updateAction(id, {
      status: 'completed',
      executed_at: new Date().toISOString(),
      result: { success: true, timestamp: new Date().toISOString() }
    })
  }

  // Workflows
  async getWorkflows() {
    return this.getData().workflows
  }

  async updateWorkflow(id, updates) {
    const data = this.getData()
    const index = data.workflows.findIndex((w) => w.id === id)
    if (index !== -1) {
      data.workflows[index] = { ...data.workflows[index], ...updates }
      this.saveData(data)
      return data.workflows[index]
    }
    throw new Error('Workflow not found')
  }

  async executeWorkflow(id) {
    const workflows = await this.getWorkflows()
    const current = workflows.find(w => w.id === id)
    if (!current) throw new Error('Workflow not found')
    const workflow = await this.updateWorkflow(id, {
      last_execution: new Date().toISOString(),
      total_executions: (current.total_executions || 0) + 1
    })
    return workflow
  }

  // Metrics
  async getMetrics() {
    return this.getData().metrics
  }
}

export const virtualDB = new VirtualDatabase()
