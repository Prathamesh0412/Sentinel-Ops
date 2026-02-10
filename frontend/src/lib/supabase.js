// Virtual Database API - Replaces Supabase with browser-based storage
import { virtualDB } from './virtual-db'

// Export virtual database as the main API
export const supabase = {
  // Data Sources
  from: (table) => ({
    select: () => ({
      data: null,
      error: null
    })
  })
}

// Export direct database functions for easier usage
export const db = {
  getDataSources: async () => {
    try {
      const result = await virtualDB.getDataSources()
      return result
    } catch (error) {
      console.error('[Supabase] getDataSources error:', error)
      return []
    }
  },
  getPredictions: async () => {
    try {
      const result = await virtualDB.getPredictions()
      return result
    } catch (error) {
      console.error('[Supabase] getPredictions error:', error)
      return []
    }
  },
  getActions: async () => {
    try {
      const result = await virtualDB.getActions()
      return result
    } catch (error) {
      console.error('[Supabase] getActions error:', error)
      return []
    }
  },
  updateAction: async (id, updates) => {
    try {
      const result = await virtualDB.updateAction(id, updates)
      return result
    } catch (error) {
      console.error('[Supabase] updateAction error:', error)
      throw error
    }
  },
  executeAction: (id) => virtualDB.executeAction(id),
  getWorkflows: () => virtualDB.getWorkflows(),
  updateWorkflow: (id, updates) => virtualDB.updateWorkflow(id, updates),
  executeWorkflow: (id) => virtualDB.executeWorkflow(id),
  getMetrics: () => virtualDB.getMetrics(),
  addDataSource: (dataSource) => virtualDB.addDataSource(dataSource),
  addPrediction: (prediction) => virtualDB.addPrediction(prediction)
}
