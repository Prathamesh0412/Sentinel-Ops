import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

// Mock data generators
const generateMockActions = () => [
  {
    id: '1',
    title: 'Send retention email to at-risk customers',
    description: 'Automated email campaign for customers with engagement drop > 40%',
    action_type: 'email_campaign',
    status: 'pending',
    priority: 'High',
    expected_impact: 'Save 15 customers',
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    message: 'Dear valued customer, we noticed your recent decrease in engagement and want to ensure you\'re getting the most value from our service...'
  },
  {
    id: '2',
    title: 'Reorder inventory for SKU-1234',
    description: 'Stock level below 20% threshold, automatic reorder triggered',
    action_type: 'inventory',
    status: 'executed',
    priority: 'High',
    expected_impact: 'Prevent stockout',
    executed_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString()
  },
  {
    id: '3',
    title: 'Prioritize high-value leads',
    description: 'Lead scoring identified 3 prospects with >80% conversion probability',
    action_type: 'lead_scoring',
    status: 'pending',
    priority: 'Medium',
    expected_impact: 'Increase conversion by 25%',
    created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString()
  }
]

const generateMockPredictions = () => [
  {
    id: '1',
    name: 'Customer Churn Risk - Enterprise Segment',
    description: '12 enterprise customers showing 45% engagement drop over 30 days',
    prediction_type: 'churn_risk',
    confidence: 92,
    severity: 'High',
    impact: '₹4.5M potential revenue loss',
    recommendation: 'Initiate proactive outreach campaign immediately',
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    decay_factor: 1.0
  },
  {
    id: '2',
    name: 'Q3 Inventory Shortage Predicted',
    description: 'Based on current sales velocity, stock for product line B will deplete in 14 days',
    prediction_type: 'inventory_shortage',
    confidence: 88,
    severity: 'High',
    impact: 'Potential ₹1.2M lost sales',
    recommendation: 'Place rush order with supplier X',
    created_at: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    decay_factor: 0.95
  },
  {
    id: '3',
    name: 'Emerging Market Opportunity',
    description: 'Unusual spike in traffic from Tier 2 cities indicates demand for lite version',
    prediction_type: 'lead_insight',
    confidence: 75,
    severity: 'Medium',
    impact: 'Estimated ₹2.5M new market value',
    recommendation: 'Analyze regional data for targeted marketing',
    created_at: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    decay_factor: 0.9
  }
]

const generateMockWorkflows = () => [
  {
    id: '1',
    name: 'High-Risk Customer Retention',
    description: 'Automatically engages customers with high churn probability',
    trigger_type: 'prediction',
    trigger_conditions: { type: 'churn_risk', threshold: 80 },
    actions: [{ type: 'email', template: 'retention_offer' }, { type: 'slack_alert', channel: 'csm-team' }],
    is_active: true,
    success_rate: 85,
    last_execution: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    total_executions: 124,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString()
  },
  {
    id: '2',
    name: 'Inventory Auto-Replenishment',
    description: 'Triggers purchase orders when stock hits safety levels',
    trigger_type: 'metric',
    trigger_conditions: { metric: 'stock_level', operator: '<', value: 20 },
    actions: [{ type: 'create_po' }, { type: 'email', recipient: 'procurement@company.com' }],
    is_active: true,
    success_rate: 98,
    last_execution: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    total_executions: 452,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString()
  },
  {
    id: '3',
    name: 'Lead Qualification & Assignment',
    description: 'Scores incoming leads and assigns to appropriate sales rep',
    trigger_type: 'event',
    trigger_conditions: { event: 'new_lead' },
    actions: [{ type: 'score_lead' }, { type: 'assign_rep' }],
    is_active: true,
    success_rate: 92,
    last_execution: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    total_executions: 890,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString()
  }
]

// API base URL
const API_BASE_URL = 'http://localhost:8080/api'

