import { useEffect, useState } from 'react'
import { alarmApi, Alarm } from '../../lib/api'
import { AlarmList } from '../../components/hardware/AlarmList'

export default function Alarms() {
  const [alarms, setAlarms] = useState<Alarm[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAlarms()
    const interval = setInterval(loadAlarms, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadAlarms = async () => {
    try {
      const response = await alarmApi.getActive()
      setAlarms(response.data)
    } catch (error) {
      console.error('Failed to load alarms:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAck = async (alarmId: number) => {
    try {
      await alarmApi.acknowledge(alarmId)
      loadAlarms()
    } catch (error) {
      console.error('Failed to acknowledge alarm:', error)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading alarms...</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Active Alarms</h2>
        <span className="px-3 py-1 bg-red-600 rounded-full text-sm font-semibold">
          {alarms.length}
        </span>
      </div>

      <AlarmList alarms={alarms} onAck={handleAck} />
    </div>
  )
}
