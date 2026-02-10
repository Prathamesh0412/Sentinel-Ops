"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Zap, Plus, Settings } from "lucide-react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useStore } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"

export function WorkflowsHeader() {
  const { createWorkflow, isProcessing } = useStore()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  // dialog state
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [active, setActive] = useState(true)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const newWorkflow = await createWorkflow({ name: name || undefined, description: description || undefined, is_active: active })
      toast({ title: "Success", description: `Workflow \"${newWorkflow.name}\" created`, variant: "default" })
      setOpen(false)
      // reset form
      setName("")
      setDescription("")
      setActive(true)
    } catch (err) {
      console.error(err)
      toast({ title: "Error", description: "Unable to create workflow", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-balance">
          AI Workflow Automation
        </h1>
        <p className="mt-2 text-lg text-muted-foreground text-pretty">
          Configure and manage automated business workflows
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="outline" className="bg-primary/10">
          <Zap className="mr-1 size-3" />
          24 Active
        </Badge>
        <Button variant="outline" size="sm">
          <Settings className="mr-2 size-4" />
          Settings
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" disabled={loading || isProcessing}>
              <Plus className="mr-2 size-4" />
              New Workflow
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Workflow</DialogTitle>
              <DialogDescription>Provide details to create a new workflow.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4 py-2">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Workflow name" required />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description" />
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={active} onCheckedChange={(v) => setActive(!!v)} />
                <span className="text-sm">Active</span>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" type="button">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={loading || isProcessing}>{loading ? 'Creating...' : 'Create'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
