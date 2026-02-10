"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, Clock, FileText, MessageSquare, Play, ShoppingCart, Target } from "lucide-react"

const ACTION_META = {
  email_campaign: { label: "Retention", icon: MessageSquare },
  inventory_order: { label: "Purchase", icon: ShoppingCart },
  lead_assignment: { label: "Lead", icon: Target },
}

const FALLBACK_ACTIONS = [
  {
    id: "retention-1",
    apiId: "retention-1",
    type: "email_campaign",
    title: "Customer Retention Campaign",
    context: "Sarah Chen • Enterprise plan",
    description: "High-value customer (LTV: $12,500) showing 40% engagement decline",
    aiConfidence: 94,
    estimatedImpact: "$12,500 revenue protected",
    urgency: "high",
    generatedContent:
      "Hi Sarah,\n\nWe've noticed you haven't been as active lately and wanted to reach out personally. As one of our valued customers, we'd like to offer you an exclusive 20% discount on your annual plan renewal.\n\nYour success matters to us. Can we schedule a call to discuss how we can better serve your needs?\n\nBest regards,\nAutoOps Success Team",
  },
  {
    id: "purchase-1",
    apiId: "purchase-1",
    type: "inventory_order",
    title: "Inventory Purchase Order",
    context: "Widget Pro 3000 (SKU-2891)",
    description: "Stock predicted to run out in 4 days based on current sales velocity",
    aiConfidence: 87,
    estimatedImpact: "Prevent $24,000 lost revenue",
    urgency: "medium",
    generatedContent:
      "Purchase Order Draft\n\nSupplier: TechSupply Inc.\nProduct: Widget Pro 3000\nQuantity: 500 units\nUnit Price: $45.00\nTotal: $22,500.00\nRequested delivery: 3-5 business days\nShipping address: Warehouse A, 123 Industrial Blvd",
  },
  {
    id: "lead-1",
    apiId: "lead-1",
    type: "lead_assignment",
    title: "Priority Lead Assignment",
    context: "TechCorp Inc. • Enterprise prospect",
    description: "92% conversion probability based on behavior analysis and company fit",
    aiConfidence: 91,
    estimatedImpact: "$45,000 potential deal",
    urgency: "high",
    generatedContent:
      "Lead Assignment\n\nCompany: TechCorp Inc.\nContact: Mike Johnson, VP of Operations\nScore: 92/100\nSignals:\n- Visited pricing page 5 times\n- Downloaded product comparison guide\n- Company size matches ICP\n\nAction: Schedule demo within 48 hours\nAssigned to: Jessica Wong (Senior AE)",
  },
]

const URGENCY_STYLES = {
  high: "border-destructive/20 bg-destructive/5",
  medium: "border-amber-500/20 bg-amber-500/5",
  low: "border-accent/20 bg-accent/5",
}

const formatImpact = (value) => {
  if (!value) return "Impact pending"
  const numericValue = Number(value)
  if (Number.isFinite(numericValue)) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(numericValue)
  }
  return value
}

const deriveUrgency = (priority) => {
  const normalized = priority?.toLowerCase()
  if (normalized === "high") return "high"
  if (normalized === "medium") return "medium"
  return "low"
}

const buildActionPreview = (action) => {
  const type = (action.action_type in ACTION_META ? action.action_type : "email_campaign")
  const urgency = deriveUrgency(action.priority)
  const aiConfidence = urgency === "high" ? 92 : urgency === "medium" ? 84 : 78
  const draft = typeof action.result?.draft === "string" ? action.result.draft : action.description

  return {
    id: action.id,
    apiId: action.id,
    type,
    title: action.title,
    context: action.prediction_id ? `Linked to insight ${action.prediction_id}` : "AI recommended action",
    description: action.description,
    aiConfidence,
    estimatedImpact: formatImpact(action.expected_impact),
    urgency,
    generatedContent: draft ?? "",
  }
}

