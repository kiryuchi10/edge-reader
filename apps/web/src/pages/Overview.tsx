import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Cpu, Activity, AlertTriangle, TrendingUp } from 'lucide-react'
import { equipmentApi, alarmApi, Equipment, Alarm } from '../lib/api'

export default function Overview() {
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [alarms, setAlarms] = useState<Alarm[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 5000) // Refresh every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    try {
      const [equipmentRes, alarmsRes] = await Promise.all([
        equipmentApi.list(),
        alarmApi.getActive(),
      ])
      setEquipment(equipmentRes.data)
      setAlarms(alarmsRes.data)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const runningCount = equipment.filter(e => e.status === 'running').length
  const idleCount = equipment.filter(e => e.status === 'idle').length

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Overview</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <Cpu className="w-8 h-8 text-blue-400 mb-3" />
          <p className="text-sm text-slate-400">Total Equipment</p>
          <p className="text-3xl font-bold">{equipment.length}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <Activity className="w-8 h-8 text-green-400 mb-3" />
          <p className="text-sm text-slate-400">Running</p>
          <p className="text-3xl font-bold text-green-400">{runningCount}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <AlertTriangle className="w-8 h-8 text-yellow-400 mb-3" />
          <p className="text-sm text-slate-400">Alarms</p>
          <p className="text-3xl font-bold text-yellow-400">{alarms.length}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <TrendingUp className="w-8 h-8 text-purple-400 mb-3" />
          <p className="text-sm text-slate-400">Idle</p>
          <p className="text-3xl font-bold text-purple-400">{idleCount}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="flex space-x-4">
          <Link
            to="/equipment"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium"
          >
            View All Equipment
          </Link>
          <Link
            to="/alarms"
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-sm font-medium"
          >
            View Alarms
          </Link>
        </div>
      </div>

      {/* Recent Alarms */}
      {alarms.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Recent Alarms</h3>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="space-y-2">
              {alarms.slice(0, 5).map((alarm) => (
                <div
                  key={alarm.id}
                  className="flex items-center justify-between p-3 bg-slate-900 rounded"
                >
                  <div>
                    <p className="font-medium">{alarm.equipment_name || `Equipment ${alarm.equipment_id}`}</p>
                    <p className="text-sm text-slate-400">{alarm.message}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      alarm.severity === 'critical'
                        ? 'bg-red-600'
                        : alarm.severity === 'warning'
                        ? 'bg-yellow-600'
                        : 'bg-blue-600'
                    }`}
                  >
                    {alarm.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
