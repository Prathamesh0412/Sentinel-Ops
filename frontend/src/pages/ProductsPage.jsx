
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { NoSSR } from "@/components/no-ssr"
import { ProductIntelligenceDashboard } from "@/components/product-intelligence-dashboard"
import { ProductUploadPanel } from "@/components/product-upload-panel"

export default function ProductsPage() {
  return (
    <NoSSR>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8 space-y-8">
            <ProductUploadPanel />
            <ProductIntelligenceDashboard />
          </div>
        </main>
        <Footer />
      </div>
    </NoSSR>
  )
}
