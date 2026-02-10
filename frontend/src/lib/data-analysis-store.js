import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const SUPPORTED_FILE_TYPES = {
  'text/csv': 'csv',
  'application/json': 'json',
  'application/vnd.ms-excel': 'excel',
}

const generateMockDataSources = () => [
  {
    id: '1',
    name: 'Customer Database',
    type: 'customer_database',
    status: 'completed',
    records_count: 15420,
    last_processed: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    progress: 100,
  },
  {
    id: '2',
    name: 'Sales Records',
    type: 'sales_records',
    status: 'processing',
    records_count: 8934,
    last_processed: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    progress: 65,
  },
  {
    id: '3',
    name: 'Email Campaigns',
    type: 'email_campaigns',
    status: 'completed',
    records_count: 2567,
    last_processed: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    progress: 100,
  },
]

export const useDataAnalysisStore = create(
  persist(
    (set, get) => ({
      uploadedFiles: [],
      isUploading: false,
      isAnalyzing: false,
      dataSources: generateMockDataSources(),

      uploadFiles: (files) => {
        const newFiles = []
        const errors = []

        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          const fileType = SUPPORTED_FILE_TYPES[file.type]
          if (!fileType) {
            errors.push(`Unsupported file type: ${file.name}`)
            continue
          }
          newFiles.push({
            id: `file_${Date.now()}_${i}`,
            name: file.name,
            type: file.type,
            size: file.size,
            uploadTimestamp: new Date().toISOString(),
            status: 'uploaded',
            selected: true,
          })
        }

        if (errors.length > 0) {
          console.error('Upload errors:', errors)
        }

        set((state) => ({
          uploadedFiles: [...newFiles, ...state.uploadedFiles],
          isUploading: false,
        }))
      },

      removeFile: (id) => {
        set((state) => ({
          uploadedFiles: state.uploadedFiles.filter((file) => file.id !== id),
        }))
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

      analyzeSelectedFiles: async () => {
        const { uploadedFiles } = get()
        const selectedFiles = uploadedFiles.filter(
          (file) => file.selected && file.status === 'uploaded',
        )
        if (selectedFiles.length === 0) return

        set({ isAnalyzing: true })

        set((state) => ({
          uploadedFiles: state.uploadedFiles.map((file) =>
            file.selected && file.status === 'uploaded'
              ? {
                  ...file,
                  status: 'analyzing',
                  analysisProgress: 0,
                  recordsProcessed: 0,
                }
              : file,
          ),
        }))

        for (const file of selectedFiles) {
          try {
            await get().simulateFileAnalysis(file.id)
          } catch (error) {
            get().completeFileAnalysis(
              file.id,
              false,
              error instanceof Error ? error.message : 'Analysis failed',
            )
          }
        }

        set({ isAnalyzing: false })
      },

      simulateFileAnalysis: async (fileId) => {
        const totalRecords = Math.floor(Math.random() * 5000) + 1000
        let recordsProcessed = 0
        let progress = 0

        return new Promise((resolve) => {
          const interval = setInterval(() => {
            recordsProcessed += Math.floor(Math.random() * 100) + 50
            progress = Math.min(100, (recordsProcessed / totalRecords) * 100)

            get().updateAnalysisProgress(fileId, progress, recordsProcessed)

            if (progress >= 100) {
              clearInterval(interval)
              get().completeFileAnalysis(fileId, true)
              get().addDataSourceFromFile(fileId)
              resolve(true)
            }
          }, 300 + Math.random() * 200)
        })
      },

      updateAnalysisProgress: (fileId, progress, recordsProcessed) => {
        set((state) => ({
          uploadedFiles: state.uploadedFiles.map((file) =>
            file.id === fileId
              ? {
                  ...file,
                  analysisProgress: progress,
                  recordsProcessed: recordsProcessed ?? file.recordsProcessed,
                }
              : file,
          ),
        }))
      },

      completeFileAnalysis: (fileId, success, error) => {
        set((state) => ({
          uploadedFiles: state.uploadedFiles.map((file) =>
            file.id === fileId
              ? {
                  ...file,
                  status: success ? 'completed' : 'failed',
                  analysisProgress: success ? 100 : file.analysisProgress,
                  error,
                }
              : file,
          ),
        }))
      },

      addDataSourceFromFile: (fileId) => {
        const { uploadedFiles } = get()
        const file = uploadedFiles.find((f) => f.id === fileId)
        if (!file) return

        const types = ['customer_database', 'sales_records', 'email_campaigns']
        const randomType = types[Math.floor(Math.random() * types.length)]

        const newDataSource = {
          id: `ds_${fileId}`,
          name: file.name.replace(/\.[^/.]+$/, ''),
          type: randomType,
          status: 'completed',
          records_count: file.recordsProcessed || Math.floor(Math.random() * 5000) + 1000,
          last_processed: new Date().toISOString(),
          progress: 100,
        }

        set((state) => ({
          dataSources: [newDataSource, ...state.dataSources],
        }))
      },

      setDataSources: (sources) => set({ dataSources: sources }),

      uploadData: async (type) => {
        set({ isUploading: true })
        await new Promise((resolve) => setTimeout(resolve, 2000))

        const newSource = {
          id: Date.now().toString(),
          name: `${type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')} ${new Date().toLocaleDateString()}`,
          type,
          status: 'processing',
          records_count: Math.floor(Math.random() * 10000) + 1000,
          last_processed: null,
          progress: 0,
        }

        set((state) => ({
          dataSources: [newSource, ...state.dataSources],
          isUploading: false,
        }))

        const interval = setInterval(() => {
          const { dataSources } = get()
          const source = dataSources.find((s) => s.id === newSource.id)
          if (source && source.status === 'processing') {
            const newProgress = Math.min(100, source.progress + Math.random() * 15 + 5)
            get().updateProgress(newSource.id, newProgress)
            if (newProgress >= 100) {
              clearInterval(interval)
              get().completeProcessing(newSource.id)
            }
          } else {
            clearInterval(interval)
          }
        }, 1000)
      },

      updateProgress: (id, progress) => {
        set((state) => ({
          dataSources: state.dataSources.map((source) =>
            source.id === id
              ? { ...source, progress, status: progress >= 100 ? 'completed' : 'processing' }
              : source,
          ),
        }))
      },

      completeProcessing: (id) => {
        set((state) => ({
          dataSources: state.dataSources.map((source) =>
            source.id === id
              ? {
                  ...source,
                  status: 'completed',
                  progress: 100,
                  last_processed: new Date().toISOString(),
                }
              : source,
          ),
        }))
      },

      simulateRealTimeUpdates: () => {
        const interval = setInterval(() => {
          const { dataSources } = get()
          const processingSources = dataSources.filter((s) => s.status === 'processing')
          if (processingSources.length > 0) {
            const randomSource =
              processingSources[Math.floor(Math.random() * processingSources.length)]
            const newProgress = Math.min(
              100,
              randomSource.progress + Math.random() * 10 + 2,
            )
            get().updateProgress(randomSource.id, newProgress)
          }
        }, 3000)
        return () => clearInterval(interval)
      },
    }),
    {
      name: 'data-analysis-storage',
      partialize: (state) => ({ uploadedFiles: state.uploadedFiles }),
    },
  ),
)
