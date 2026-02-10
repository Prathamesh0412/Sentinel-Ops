"use client"

import { RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

export function LoadingState({ 
  message = "Loading...", 
  size = "md", 
  className 
}) {
  const sizeClasses = {
    sm: "size-4",
    md: "size-6", 
    lg: "size-8"
  }

  const textClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  }

  return (
    <div className={cn("flex items-center justify-center gap-2 text-muted-foreground", className)}>
      <RefreshCw className={cn("animate-spin", sizeClasses[size])} />
      <span className={textClasses[size]}>{message}</span>
    </div>
  )
}

export function FullPageLoading({ message = "Loading..." }) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoadingState message={message} size="lg" />
    </div>
  )
}

export function EmptyState({ 
  icon: Icon,
  title,
  description,
  action
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-muted/50 mb-4">
        <Icon className="size-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-md">{description}</p>
      {action}
    </div>
  )
}
