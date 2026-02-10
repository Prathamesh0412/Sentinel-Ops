"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MessageSquare, Users, Zap, MoreVertical, Activity } from "lucide-react"
import { useState, useEffect } from "react"
import { NoSSR } from "@/components/no-ssr"

export function DashboardNav() {
  const [notifications, setNotifications] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setNotifications(3)
  }, [])

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary">
              <Zap className="size-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">AutoOps AI</span>
          </div>
        </div>

        <NoSSR fallback={
          <div className="flex items-center gap-3">
            <div className="h-9 w-20 bg-muted animate-pulse rounded" />
            <div className="h-9 w-9 bg-muted animate-pulse rounded" />
            <div className="h-9 w-9 bg-muted animate-pulse rounded" />
          </div>
        }>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Activity className="size-5" />
              <span className="absolute right-1 top-1 flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-accent" />
              </span>
            </Button>
            
            <Button variant="ghost" size="icon" className="relative">
              <MessageSquare className="size-5" />
              {mounted && notifications > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full p-0 text-xs"
                >
                  {notifications}
                </Badge>
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Users className="size-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Team Settings</DropdownMenuItem>
                <DropdownMenuItem>Billing</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" className="md:hidden">
              <MoreVertical className="size-5" />
            </Button>
          </div>
        </NoSSR>
      </div>
    </nav>
  )
}
