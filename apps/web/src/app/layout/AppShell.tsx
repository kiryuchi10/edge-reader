import { ReactNode } from 'react'
import { SideNav } from './SideNav'
import { TopBar } from './TopBar'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <TopBar />
      <div className="flex">
        <SideNav />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
