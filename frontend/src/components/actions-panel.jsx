"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Target, CheckCircle2, Clock, Play, X, MessageSquare, FileText, ShoppingCart, TrendingUp, Mail } from "lucide-react"
import { useState, useEffect } from "react"
import { useActions, useAppStore, useIsProcessing } from "@/lib/store"

const iconMap = {
  email_campaign: MessageSquare,
  inventory: ShoppingCart,
  lead_scoring: Target,
  report_generation: FileText,
  pricing_adjustment: TrendingUp,
  customer_email: Mail,
}

export function ActionsPanel() {
  const actions = useActions()
  const { approveAction, holdAction, updateActionMessage } = useAppStore()
  const isProcessing = useIsProcessing()
  const [activeTab, setActiveTab] = useState("pending")
  const [editingId, setEditingId] = useState(null)
  const [editingMessage, setEditingMessage] = useState("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Filter actions by status
  const executedActions = actions.filter(action => action.status === 'executed').slice(0, 4)
  const pendingActions = actions.filter(action => action.status === 'pending')

  const handleApprove = async (id) => {
    await approveAction(id)
    // Show success feedback
    alert('Action executed successfully!')
  }

  const handleHold = async (id) => {
    await holdAction(id)
    // Show feedback
    alert('Action put on hold')
  }

  const startEditing = (action) => {
    setEditingId(action.id)
    setEditingMessage(action.message || '')
  }

  const saveMessage = (id) => {
    updateActionMessage(id, editingMessage)
    setEditingId(null)
    setEditingMessage("")
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditingMessage("")
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="size-5 text-primary" />
              Automated Actions
            </CardTitle>
            <CardDescription className="mt-1">
              AI-executed solutions and pending approvals
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-accent/10">
              <CheckCircle2 className="mr-1 size-3" />
              {executedActions.length + pendingActions.length} Active
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="executed" className="gap-2">
              <CheckCircle2 className="size-4" />
              Executed ({executedActions.length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="size-4" />
              Pending ({pendingActions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="executed" className="mt-4 space-y-3">
            {!mounted ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Loading actions...
              </div>
            ) : executedActions.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No executed actions yet.
              </div>
            ) : (
              executedActions.map((action) => {
                const Icon = iconMap[action.action_type] || Target
                return (
                  <div
                    key={action.id}
                    className="flex items-start gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/5"
                  >
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                      <Icon className="size-6 text-accent" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{action.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {action.description}
                          </p>
                        </div>
                        <Badge variant="outline" className="bg-accent/10 text-accent">
                          <CheckCircle2 className="mr-1 size-3" />
                          Complete
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {action.executed_at ? new Date(action.executed_at).toLocaleString() : 'Just now'}
                        </span>
                        <span className="font-medium text-primary">{action.expected_impact}</span>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </TabsContent>

          <TabsContent value="pending" className="mt-4 space-y-3">
            {!mounted ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Loading pending actions...
              </div>
            ) : pendingActions.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No pending actions. All automated tasks are running smoothly.
              </div>
            ) : (
              pendingActions.map((action) => {
                const Icon = iconMap[action.action_type] || Target
                return (
                  <div
                    key={action.id}
                    className="flex items-start gap-4 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4"
                  >
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                      <Icon className="size-6 text-amber-500" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{action.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {action.description}
                          </p>
                        </div>
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-500">
                          <Clock className="mr-1 size-3" />
                          {action.priority}
                        </Badge>
                      </div>
                      
                      {/* Message editing section */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Message Preview:
                          </span>
                          {editingId !== action.id && (
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => startEditing(action)}
                              className="text-xs h-6"
                            >
                              Edit
                            </Button>
                          )}
                        </div>
                        
                        {editingId === action.id ? (
                          <div className="space-y-2">
                            <Textarea
                              value={editingMessage}
                              onChange={(e) => setEditingMessage(e.target.value)}
                              className="min-h-[80px] text-sm"
                              placeholder="Enter custom message..."
                            />
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                onClick={() => saveMessage(action.id)}
                                disabled={isProcessing}
                              >
                                Save
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={cancelEditing}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 bg-muted/50 rounded-lg text-sm">
                            {action.message || 'Default message will be sent...'}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Impact: {action.expected_impact}
                        </span>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleHold(action.id)}
                            disabled={isProcessing}
                          >
                            <X className="mr-2 size-4" />
                            Hold
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => handleApprove(action.id)}
                            disabled={isProcessing}
                          >
                            <Play className="mr-2 size-4" />
                            Approve & Execute
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
