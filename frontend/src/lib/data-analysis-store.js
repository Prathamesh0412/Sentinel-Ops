import { create } from 'zustand'
import { useStore } from '@/lib/store'

const normalizeBaseUrl = (value) => (value ? value.replace(/\/$/, '') : '')
const runtimeOrigin = typeof window !== 'undefined' ? `${window.location.origin}/api` : '/api'
const API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL) || normalizeBaseUrl(runtimeOrigin)

const STORAGE_KEY = 'auto_ops_analysis_snapshot'

const readSnapshot = () => {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (error) {
    console.warn('[DataAnalysisStore] unable to read snapshot', error)
    return null
  }
}

const writeSnapshot = (snapshot) => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
  } catch (error) {
    console.warn('[DataAnalysisStore] unable to persist snapshot', error)
  }
}

const clearSnapshot = () => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.warn('[DataAnalysisStore] unable to clear snapshot', error)
  }
}

const applySnapshotToDashboard = (snapshot) => {
  if (!snapshot) return
  const { metricsPatch, predictions } = snapshot
  useStore.setState((state) => {
    const patch = {}
    if (metricsPatch) {
      patch.metrics = {
        ...state.metrics,
        ...metricsPatch,
        lastUpdated: metricsPatch.lastUpdated || state.metrics.lastUpdated || new Date().toISOString()
      }
    }
    if (Array.isArray(predictions) && predictions.length) {
      patch.predictions = [...predictions, ...state.predictions].slice(0, 30)
    }
    return Object.keys(patch).length ? patch : {}
  })
}

const initialSnapshot = readSnapshot()
applySnapshotToDashboard(initialSnapshot)

const clamp = (value, min = 0, max = 100) => {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return min
  return Math.max(min, Math.min(max, numeric))
}

