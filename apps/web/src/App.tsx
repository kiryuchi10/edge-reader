import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import AppRouter from './app/router'
import { AppShell } from './app/layout/AppShell'

/**
 * Edge Reader - Main Application Component
 * 
 * Industrial Hardware Integration & AI/ML Analysis Platform
 * - Real-time equipment monitoring (OPC UA, MQTT, SECS/GEM)
 * - Document processing (OCR, table extraction, LLM analysis)
 * - ML/AI pipelines (classification, regression, clustering, time-series)
 * - Data analytics (EDA, SPC, predictive maintenance)
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppShell>
          <AppRouter />
        </AppShell>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