export function ActionExecutionPanel() {
  const { toast } = useToast()
  const [pendingActions, setPendingActions] = useState(FALLBACK_ACTIONS)
  const [selectedActionId, setSelectedActionId] = useState(FALLBACK_ACTIONS[0]?.id ?? "")
  const [editedContent, setEditedContent] = useState(FALLBACK_ACTIONS[0]?.generatedContent ?? "")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    let isMounted = true

    const fetchPendingActions = async () => {
      try {
        const response = await fetch("/api/actions?status=pending")
        if (!response.ok) throw new Error("Failed to fetch actions")
        const data = await response.json()
        if (!Array.isArray(data) || !data.length) {
          if (isMounted) {
            setPendingActions([])
            setSelectedActionId("")
            setEditedContent("")
          }
          return
        }

        const mapped = data.map(buildActionPreview)
        if (isMounted) {
          setPendingActions(mapped)
          setSelectedActionId(mapped[0].id)
          setEditedContent(mapped[0].generatedContent)
        }
      } catch (error) {
        console.warn("[ActionExecutionPanel] Falling back to templates", error)
      }
    }

    fetchPendingActions()
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!pendingActions.length) return
    if (!pendingActions.some((action) => action.id === selectedActionId)) {
      const next = pendingActions[0]
      setSelectedActionId(next.id)
      setEditedContent(next.generatedContent)
    }
  }, [pendingActions, selectedActionId])

  const selectedAction = pendingActions.find((action) => action.id === selectedActionId)

  const handleTabChange = (value) => {
    const action = pendingActions.find((item) => item.id === value)
    if (!action) return
    setSelectedActionId(action.id)
    setEditedContent(action.generatedContent)
  }

  const mutateAction = async (status, successMessage) => {
    if (!selectedAction) return
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/actions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedAction.apiId, status }),
      })

      if (!response.ok) throw new Error("Failed to update action")

      setPendingActions((prev) => prev.filter((action) => action.id !== selectedAction.id))
      toast({
        title: successMessage,
        description: `${selectedAction.title} is now ${status === "completed" ? "completed" : "on hold"}.`,
      })
    } catch (error) {
      console.error("[ActionExecutionPanel] Unable to update action", error)
      toast({
        title: "Unable to update action",
        description: "Please retry in a few seconds.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveDraft = () => {
    if (!selectedAction) return
    setPendingActions((prev) =>
      prev.map((action) => (action.id === selectedAction.id ? { ...action, generatedContent: editedContent } : action))
    )
    toast({ title: "Draft saved", description: "Your edits are stored locally for review." })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="size-5 text-amber-500" />
            Pending Approvals
          </CardTitle>
          <CardDescription>Review and approve AI-generated actions before execution</CardDescription>
        </CardHeader>
        <CardContent>
          {!pendingActions.length || !selectedAction ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              All automated actions are up to date. New approvals will appear here as soon as AI recommendations arrive.
            </div>
          ) : (
            <Tabs value={selectedActionId} onValueChange={handleTabChange} className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                {pendingActions.map((action) => {
                  const Icon = ACTION_META[action.type].icon
                  return (
                    <TabsTrigger key={action.id} value={action.id} className="gap-2">
                      <Icon className="size-4" />
                      {ACTION_META[action.type].label}
                    </TabsTrigger>
                  )
                })}
              </TabsList>

              <TabsContent value={selectedAction.id} className="space-y-6">
                <div className={`rounded-lg border p-4 ${URGENCY_STYLES[selectedAction.urgency]}`}>
                  <div className="flex items-start gap-3">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-background/50">
                      {(() => {
                        const Icon = ACTION_META[selectedAction.type].icon
                        return <Icon className="size-6 text-primary" />
                      })()}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold">{selectedAction.title}</h3>
                          <p className="text-sm text-muted-foreground">{selectedAction.context}</p>
                        </div>
                        <Badge variant="outline" className="gap-1 text-xs">
                          <AlertCircle className="size-3" />
                          {selectedAction.urgency.toUpperCase()} PRIORITY
                        </Badge>
                      </div>
                      <p className="text-sm leading-relaxed text-foreground/90">{selectedAction.description}</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-lg border bg-background/60 p-4 text-center">
                    <p className="text-xs text-muted-foreground">AI Confidence</p>
                    <p className="text-2xl font-semibold text-primary">{selectedAction.aiConfidence}%</p>
                  </div>
                  <div className="rounded-lg border bg-background/60 p-4 text-center">
                    <p className="text-xs text-muted-foreground">Estimated Impact</p>
                    <p className="text-2xl font-semibold">{selectedAction.estimatedImpact}</p>
                  </div>
                  <div className="rounded-lg border bg-background/60 p-4 text-center">
                    <p className="text-xs text-muted-foreground">Status After Approval</p>
                    <p className="text-2xl font-semibold text-emerald-500">Ready</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="action-content">Review & Edit</Label>
                  <Textarea
                    id="action-content"
                    className="min-h-[220px]"
                    value={editedContent}
                    onChange={(event) => setEditedContent(event.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Tailor the draft before moving the action forward.</p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button
                    className="gap-2"
                    disabled={isSubmitting}
                    onClick={() => mutateAction("completed", "Action approved and executed")}
                  >
                    <Play className="size-4" />
                    Approve & Execute
                  </Button>
                  <Button
                    variant="secondary"
                    className="gap-2"
                    disabled={isSubmitting}
                    onClick={() => mutateAction("on_hold", "Action moved to review queue")}
                  >
                    <Clock className="size-4" />
                    Hold for Review
                  </Button>
                  <Button variant="outline" className="gap-2" onClick={handleSaveDraft} disabled={!editedContent}>
                    <FileText className="size-4" />
                    Save Draft
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
