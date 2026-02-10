import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, TrendingUp, Shield, Cpu, ChevronRight, BarChart3, Target, Clock } from "lucide-react"
import { Link } from "react-router-dom"
import { useState, useEffect } from "react"
import { useMetrics, useAppStore } from "@/lib/store"
import { NoSSR } from "@/components/no-ssr"

export function HomeHero() {
  const metrics = useMetrics()
  const { updateMetrics } = useAppStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <NoSSR>
      <section className="relative overflow-hidden bg-background">
        <div className="container mx-auto px-4 py-16 sm:py-24">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="w-fit">
                  <Zap className="mr-2 h-4 w-4" />
                  AI-Powered Business Automation
                </Badge>
                <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl text-white">
                  Transform Your Business with{" "}
                  <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    Intelligent Automation
                  </span>
                </h1>
                <p className="text-xl text-gray-300 text-pretty max-w-[600px]">
                  AutoOps AI analyzes your data, predicts business needs, and executes automated solutions to save time and increase efficiency.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="group" asChild>
                  <Link to="/dashboard">
                    Get Started
                    <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/dashboard">
                    View Demo
                  </Link>
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    94%
                  </div>
                  <div className="text-sm text-gray-400">Accuracy Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    124h
                  </div>
                  <div className="text-sm text-gray-400">Time Saved Weekly</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    2.5x
                  </div>
                  <div className="text-sm text-gray-400">Productivity Boost</div>
                </div>
              </div>
            </div>

            <div className="relative">
              {mounted && (
                <Card className="relative overflow-hidden border-2 border-blue-500/20 shadow-2xl bg-gray-800/50 backdrop-blur-xl">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-white">Live Dashboard</h3>
                        <Badge variant="default" className="bg-green-500">
                          <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                          Active
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-green-400" />
                            <span className="text-sm font-medium text-gray-300">Active Workflows</span>
                          </div>
                          <div className="text-2xl font-bold text-white">12</div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-blue-400" />
                            <span className="text-sm font-medium text-gray-300">Predictions</span>
                          </div>
                          <div className="text-2xl font-bold text-white">247</div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Cpu className="h-4 w-4 text-purple-400" />
                            <span className="text-sm font-medium text-gray-300">Actions Executed</span>
                          </div>
                          <div className="text-2xl font-bold text-white">89</div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-orange-400" />
                            <span className="text-sm font-medium text-gray-300">Time Saved</span>
                          </div>
                          <div className="text-2xl font-bold text-white">124h</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">System Health</span>
                          <span className="text-green-400 font-medium">Optimal</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="h-2 rounded-full bg-green-500 transition-all duration-500" style={{ width: "95%" }}></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>
    </NoSSR>
  )
}
