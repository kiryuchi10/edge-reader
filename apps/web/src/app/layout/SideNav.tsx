import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Activity, Cpu, AlertTriangle, FileText, Brain, BarChart3 } from 'lucide-react'

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/jobs', label: 'Jobs', icon: Activity },
  { path: '/equipment', label: 'Equipment', icon: Cpu },
  { path: '/alarms', label: 'Alarms', icon: AlertTriangle },
  { path: '/documents/upload', label: 'Documents', icon: FileText },
  { path: '/analysis/eda', label: 'Analysis', icon: BarChart3 },
  { path: '/ml/train', label: 'ML Training', icon: Brain },
]

export function SideNav() {
  const location = useLocation()

  return (
    <nav className="w-64 bg-slate-800 border-r border-slate-700 min-h-[calc(100vh-64px)]">
      <div className="p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path || 
                          (item.path !== '/' && location.pathname.startsWith(item.path))
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
