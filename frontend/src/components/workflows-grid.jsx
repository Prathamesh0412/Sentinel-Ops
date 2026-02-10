"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { 
  TrendingDown, 
  Package, 
  Users, 
  Mail,
  FileText,
  Calendar,
  BarChart3,
  MessageSquare,
  Settings,
  Play,
  X,
  Zap,
  Target,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react"
import { useState, useEffect } from "react"
import { useWorkflows, useAppStore, useIsProcessing } from "@/lib/store"
import { NoSSR } from "@/components/no-ssr"

const iconMap = {
  customer_churn: TrendingDown,
  inventory: Package,
  lead_scoring: Users,
  email_campaign: Mail,
  report_generation: FileText,
  meeting_scheduler: Calendar,
  analytics: BarChart3,
  feedback_analysis: MessageSquare,
}

export function WorkflowsGrid() {
  const workflows = useWorkflows()
  const { toggleWorkflow, executeWorkflow } = useAppStore()
  const isProcessing = useIsProcessing()
  const [mounted, setMounted] = useState(false)
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleToggleWorkflow = async (id, isActive) => {
    await toggleWorkflow(id, isActive)
  }

  const handleExecuteWorkflow = async (id) => {
    await executeWorkflow(id)
  }

  const toggleExpanded = (id) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const getStatusIcon = (workflow) => {
    if (workflow.is_executing) {
      return <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    }
    if (workflow.is_active) {
      return <CheckCircle2 className="w-4 h-4 text-green-500" />
    }
    return <X className="w-4 h-4 text-gray-500" />
  }

  const getStatusColor = (workflow) => {
    if (workflow.is_executing) return 'text-blue-500'
    if (workflow.is_active) return 'text-green-500'
    return 'text-gray-500'
  }

  if (!mounted) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="opacity-60">
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <div className="size-6 bg-muted-foreground/20 rounded" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-3 w-full bg-muted animate-pulse rounded" />
                <div className="h-2 w-20 bg-muted animate-pulse rounded" />
                <div className="flex justify-between">
                  <div className="h-8 w-20 bg-muted animate-pulse rounded" />
                  <div className="h-8 w-24 bg-muted animate-pulse rounded" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <NoSSR fallback={
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="opacity-60">
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <div className="size-6 bg-muted-foreground/20 rounded" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-3 w-full bg-muted animate-pulse rounded" />
                <div className="h-2 w-20 bg-muted animate-pulse rounded" />
                <div className="flex justify-between">
                  <div className="h-8 w-20 bg-muted animate-pulse rounded" />
                  <div className="h-8 w-24 bg-muted animate-pulse rounded" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    }>
      <div className="grid gap-6 md:grid-cols-2">
        {workflows.length === 0 ? (
          <Card className="col-span-2">
            <CardContent className="py-12 text-center text-muted-foreground">
              No workflows configured yet.
            </CardContent>
          </Card>
        ) : (
          workflows.map((workflow) => {
            const Icon = iconMap[workflow.trigger_type] || Zap
            const isActive = workflow.is_active
            const isExpanded = expandedId === workflow.id
            
            return (
              <Card key={workflow.id} className={`transition-all duration-200 ${isActive ? "" : "opacity-60"} ${isExpanded ? "ring-2 ring-primary/20" : ""}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="size-6 text-primary" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <h4 className="font-semibold">{workflow.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {workflow.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-accent/10">
                        <Target className="mr-1 size-3" />
                        {workflow.total_executions} Executed
                      </Badge>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {isActive ? "Active" : "Paused"}
                        </span>
                        <Switch
                          checked={isActive}
                          onCheckedChange={(checked) => handleToggleWorkflow(workflow.id, checked)}
                          disabled={isProcessing}
                        />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Success Rate</span>
                      <span className="font-medium">{workflow.success_rate}%</span>
                    </div>
                    
                    {/* Success Rate Progress Bar */}
                    <div className="space-y-2">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            workflow.success_rate >= 90 ? 'bg-green-500' :
                            workflow.success_rate >= 70 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${workflow.success_rate}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Last Execution</span>
                      <span className="font-medium">
                        {workflow.last_execution 
                          ? new Date(workflow.last_execution).toLocaleString()
                          : 'Never'
                        }
                      </span>
                    </div>

                    {/* Expandable execution logs */}
                    {isExpanded && (
                      <div className="mt-4 p-3 bg-muted/50 rounded-lg space-y-2">
                        <h5 className="text-sm font-medium">Execution Details</h5>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div className="flex justify-between">
                            <span>Status:</span>
                            <span className={getStatusColor(workflow)}>
                              {workflow.is_executing ? 'Executing...' : isActive ? 'Ready' : 'Paused'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Trigger Type:</span>
                            <span>{workflow.trigger_type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Actions:</span>
                            <span>{Array.isArray(workflow.actions) ? workflow.actions.length : 0} configured</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => alert('Configuration settings coming soon!')}
                      >
                        <Settings className="mr-2 size-4" />
                        Configure
                      </Button>
                      <Button 
                        size="sm" 
                        disabled={!isActive || workflow.is_executing || isProcessing} 
                        onClick={() => isActive && handleExecuteWorkflow(workflow.id)}
                      >
                        {workflow.is_executing ? (
                          <>
                            <div className="mr-2 size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                            Executing...
                          </>
                        ) : isActive ? (
                          <>
                            <Play className="mr-2 size-4" />
                            Run Now
                          </>
                        ) : (
                          <>
                            <X className="mr-2 size-4" />
                            Paused
                          </>
                        )}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => toggleExpanded(workflow.id)}
                        className="text-xs"
                      >
                        {isExpanded ? 'Hide Details' : 'Show Details'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </NoSSR>
  )
}
