"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  FileText, 
  Upload, 
  Trash, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  XCircle,
  File,
  RefreshCw
} from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useDataAnalysisStore } from "@/lib/data-analysis-store"

const fileIconMap = {
  'text/csv': File,
  'application/vnd.ms-excel': File,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': File,
  'text/plain': File
}

const statusConfig = {
  uploaded: {
    label: 'Uploaded',
    className: 'status-medium',
    icon: Clock
  },
  analyzing: {
    label: 'Analyzing',
    className: 'status-processing',
    icon: RefreshCw
  },
  completed: {
    label: 'Completed',
    className: 'status-success',
    icon: CheckCircle2
  },
  failed: {
    label: 'Failed',
    className: 'status-high',
    icon: XCircle
  }
}

export function UploadedDocumentsPanel() {
  const { 
    uploadedFiles, 
    isUploading, 
    isAnalyzing,
    uploadFiles, 
    removeFile, 
    toggleFileSelection, 
    selectAllFiles,
    analyzeSelectedFiles,
    error
  } = useDataAnalysisStore()
  
  const fileInputRef = useRef(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleFileUpload = async () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = async (event) => {
    const files = event.target.files
    if (files && files.length > 0) {
      await uploadFiles(files)
      // Reset input value to allow selecting the same file again
      event.target.value = ''
    }
  }

  const handleAnalyze = async () => {
    await analyzeSelectedFiles()
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`
    return date.toLocaleDateString()
  }

  const selectedFilesCount = uploadedFiles.filter(f => f.selected && f.status === 'uploaded').length
  const hasSelectedFiles = selectedFilesCount > 0

  return (
    <Card className="col-span-1">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-5 text-primary" />
              Uploaded Documents
            </CardTitle>
            <CardDescription className="mt-1">
              Manage and analyze your uploaded data files
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              onClick={handleFileUpload} 
              disabled={isUploading}
              className="btn-primary"
            >
              <Upload className="mr-2 size-4" />
              {isUploading ? "Uploading..." : "Upload Data"}
            </Button>
            <Button 
              size="sm" 
              onClick={handleAnalyze}
              disabled={!hasSelectedFiles || isAnalyzing}
              variant="default"
            >
              <RefreshCw className={`mr-2 size-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              {isAnalyzing ? "Analyzing..." : `Analyze ${selectedFilesCount}`}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".csv,.xls,.xlsx,.txt"
          onChange={handleFileSelect}
          className="hidden"
        />

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}
        
        {!mounted ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 border rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="skeleton size-5 rounded" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-5 w-48 rounded" />
                    <div className="skeleton h-4 w-24 rounded" />
                    <div className="skeleton h-2 w-full rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : uploadedFiles.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            <FileText className="size-12 mx-auto mb-4 opacity-50" />
            <p>No files uploaded yet. Click "Upload Data" to get started.</p>
            <p className="mt-2 text-xs text-muted-foreground/80">
              Supports CSV, XLS, and XLSX exports. Everything flows straight into the ML analysis pipeline once you click Analyze.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Select all checkbox */}
            <div className="flex items-center justify-between p-2 border-b">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="select-all"
                  checked={uploadedFiles.length > 0 && uploadedFiles.every(f => f.selected)}
                  onCheckedChange={(checked) => selectAllFiles(!!checked)}
                  disabled={isAnalyzing}
                />
                <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                  Select All
                </label>
              </div>
              <span className="text-xs text-muted-foreground">
                {uploadedFiles.length} files
              </span>
            </div>

            {uploadedFiles.map((file) => {
              const Icon = fileIconMap[file.type] || File
              const statusInfo = statusConfig[file.status]
              const StatusIcon = statusInfo.icon
              
              return (
                <div
                  key={file.id}
                  className={`group flex items-start gap-4 rounded-lg border border-border bg-card p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
                    file.status === 'analyzing' ? 'pointer-events-none opacity-75' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={file.selected}
                      onCheckedChange={() => toggleFileSelection(file.id)}
                      disabled={file.status !== 'uploaded' || isAnalyzing}
                    />
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                      <Icon className="size-5 text-primary" />
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate">{file.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <span>{formatFileSize(file.size)}</span>
                          <span>•</span>
                          <span>{formatTimestamp(file.uploadTimestamp)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${statusInfo.className} gap-1`}>
                          <StatusIcon className={`size-3 ${file.status === 'analyzing' ? 'animate-spin' : ''}`} />
                          {statusInfo.label}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFile(file.id)}
                          disabled={file.status === 'analyzing' || isAnalyzing}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash className="size-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Analysis progress */}
                    {file.status === 'analyzing' && file.analysisProgress !== undefined && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Processing records...
                          </span>
                          <span className="font-medium">
                            {file.recordsProcessed?.toLocaleString() || 0} records
                          </span>
                        </div>
                        <div className="relative">
                          <Progress 
                            value={file.analysisProgress} 
                            className="h-2 transition-all duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-pulse" />
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {Math.round(file.analysisProgress)}% complete
                        </div>
                      </div>
                    )}
                    
                    {/* Error message */}
                    {file.status === 'failed' && file.error && (
                      <div className="text-xs text-destructive bg-destructive/10 p-2 rounded">
                        {file.error}
                      </div>
                    )}
                    
                    {/* Completion info */}
                    {file.status === 'completed' && file.recordsProcessed && (
                      <div className="text-xs text-green-600 bg-green-50 dark:bg-green-950/20 p-2 rounded">
                        ✓ Successfully processed {file.recordsProcessed.toLocaleString()} records
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
