import { Link } from "react-router-dom"
import { Zap, MessageSquare, Users, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NoSSR } from "@/components/no-ssr"

export function Footer() {
  return (
    <NoSSR>
      <footer className="border-t bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
                  <Zap className="size-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold">AutoOps AI</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-[200px]">
                Transform your business with AI-powered automation and intelligent workflows.
              </p>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon">
                  <MessageSquare className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Users className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <FileText className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/dashboard" className="hover:text-foreground transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/actions" className="hover:text-foreground transition-colors">
                    Actions
                  </Link>
                </li>
                <li>
                  <Link to="/insights" className="hover:text-foreground transition-colors">
                    Insights
                  </Link>
                </li>
                <li>
                  <Link to="/workflows" className="hover:text-foreground transition-colors">
                    Workflows
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="#" className="hover:text-foreground transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-foreground transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-foreground transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-foreground transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="#" className="hover:text-foreground transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-foreground transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-foreground transition-colors">
                    API Reference
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-foreground transition-colors">
                    Status
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm text-muted-foreground">
                © 2024 AutoOps AI. All rights reserved.
              </p>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <Link to="#" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
                <Link to="#" className="hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
                <Link to="#" className="hover:text-foreground transition-colors">
                  Cookie Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </NoSSR>
  )
}
