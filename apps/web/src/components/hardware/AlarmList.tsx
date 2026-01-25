import { Alarm } from '../../lib/api'
import { XCircle, AlertTriangle, Activity, CheckCircle } from 'lucide-react'

interface AlarmListProps {
  alarms: Alarm[]
  onAck: (alarmId: number) => void
}

export function AlarmList({ alarms, onAck }: AlarmListProps) {
  const severityIcons: Record<'critical' | 'warning' | 'info', typeof XCircle> = {
    critical: XCircle,
    warning: AlertTriangle,
    info: Activity,
  }

  if (alarms.length === 0) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
        <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-400" />
        <p className="text-slate-400">No active alarms</p>
      </div>
    )
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
      <div className="space-y-2">
        {alarms.map((alarm) => {
          const Icon = severityIcons[alarm.severity]
          return (
            <div
              key={alarm.id}
              className="bg-slate-900 border-l-4 rounded p-4 flex items-start space-x-3"
              style={{
                borderLeftColor:
                  alarm.severity === 'critical'
                    ? '#ef4444'
                    : alarm.severity === 'warning'
                    ? '#eab308'
                    : '#3b82f6',
              }}
            >
              <Icon
                className={`w-5 h-5 mt-1 ${
                  alarm.severity === 'critical'
                    ? 'text-red-400'
                    : alarm.severity === 'warning'
                    ? 'text-yellow-400'
                    : 'text-blue-400'
                }`}
              />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold">
                    {alarm.equipment_name || `Equipment ${alarm.equipment_id}`}
                  </p>
                  <span className="text-xs text-slate-400">
                    {new Date(alarm.ts).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-slate-300">{alarm.message}</p>
                {alarm.code && (
                  <p className="text-xs text-slate-500 mt-1">Code: {alarm.code}</p>
                )}
              </div>
              <button
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
                onClick={() => onAck(alarm.id)}
              >
                Acknowledge
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