const buildGeneratedPredictions = (insights) => {
  if (!insights) return []
  const generatedAt = insights.generated_at || new Date().toISOString()
  const stockEntries = Array.isArray(insights.stock_status) ? insights.stock_status : []
  const predictions = stockEntries.map((entry) => {
    const productId = entry.product_id || 'Inventory'
    const status = (entry.stock_status || 'HEALTHY').toUpperCase()
    const severity = status === 'CRITICAL' ? 'High' : status === 'WATCH' ? 'Medium' : 'Low'
    const confidence = clamp(status === 'CRITICAL' ? 92 : status === 'WATCH' ? 84 : 72)
    const eta = Number(entry.days_until_stock_out)
    return {
      id: `upload-stock-${productId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      prediction_type: 'inventory_forecast',
      type: 'inventory_forecast',
      name: `${status === 'HEALTHY' ? 'Stock Status' : 'Stock Alert'} • ${productId}`,
      description:
        status === 'HEALTHY'
          ? `On-hand ${entry.current_stock ?? 'n/a'} units with steady coverage`
          : eta
            ? `Projected stockout in ${eta.toFixed(1)} days at current velocity`
            : `Elevated consumption detected for ${productId}`,
      severity,
      confidence,
      createdAt: generatedAt,
      impact:
        status === 'CRITICAL'
          ? 'High revenue risk'
          : status === 'WATCH'
            ? 'Monitor replenishment plan'
            : 'Within guardrails',
      recommendation:
        status === 'CRITICAL'
          ? 'Trigger rush reorder'
          : status === 'WATCH'
            ? 'Review demand spikes'
            : 'No immediate action required',
      source: 'upload_analysis'
    }
  })

  const best = insights.best_selling_product
  if (best) {
    const bestProductId = best.product_id || 'Top Product'
    predictions.unshift({
      id: `upload-best-${bestProductId}-${Date.now()}`,
      prediction_type: 'sales_velocity',
      type: 'sales_velocity',
      name: `High Velocity • ${bestProductId}`,
      description: `Total sales ${Math.round(best.total_sales ?? 0)} units, avg daily ${(best.avg_daily_sales ?? 0).toFixed(1)} units`,
      severity: 'Medium',
      confidence: clamp(78 + Math.random() * 10, 40, 96),
      createdAt: generatedAt,
      impact: 'Consider scaling fulfillment capacity',
      recommendation: 'Promote bundle or upsell while demand is hot',
      source: 'upload_analysis'
    })
  }

  return predictions
}

const deriveMetricsFromInsights = (payload) => {
  const insights = payload?.insights
  if (!insights) return { metricsPatch: null, predictions: [] }

  const stats = Array.isArray(insights.sales_stats) ? insights.sales_stats : []
  const stockEntries = Array.isArray(insights.stock_status) ? insights.stock_status : []
  const generatedPredictions = buildGeneratedPredictions(insights)
  const totalSales = stats.reduce((sum, stat) => sum + Number(stat.total_sales ?? 0), 0)
  const riskyCount = stockEntries.filter((entry) => (entry.stock_status || '').toUpperCase() !== 'HEALTHY').length
  const systemHealth = stockEntries.length
    ? clamp(((stockEntries.length - riskyCount) / stockEntries.length) * 100, 5, 100)
    : clamp(100 - generatedPredictions.length, 35, 100)
  const confidenceScore = generatedPredictions.length
    ? Math.round(
        generatedPredictions.reduce((sum, prediction) => sum + clamp(prediction.confidence, 10, 100), 0) /
          generatedPredictions.length
      )
    : systemHealth
  const productCount = stats.length || payload?.products_analyzed || 0
  const filesProcessed = payload?.files_processed || payload?.filesProcessed || 0
  const metricsPatch = {
    totalRevenue: Math.round(totalSales),
    activeProducts: productCount,
    totalCustomers: payload?.products_analyzed ?? productCount,
    totalActions: filesProcessed || productCount,
    executedActions: filesProcessed || productCount,
    pendingActions: 0,
    predictionsGenerated: generatedPredictions.length || productCount,
    systemHealth,
    confidenceScore,
    timeSaved: clamp(totalSales / 500, 1, 240),
    lastUpdated: new Date().toISOString()
  }

  return { metricsPatch, predictions: generatedPredictions }
}

const syncDashboardFromAnalysis = (payload, analysisSummary) => {
  const { metricsPatch, predictions } = deriveMetricsFromInsights(payload)
  if (!metricsPatch && !predictions.length) {
    return
  }

  useStore.setState((state) => {
    const patch = {}
    if (metricsPatch) {
      patch.metrics = {
        ...state.metrics,
        ...metricsPatch,
        lastUpdated: metricsPatch.lastUpdated || new Date().toISOString()
      }
    }
    if (predictions.length) {
      patch.predictions = [...predictions, ...state.predictions].slice(0, 30)
    }
    return Object.keys(patch).length ? patch : {}
  })

  writeSnapshot({
    metricsPatch,
    predictions,
    insights: payload?.insights || null,
    analysisSummary: analysisSummary || null,
    savedAt: new Date().toISOString(),
  })
}

const initialInsights = initialSnapshot?.insights || null
const initialAnalysisSummary = initialSnapshot?.analysisSummary || null

const normalizeDescriptor = (descriptor) => ({
  id: descriptor.id || descriptor.stored_name,
  serverFilename: descriptor.stored_name,
  name: descriptor.original_name,
  type: descriptor.mime_type || 'text/csv',
  size: descriptor.size || 0,
  uploadTimestamp: descriptor.uploaded_at || new Date().toISOString(),
  status: 'uploaded',
  selected: true,
  recordsProcessed: descriptor.records_parsed || 0,
})

export const useDataAnalysisStore = create((set, get) => ({
  uploadedFiles: [],
  dataSources: [],
  latestInsights: initialInsights,
  analysisSummary: initialAnalysisSummary,
  isUploading: false,
  isAnalyzing: false,
  isLoadingSources: false,
  error: null,

  fetchBaselineInsights: async (options = {}) => {
    const { force } = options
    if (!force && get().latestInsights) return
    try {
      const response = await fetch(`${API_BASE_URL}/inventory-insights`)
      if (!response.ok) throw new Error('Unable to load baseline insights')
      const insights = await response.json()
      const summary = {
        filesProcessed: 0,
        recordsProcessed: 0,
        productsAnalyzed: Array.isArray(insights?.sales_stats) ? insights.sales_stats.length : 0,
        generatedAt: insights?.generated_at || new Date().toISOString(),
      }
      set({ latestInsights: insights, analysisSummary: summary })
      syncDashboardFromAnalysis({ insights, files_processed: 0, products_analyzed: summary.productsAnalyzed }, summary)
    } catch (error) {
      console.error('[DataAnalysisStore] fetchBaselineInsights', error)
      set({ error: error.message })
    }
  },

  fetchDataSources: async () => {
    set({ isLoadingSources: true })
    try {
      const response = await fetch(`${API_BASE_URL}/data-sources`)
      if (!response.ok) throw new Error('Unable to load data sources')
      const payload = await response.json()
      set({ dataSources: Array.isArray(payload) ? payload : [], isLoadingSources: false })
    } catch (error) {
      console.error('[DataAnalysisStore] fetchDataSources', error)
      set({ isLoadingSources: false, error: error.message })
    }
  },

  uploadFiles: async (fileList) => {
    if (!fileList || fileList.length === 0) return
    set({ isUploading: true, error: null })
    const formData = new FormData()
    Array.from(fileList).forEach((file) => formData.append('files', file))

    try {
      const response = await fetch(`${API_BASE_URL}/upload/files`, {
        method: 'POST',
        body: formData,
      })
      if (!response.ok) throw new Error('Upload failed')
      const payload = await response.json()
      const descriptors = Array.isArray(payload.files) ? payload.files : []
      const errorCount = Number(payload.errorCount ?? 0)
      if (!descriptors.length && errorCount > 0) {
        set({
          isUploading: false,
          error: 'Upload rejected. Please use CSV, XLS, XLSX, or TXT files under 10MB.'
        })
        return
      }
      set((state) => ({
        uploadedFiles: [...descriptors.map(normalizeDescriptor), ...state.uploadedFiles],
        isUploading: false,
        error: errorCount > 0 ? 'Some files were rejected. Only CSV, XLS, XLSX, or TXT are supported.' : null,
      }))
    } catch (error) {
      console.error('[DataAnalysisStore] uploadFiles', error)
      set({ isUploading: false, error: error.message })
    }
  },

  removeFile: (id) => {
    set((state) => ({ uploadedFiles: state.uploadedFiles.filter((file) => file.id !== id) }))
  },

  toggleFileSelection: (id) => {
    set((state) => ({
      uploadedFiles: state.uploadedFiles.map((file) =>
        file.id === id ? { ...file, selected: !file.selected } : file,
      ),
    }))
  },

  selectAllFiles: (selected) => {
    set((state) => ({
      uploadedFiles: state.uploadedFiles.map((file) => ({ ...file, selected })),
    }))
  },

  clearAnalysisHistory: () => {
    set({
      uploadedFiles: [],
      dataSources: [],
      latestInsights: null,
      analysisSummary: null,
      error: null,
      isUploading: false,
      isAnalyzing: false,
    })
    useStore.setState((state) => ({
      predictions: state.predictions.filter((prediction) => prediction.source !== 'upload_analysis'),
    }))
    clearSnapshot()
  },

  analyzeSelectedFiles: async () => {
    const selectedFiles = get().uploadedFiles.filter(
      (file) => file.selected && file.status === 'uploaded',
    )
    if (selectedFiles.length === 0) return

    const selectedIds = new Set(selectedFiles.map((file) => file.id))
    set({ isAnalyzing: true, error: null })
    set((state) => ({
      uploadedFiles: state.uploadedFiles.map((file) =>
        selectedIds.has(file.id)
          ? { ...file, status: 'analyzing', analysisProgress: 15 }
          : file,
      ),
    }))

    try {
      const response = await fetch(`${API_BASE_URL}/upload/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: selectedFiles.map((file) => ({
            stored_name: file.serverFilename || file.id,
            original_name: file.name,
          })),
        }),
      })
      if (!response.ok) throw new Error('Analysis failed')
      const payload = await response.json()
      const summaries = new Map(
        (payload.summaries || []).map((summary) => [summary.stored_name, summary.records_parsed]),
      )
      const summary = {
        filesProcessed: payload.files_processed || selectedFiles.length,
        recordsProcessed: payload.records_processed || 0,
        productsAnalyzed: payload.products_analyzed || 0,
        generatedAt: payload.insights?.generated_at || new Date().toISOString(),
      }

      set((state) => ({
        uploadedFiles: state.uploadedFiles.map((file) =>
          selectedIds.has(file.id)
            ? {
                ...file,
                status: 'completed',
                analysisProgress: 100,
                recordsProcessed: summaries.get(file.serverFilename || file.id) || file.recordsProcessed,
              }
            : file,
        ),
        latestInsights: payload.insights || null,
        analysisSummary: summary,
        isAnalyzing: false,
      }))

      syncDashboardFromAnalysis(payload, summary)
      get().fetchDataSources()
    } catch (error) {
      console.error('[DataAnalysisStore] analyzeSelectedFiles', error)
      set((state) => ({
        uploadedFiles: state.uploadedFiles.map((file) =>
          selectedIds.has(file.id)
            ? { ...file, status: 'failed', error: error.message }
            : file,
        ),
        isAnalyzing: false,
        error: error.message,
      }))
    }
  },
}))