const toTitleCase = (value, fallback = '') => {
  if (!value || typeof value !== 'string') return fallback
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

const normalizePrediction = (prediction = {}) => {
  const type = prediction.prediction_type || prediction.type || 'insight'
  const createdAt = prediction.created_at || prediction.createdAt || new Date().toISOString()
  const severity = prediction.severity || 'Medium'
  const status = prediction.status || 'Active'

  return {
    id: (prediction.id ?? `pred_${Math.random().toString(36).slice(2)}`).toString(),
    prediction_type: type,
    type,
    name: prediction.name || toTitleCase(type, 'AI Insight'),
    description: prediction.description || prediction.summary || 'No description provided.',
    severity: toTitleCase(severity, 'Medium'),
    status: toTitleCase(status, 'Active'),
    confidence: Math.round(prediction.confidence ?? 0),
    createdAt,
    created_at: createdAt,
    impact: prediction.impact ?? prediction.business_impact ?? null,
    recommendation: prediction.recommendation ?? prediction.insight ?? null,
    source: prediction.source ?? 'api'
  }
}

const normalizeAction = (action = {}) => {
  const type = action.action_type || action.type || 'general'
  const createdAt = action.created_at || action.createdAt || new Date().toISOString()
  const status = (action.status || 'pending').toLowerCase()
  const priority = action.priority || (status === 'pending' ? 'High' : 'Medium')
  const expectedImpact = Number(action.expected_impact ?? action.expectedImpact ?? 0)

  return {
    id: (action.id ?? `action_${Math.random().toString(36).slice(2)}`).toString(),
    title: action.title || `${toTitleCase(type)} Action`,
    description: action.description || action.generated_content || 'AI recommended action',
    action_type: type,
    type,
    status,
    priority,
    expected_impact: Number.isFinite(expectedImpact) ? expectedImpact : 0,
    created_at: createdAt,
    updated_at: action.updated_at || action.updatedAt || null,
    generated_content: action.generated_content || action.generatedContent || '',
    result: action.result || {},
  }
}

// Transform API response to frontend format
const transformWorkflow = (workflow) => ({
  id: workflow.id,
  name: workflow.name,
  description: workflow.description,
  is_active: workflow.active,
  is_executing: false,
  success_rate: workflow.successRate || 0,
  execution_count: workflow.executionCount || workflow.execution_count || 0,
  total_executions: workflow.executionCount || workflow.total_executions || workflow.execution_count || 0,
  trigger_type: workflow.trigger_type || workflow.triggerType || null,
  last_execution: workflow.lastRunAt || workflow.last_execution || null
})

// Main store combining domain logic
export const useStore = create((set, get) => ({
  actions: generateMockActions().map(normalizeAction),
  predictions: [],
  workflows: generateMockWorkflows(),
  metrics: {
    totalActions: 0,
    activeWorkflows: 0,
    predictionsGenerated: 0,
    systemHealth: 0,
    timeSaved: 0,
    accuracyRate: 0,
    totalCustomers: 0,
    activeProducts: 0,
    totalRevenue: 0,
    executedActions: 0,
    pendingActions: 0,
    confidenceScore: 0,
    lastUpdated: null
  },
  isProcessing: false,

  // Methods
  addAction: (action) => set((state) => ({ 
    actions: [action, ...state.actions] 
  })),
  
  updateActionStatus: (id, status) => set((state) => ({
    actions: state.actions.map(a => 
      a.id === id ? { ...a, status } : a
    )
  })),
  
  addPrediction: (prediction) => set((state) => ({
    predictions: [prediction, ...state.predictions]
  })),
  
  toggleWorkflow: async (id, isActive) => {
    try {
      set({ isProcessing: true })
      const response = await fetch(`${API_BASE_URL}/workflows`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive })
      })
      const updatedWorkflowData = await response.json()
      const updatedWorkflow = transformWorkflow(updatedWorkflowData)
      set((state) => ({
        workflows: state.workflows.map(w => 
          w.id === id ? updatedWorkflow : w
        ),
        isProcessing: false
      }))
    } catch (error) {
      console.error('Error toggling workflow:', error)
      set({ isProcessing: false })
    }
  },

  createWorkflow: async (payload = {}) => {
    try {
      set({ isProcessing: true })
      // Accept frontend keys: name, description, is_active
      const body = {
        name: payload.name || undefined,
        description: payload.description || undefined,
        is_active: typeof payload.is_active !== 'undefined' ? payload.is_active : undefined,
      }
      const response = await fetch(`${API_BASE_URL}/workflows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const newWorkflowData = await response.json()
      const newWorkflow = transformWorkflow(newWorkflowData)
      set((state) => ({
        workflows: [newWorkflow, ...state.workflows],
        isProcessing: false
      }))
      return newWorkflow
    } catch (error) {
      console.error('Error creating workflow:', error)
      set({ isProcessing: false })
      throw error
    }
  },

  fetchWorkflows: async () => {
    try {
      set({ isProcessing: true })
      const response = await fetch(`${API_BASE_URL}/workflows`)
      const workflowsData = await response.json()
      const workflows = workflowsData.map(transformWorkflow)
      set({ workflows, isProcessing: false })
      return workflows
    } catch (error) {
      console.error('Error fetching workflows:', error)
      set({ isProcessing: false })
      // Fall back to mock data on error
      set({ workflows: generateMockWorkflows() })
    }
  },

  fetchActions: async (filters = {}) => {
    try {
      const url = new URL(`${API_BASE_URL}/actions`)
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          url.searchParams.set(key, value)
        }
      })

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch actions')
      }

      const data = await response.json()
      const normalized = data.map((item) => normalizeAction(item))
      set({ actions: normalized })
      return normalized
    } catch (error) {
      console.error('Error fetching actions:', error)
      set((state) =>
        state.actions.length
          ? {}
          : { actions: generateMockActions().map((item) => normalizeAction(item)) }
      )
      throw error
    }
  },

  fetchPredictions: async (filters = {}) => {
    try {
      const url = new URL(`${API_BASE_URL}/predictions`)
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          url.searchParams.set(key, value)
        }
      })

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch predictions')
      }

      const predictionsData = await response.json()
      const normalized = predictionsData
        .map((item) => normalizePrediction(item))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

      set({ predictions: normalized })
      return normalized
    } catch (error) {
      console.error('Error fetching predictions:', error)
      set((state) =>
        state.predictions.length
          ? {}
          : { predictions: generateMockPredictions().map((item) => normalizePrediction(item)) }
      )
      throw error
    }
  },
  
  executeWorkflow: async (id) => {
    try {
      set({ isProcessing: true })
      // Execute workflow endpoint (you may need to add this to backend)
      const response = await fetch(`${API_BASE_URL}/workflows/${id}/execute`, {
        method: 'POST'
      })
      const result = await response.json()
      set({ isProcessing: false })
      return result
    } catch (error) {
      console.error('Error executing workflow:', error)
      set({ isProcessing: false })
    }
  },
  
  updateMetrics: async () => {
    try {
      set({ isProcessing: true })
      const response = await fetch(`${API_BASE_URL}/metrics`)
      if (!response.ok) {
        throw new Error('Failed to fetch metrics')
      }
      const data = await response.json()
      set({
        metrics: {
          totalActions: data.totalActions ?? 0,
          activeWorkflows: data.activeWorkflows ?? 0,
          predictionsGenerated: data.predictionsGenerated ?? 0,
          systemHealth: data.systemHealth ?? 0,
          timeSaved: data.timeSavedHours ?? data.timeSaved ?? 0,
          accuracyRate: data.accuracyRate ?? 0,
          totalCustomers: data.totalCustomers ?? 0,
          activeProducts: data.activeProducts ?? 0,
          totalRevenue: data.totalRevenue ?? 0,
          executedActions: data.executedActions ?? 0,
          pendingActions: data.pendingActions ?? 0,
          confidenceScore: data.confidenceScore ?? 0,
          lastUpdated: data.lastUpdated ?? new Date().toISOString()
        },
        isProcessing: false
      })
      return data
    } catch (error) {
      console.error('Error fetching metrics:', error)
      set({ isProcessing: false })
      throw error
    }
  }
}))

// Selector hooks for easier access
export const useActions = () => useStore((state) => state.actions)
export const usePredictions = () => useStore((state) => state.predictions)
export const useWorkflows = () => useStore((state) => state.workflows)
export const useMetrics = () => useStore((state) => state.metrics)
export const useIsProcessing = () => useStore((state) => state.isProcessing)
export const useAppStore = () => useStore()
