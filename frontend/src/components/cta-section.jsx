import { Link } from "react-router-dom"
import { NoSSR } from "@/components/no-ssr"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Zap, CheckCircle2, ChevronRight } from "lucide-react"

export function CTASection() {
  return (
    <NoSSR>
      <section className="py-16 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="w-fit">
                  <Zap className="mr-2 h-4 w-4" />
                  Ready to Get Started?
                </Badge>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Transform Your Business Today
                </h2>
                <p className="text-xl text-muted-foreground">
                  Join thousands of businesses already using AutoOps AI to automate their operations and boost productivity.
                </p>
              </div>

              <div className="space-y-6">
                <div className="grid gap-4">
                  {[
                    "No credit card required",
                    "14-day free trial",
                    "Cancel anytime",
                    "24/7 support"
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <span className="text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="group" asChild>
                    <Link to="/dashboard">
                      Start Free Trial
                      <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link to="/dashboard">
                      Schedule Demo
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            <Card className="border-2 border-primary/20">
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold">Start Your Free Trial</h3>
                    <p className="text-muted-foreground">
                      Experience the power of AI-driven automation
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <div className="text-3xl font-bold text-primary">14</div>
                        <div className="text-sm text-muted-foreground">Days Free</div>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <div className="text-3xl font-bold text-primary">100%</div>
                        <div className="text-sm text-muted-foreground">Risk Free</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Button className="w-full" size="lg" asChild>
                        <Link to="/dashboard">
                          Get Started Now
                        </Link>
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        No setup required • Start automating in minutes
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </NoSSR>
  )
}
