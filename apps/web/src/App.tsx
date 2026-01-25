import { BrowserRouter } from 'react-router-dom'
import AppRouter from './app/router'
import { AppShell } from './app/layout/AppShell'

function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <AppRouter />
      </AppShell>
    </BrowserRouter>
  )
}

export default App
