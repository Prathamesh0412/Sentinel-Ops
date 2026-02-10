import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useProductUploadStore = create()(
  persist(
    (set, get) => ({
      // Initial state
      uploadedFiles: [],
      isUploading: false,
      isProcessing: false,

      // File management actions
      setUploadedFiles: (files) => set({ uploadedFiles: files }),

      uploadFiles: async (files) => {
        console.log('=== NEW UPLOAD FILES FUNCTION CALLED ===')
        console.log('Files received:', files.length)
        set({ isUploading: true })
        
        const newFiles = []
        const errors = []
        const uploadBatchId = Date.now()
        const randomSuffix = Math.random().toString(36).substr(2, 9)

        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          const fileId = `prod_file_${uploadBatchId}_${randomSuffix}_${i}`
          
          // Debug logging
          console.log(`Processing file: ${file.name}`)
          console.log(`File MIME type: ${file.type}`)
          console.log(`File size: ${file.size}`)
          
          // Validate file type - check both MIME type and extension
          const allowedTypes = [
            'text/csv',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/json'
          ]
          
          const allowedExtensions = ['.csv', '.xls', '.xlsx', '.json']
          const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
          
          console.log(`File extension: ${fileExtension}`)
          console.log(`MIME type allowed: ${allowedTypes.includes(file.type)}`)
          console.log(`Extension allowed: ${allowedExtensions.includes(fileExtension)}`)
          
          if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
            errors.push(`${file.name}: Unsupported file type`)
            console.log(`File rejected: ${file.name}`)
            continue
          }

          // Validate file size (max 10MB)
          if (file.size > 10 * 1024 * 1024) {
            errors.push(`${file.name}: File too large (max 10MB)`)
            continue
          }

          newFiles.push({
            id: fileId,
            name: file.name,
            type: file.type,
            size: file.size,
            uploadTimestamp: new Date().toISOString(),
            status: 'uploading',
            selected: true,
            processingProgress: 0,
            recordsProcessed: 0,
            totalRecords: 0
          })
        }

        if (errors.length > 0) {
          console.error('Upload errors:', errors)
          // Also log file details for debugging
          Array.from(files).forEach(file => {
            console.log(`File: ${file.name}, Type: ${file.type}, Size: ${file.size}`)
          })
        }

        set(state => ({
          uploadedFiles: [...newFiles, ...state.uploadedFiles],
          isUploading: false
        }))

        // Actually upload files to backend
        try {
          const formData = new FormData()
          Array.from(files).forEach(file => {
            if (newFiles.find(f => f.name === file.name)) {
              formData.append('files', file)
            }
          })

          const response = await fetch('/api/upload/files', {
            method: 'POST',
            body: formData
          })

          if (response.ok) {
            const result = await response.json()
            console.log('Upload successful:', result)
            
            // Mark files as completed
            set(state => ({
              uploadedFiles: state.uploadedFiles.map(file =>
                newFiles.find(nf => nf.id === file.id)
                  ? { ...file, status: 'completed' }
                  : file
              )
            }))
          } else {
            throw new Error('Upload failed')
          }
        } catch (error) {
          console.error('Upload error:', error)
          // Mark files as error
          set(state => ({
            uploadedFiles: state.uploadedFiles.map(file =>
              newFiles.find(nf => nf.id === file.id)
                ? { ...file, status: 'error', error: 'Upload failed' }
                : file
            )
          }))
        }
      },

      removeFile: (id) => {
        set(state => ({
          uploadedFiles: state.uploadedFiles.filter(file => file.id !== id)
        }))
      },

      toggleFileSelection: (id) => {
        set(state => ({
          uploadedFiles: state.uploadedFiles.map(file =>
            file.id === id ? { ...file, selected: !file.selected } : file
          )
        }))
      },

      selectAllFiles: (selected) => {
        set(state => ({
          uploadedFiles: state.uploadedFiles.map(file => ({ ...file, selected }))
        }))
      },

      // Processing actions
      processSelectedFiles: async () => {
        const { uploadedFiles } = get()
        const selectedFiles = uploadedFiles.filter(file => file.selected && file.status === 'completed')
        
        if (selectedFiles.length === 0) return

        set({ isProcessing: true })

        try {
          const response = await fetch('/api/upload/process', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              fileIds: selectedFiles.map(f => f.id),
              fileNames: selectedFiles.map(f => f.name)
            })
          })

          if (response.ok) {
            const result = await response.json()
            console.log('Processing successful:', result)

            // Update all selected files as processed
            for (const file of selectedFiles) {
              get().updateProcessingProgress(file.id, 100, result.recordsProcessed || 150)
              get().completeFileProcessing(file.id, true)
            }
          } else {
            throw new Error('Processing failed')
          }
        } catch (error) {
          console.error('Processing error:', error)
          // Mark all selected files as error
          for (const file of selectedFiles) {
            get().completeFileProcessing(file.id, false, error instanceof Error ? error.message : 'Unknown error')
          }
        }

        set({ isProcessing: false })
      },

      simulateFileProcessing: async (fileId) => {
        const totalSteps = 100
        const stepDelay = 50 // 50ms per step for smooth animation

        for (let step = 0; step <= totalSteps; step++) {
          await new Promise(resolve => setTimeout(resolve, stepDelay))
          get().updateProcessingProgress(fileId, step, Math.floor((step / 100) * 150))
        }

        // Generate mock parsed data
        const mockParsedData = get().generateMockParsedData()
        get().completeFileProcessing(fileId, true, undefined, mockParsedData)
      },

      generateMockParsedData: () => {
        return []
      },
      
      updateProcessingProgress: (fileId, progress, recordsProcessed) => {
        set(state => ({
          uploadedFiles: state.uploadedFiles.map(f =>
            f.id === fileId ? { ...f, processingProgress: progress, recordsProcessed } : f
          )
        }))
      },
      
      completeFileProcessing: (fileId, success, error, parsedData) => {
        set(state => ({
          uploadedFiles: state.uploadedFiles.map(f =>
            f.id === fileId ? { 
              ...f, 
              status: success ? 'completed' : 'error', 
              error,
              parsedData
            } : f
          )
        }))
      }
    })
  )
)