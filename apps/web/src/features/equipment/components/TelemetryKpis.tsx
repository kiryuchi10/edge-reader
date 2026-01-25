import { Thermometer, Gauge, Zap } from 'lucide-react'

interface TelemetryKpisProps {
  latest: Record<string, number>
}

export default function TelemetryKpis({ latest }: TelemetryKpisProps) {
  const kpis = [
    { key: 'temperature', label: 'Temperature', icon: Thermometer, unit: '°C', color: 'text-orange-400' },
    { key: 'pressure', label: 'Pressure', icon: Gauge, unit: 'bar', color: 'text-blue-400' },
    { key: 'flow', label: 'Flow Rate', icon: Zap, unit: 'mL/min', color: 'text-green-400' },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon
        const value = latest[kpi.key]
        return (
          <div key={kpi.key} className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon className={`w-6 h-6 ${kpi.color}`} />
            </div>
            <div className="text-3xl font-bold text-slate-200 mb-1">
              {value != null ? value.toFixed(2) : '-'}
            </div>
            <div className="text-sm text-slate-400">{kpi.label}</div>
            <div className="text-xs text-slate-500 mt-1">{kpi.unit}</div>
          </div>
        )
      })}
    </div>
  )
}
