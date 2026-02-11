"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Upload, 
  FileText, 
  Trash, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  XCircle,
  File,
  RefreshCw,
  Database,
  TrendingUp
} from "lucide-react"
import { useDataAnalysisStore } from "@/lib/data-analysis-store"
import { useToast } from "@/hooks/use-toast"

const fileIconMap = {
  'text/csv': File,
  'application/vnd.ms-excel': File,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': File,
  'text/plain': FileText
}

// Extension-based icon mapping for when MIME type is not detected correctly
const getFileIcon = (fileName, mimeType) => {
  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'))
  
  if (extension === '.csv' || extension === '.xls' || extension === '.xlsx' || extension === '.txt') {
    return File
  }
  
  return fileIconMap[mimeType] || File
}

const statusConfig = {
  uploaded: {
    label: 'Ready',
    className: 'status-processing',
    icon: Clock
  },
  analyzing: {
    label: 'Analyzing',
    className: 'status-processing',
    icon: RefreshCw
  },
  completed: {
    label: 'Synced',
    className: 'status-success',
    icon: CheckCircle2
  },
  failed: {
    label: 'Failed',
    className: 'status-error',
    icon: AlertCircle
  }
}

export function ProductUploadPanel() {
  const { 
    uploadedFiles, 
    isUploading, 
    isAnalyzing,
    uploadFiles,
    removeFile,
    toggleFileSelection,
    selectAllFiles,
    analyzeSelectedFiles,
    analysisSummary,
    error
  } = useDataAnalysisStore()
  
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleFileSelect = useCallback((files) => {
    uploadFiles(files)
  }, [uploadFiles])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files)
    }
  }, [handleFileSelect])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleProcessFiles = async () => {
    try {
      await analyzeSelectedFiles()
      toast({
        title: "Analysis Complete",
        description: "ML insights refreshed from the uploaded data.",
      })
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "There was an error processing your files. Please try again.",
        variant: "destructive"
      })
    }
  }

  const readyForAnalysisCount = uploadedFiles.filter(file => file.selected && file.status === 'uploaded').length
  const completedFilesCount = uploadedFiles.filter(file => file.status === 'completed').length
  const hasProcessableFiles = readyForAnalysisCount > 0

  if (!mounted) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-48 bg-muted rounded" />
            <div className="h-32 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="size-5 text-primary" />
              Product Data Upload
            </CardTitle>
            <CardDescription className="mt-1">
              Upload sales, inventory, or product files to update intelligence dashboard
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-primary/5">
            <FileText className="mr-1 size-3" />
            {uploadedFiles.length} Files
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="flex flex-col items-center space-y-4">
            <div className={`p-4 rounded-full ${
              isDragOver ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}>
              <Upload className="size-6" />
            </div>
            <div>
              <p className="text-lg font-medium">Drop files here or click to browse</p>
              <p className="text-sm text-muted-foreground mt-1">
                Supports CSV, Excel, and TXT files up to 10MB
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Upload className="mr-2 size-4" />
              {isUploading ? "Uploading..." : "Select Files"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".csv,.xlsx,.xls,.txt"
              className="hidden"
              onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
            />
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* File List */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Uploaded Files</span>
                <Badge variant="secondary">
                  {completedFilesCount} synced · {readyForAnalysisCount} ready
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => selectAllFiles(true)}
                  disabled={isAnalyzing}
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => selectAllFiles(false)}
                  disabled={isAnalyzing}
                >
                  Deselect All
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {uploadedFiles.map((file) => {
                const statusMeta = statusConfig[file.status] || statusConfig.uploaded
                const StatusIcon = statusMeta.icon
                const FileIcon = getFileIcon(file.name, file.type)
                
                return (
                  <div
                    key={file.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      file.selected ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={file.selected}
                      onChange={() => toggleFileSelection(file.id)}
                      disabled={isAnalyzing || file.status === 'analyzing'}
                      className="rounded"
                    />
                    
                    <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                      <FileIcon className="size-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${statusMeta.className}`}
                        >
                          <StatusIcon className="mr-1 size-3" />
                          {statusMeta.label}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {(file.size / 1024).toFixed(1)} KB
                        </span>
                        {typeof file.analysisProgress === 'number' && file.status === 'analyzing' && (
                          <div className="flex items-center gap-2 flex-1">
                            <Progress 
                              value={file.analysisProgress} 
                              className="flex-1 h-1" 
                            />
                            <span className="text-xs text-muted-foreground">
                              {file.analysisProgress}%
                            </span>
                          </div>
                        )}
                        {file.recordsProcessed && (
                          <span className="text-xs text-muted-foreground">
                            {file.recordsProcessed} records
                          </span>
                        )}
                      </div>
                      
                      {file.error && (
                        <p className="text-xs text-red-500 mt-1">{file.error}</p>
                      )}
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                      disabled={isAnalyzing}
                    >
                      <Trash className="size-4" />
                    </Button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Process Button */}
        {hasProcessableFiles && (
          <div className="flex justify-center">
            <Button
              onClick={handleProcessFiles}
              disabled={isAnalyzing || readyForAnalysisCount === 0}
              className="gap-2"
              size="lg"
            >
              <TrendingUp className={`mr-2 size-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              {isAnalyzing ? "Analyzing..." : `Analyze ${readyForAnalysisCount} File${readyForAnalysisCount > 1 ? 's' : ''}`}
            </Button>
          </div>
        )}

        {/* Instructions */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Upload sales reports, inventory files, or product cost sheets</p>
          <p>• Launch ML analysis to update sale velocity, stock runway, and demand clusters</p>
          <p>• Dashboard refreshes instantly after each run ({analysisSummary?.generatedAt ? `last run ${new Date(analysisSummary.generatedAt).toLocaleString()}` : 'awaiting first analysis'})</p>
        </div>
      </CardContent>
    </Card>
  )
}
