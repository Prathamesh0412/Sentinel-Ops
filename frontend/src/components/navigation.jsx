import { Link, useLocation } from "react-router-dom"
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
import { 
  Home, 
  Activity, 
  Target, 
  BarChart3, 
  Settings, 
  Users, 
  Zap, 
  MoreVertical,
  Search,
  X,
  Package
} from "lucide-react"
import { useState, useEffect } from "react"
import { useActions, usePredictions, useWorkflows, useMetrics, useAppStore } from "@/lib/store"
import { NoSSR } from "@/components/no-ssr"
import { LoadingState } from "@/components/ui/loading-state"

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Dashboard", href: "/dashboard", icon: Activity },
  { name: "Actions", href: "/actions", icon: Target },
  { name: "Insights", href: "/insights", icon: BarChart3 },
  { name: "Products", href: "/products", icon: Package },
  { name: "Workflows", href: "/workflows", icon: Settings },
]

export function Navigation() {
  const location = useLocation()
  const pathname = location.pathname
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Get live data for notifications
  const actions = useActions()
  const predictions = usePredictions()
  const workflows = useWorkflows()
  const metrics = useMetrics()
  const { fetchPredictions } = useAppStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    Promise.resolve(fetchPredictions()).catch(() => {})
  }, [fetchPredictions])

  // Calculate notifications based on real data
  const pendingActions = actions.filter(a => a.status === 'pending').length
  const highSeverityPredictions = predictions.filter(p => p.severity === 'High').length
  const totalNotifications = pendingActions + highSeverityPredictions

  return (
    <NoSSR fallback={
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary">
                <Zap className="size-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">AutoOps AI</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              {navigation.map((item) => (
                <div key={item.name} className="h-9 w-20 bg-muted animate-pulse rounded" />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-9 w-20 bg-muted animate-pulse rounded" />
            <div className="h-9 w-9 bg-muted animate-pulse rounded" />
            <div className="h-9 w-9 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </nav>
    }>
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary">
                <Zap className="size-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">AutoOps AI</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-2">
              {!mounted ? (
                <LoadingState message="" size="sm" className="gap-1" />
              ) : (
                navigation.map((item) => {
                  const isActive = pathname === item.href && item.name !== "Home"
                  const base = "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors transition-transform duration-200"
                  const active = "bg-primary/10 text-primary ring-1 ring-primary/20 hover:ring-primary/40 hover:-translate-y-[1px]"
                  const inactive = "text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:ring-1 hover:ring-accent/30 hover:-translate-y-[1px]"
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`${base} ${isActive ? active : inactive}`}
                    >
                      <item.icon className="size-4" />
                      {item.name}
                    </Link>
                  )
                })
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative btn-ghost">
              <Activity className="size-5" />
              <span className="absolute right-1 top-1 flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-accent" />
              </span>
            </Button>
            
            <Button variant="ghost" size="icon" className="relative btn-ghost">
              <Users className="size-5" />
              {mounted && totalNotifications > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full p-0 text-xs animate-pulse"
                >
                  {totalNotifications}
                </Badge>
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="btn-ghost">
                  <MoreVertical className="size-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Navigation</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {navigation.map((item) => (
                  <DropdownMenuItem key={item.name} asChild>
                    <Link to={item.href} className="flex items-center gap-2">
                      <item.icon className="size-4" />
                      {item.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Help</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>
    </NoSSR>
  )
}
