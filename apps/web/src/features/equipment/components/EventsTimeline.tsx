import { useState, useEffect } from 'react'
import { AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { alarmApi } from '../../../lib/api'
import { Alarm } from '../../../types/domain'

interface EventsTimelineProps {
  equipmentId: number
}

export default function EventsTimeline({ equipmentId }: EventsTimelineProps) {
  const [alarms, setAlarms] = useState<Alarm[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAlarms = async () => {
      try {
        const response = await alarmApi.getActive(equipmentId)
        setAlarms(response.data)
      } catch (error) {
        console.error('Failed to load alarms:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAlarms()
    const interval = setInterval(fetchAlarms, 5000)
    return () => clearInterval(interval)
  }, [equipmentId])

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6">
        <div className="text-slate-400">Loading events...</div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6">
      <h2 className="text-xl font-semibold mb-4">Events Timeline</h2>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {alarms.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-400" />
            <p>No active events</p>
          </div>
        ) : (
          alarms.map((alarm) => {
            const Icon =
              alarm.severity === 'critical'
                ? AlertTriangle
                : alarm.severity === 'warning'
                  ? AlertTriangle
                  : Info
            return (
              <div
                key={alarm.id}
                className="flex items-start gap-3 p-3 bg-slate-900/40 rounded-xl border-l-4"
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
                    <span className="text-sm font-semibold">{alarm.code || 'Event'}</span>
                    <span className="text-xs text-slate-400">
                      {new Date(alarm.ts).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300">{alarm.message}</p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
