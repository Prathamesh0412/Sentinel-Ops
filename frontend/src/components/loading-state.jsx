import { RefreshCw } from "lucide-react"

export function LoadingState({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <RefreshCw className="size-8 animate-spin text-primary" />
      <p className="mt-4 text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
