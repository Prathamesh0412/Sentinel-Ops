
import { Navigation } from "@/components/navigation"
import { WorkflowsHeader } from "@/components/workflows-header"
import { WorkflowsGrid } from "@/components/workflows-grid"
import { WorkflowStats } from "@/components/workflow-stats"
import { Footer } from "@/components/footer"
import { NoSSR } from "@/components/no-ssr"

export default function WorkflowsPage() {
  return (
    <NoSSR>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8">
            <WorkflowsHeader />
            <div className="mt-8">
              <WorkflowStats />
            </div>
            <div className="mt-8">
              <WorkflowsGrid />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </NoSSR>
  )
}
