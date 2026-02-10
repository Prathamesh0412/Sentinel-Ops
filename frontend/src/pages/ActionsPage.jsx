
import { Navigation } from "@/components/navigation"
import { ActionsHeader } from "@/components/actions-header"
import { ActionsPanel } from "@/components/actions-panel"
import { ActionExecutionPanel } from "@/components/action-execution-panel"
import { ActionHistoryPanel } from "@/components/action-history-panel"
import { Footer } from "@/components/footer"
import { NoSSR } from "@/components/no-ssr"

export default function ActionsPage() {
  return (
    <NoSSR>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8">
            <ActionsHeader />
            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <ActionExecutionPanel />
              </div>
              <div className="lg:col-span-1">
                <ActionHistoryPanel />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </NoSSR>
  )
}
