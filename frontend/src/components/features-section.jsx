"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Zap, 
  TrendingUp, 
  Shield, 
  Database, 
  Users, 
  BarChart3, 
  Target 
} from "lucide-react"
import { NoSSR } from "@/components/no-ssr"

const features = [
  {
    icon: Zap,
    title: "AI-Powered Analysis",
    description: "Advanced machine learning algorithms analyze your business data to identify patterns and opportunities.",
    badge: "Core Feature",
    color: "text-blue-500"
  },
  {
    icon: TrendingUp,
    title: "Predictive Intelligence",
    description: "Forecast business trends, customer behavior, and market changes with high accuracy predictions.",
    badge: "Advanced",
    color: "text-green-500"
  },
  {
    icon: Zap,
    title: "Automated Execution",
    description: "Execute business actions automatically based on AI recommendations and predefined workflows.",
    badge: "Automation",
    color: "text-yellow-500"
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-level encryption and security protocols to protect your sensitive business data.",
    badge: "Security",
    color: "text-red-500"
  },
  {
    icon: Database,
    title: "Real-time Data Sync",
    description: "Connect multiple data sources and keep information synchronized across your organization.",
    badge: "Integration",
    color: "text-purple-500"
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Work together seamlessly with shared insights, collaborative workflows, and role-based access.",
    badge: "Collaboration",
    color: "text-indigo-500"
  }
]

export function FeaturesSection() {
  return (
    <NoSSR>
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Powerful Features for Modern Business
            </h2>
            <p className="text-xl text-muted-foreground max-w-[800px] mx-auto">
              Everything you need to automate, analyze, and optimize your business operations in one platform.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-lg bg-muted ${feature.color}`}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {feature.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-full -translate-y-16 translate-x-16" />
              </Card>
            ))}
          </div>
        </div>
      </section>
    </NoSSR>
  )
}
