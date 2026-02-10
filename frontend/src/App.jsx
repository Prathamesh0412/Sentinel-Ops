import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { ToastProvider } from './components/ui/toast-provider'
import { RealTimeInitializer } from './components/real-time-initializer'
import HomePage from './pages/HomePage'
import DashboardPage from './pages/DashboardPage'
import ActionsPage from './pages/ActionsPage'
import InsightsPage from './pages/InsightsPage'
import WorkflowsPage from './pages/WorkflowsPage'
import ProductsPage from './pages/ProductsPage'

function App() {
  return (
    <>
      <RealTimeInitializer />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/actions" element={<ActionsPage />} />
        <Route path="/insights" element={<InsightsPage />} />
        <Route path="/workflows" element={<WorkflowsPage />} />
        <Route path="/products" element={<ProductsPage />} />
      </Routes>
      <ToastProvider />
    </>
  )
}

export default App
