
import { Navigation } from "@/components/navigation"
import { InsightsHeader } from "@/components/insights-header"
import { AlertsGrid } from "@/components/alerts-grid"
import { PredictionDetailsCard } from "@/components/prediction-details-card"
import { Footer } from "@/components/footer"
import { NoSSR } from "@/components/no-ssr"

export default function InsightsPage() {
  return (
    <NoSSR>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8">
            <InsightsHeader />
            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <AlertsGrid />
              </div>
              <div className="lg:col-span-1">
                <PredictionDetailsCard />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </NoSSR>
  )
}
