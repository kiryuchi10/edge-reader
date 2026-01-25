import { useState, useEffect } from 'react'
import { alarmApi } from '@/lib/api'
import { Alarm } from '@/types'

export function useActiveAlarms(equipmentId?: number) {
  const [alarms, setAlarms] = useState<Alarm[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchAlarms = async () => {
      try {
        setLoading(true)
        const response = await alarmApi.getActive(equipmentId)
        setAlarms(response.data)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchAlarms()
    // Refresh every 2 seconds
    const interval = setInterval(fetchAlarms, 2000)
    return () => clearInterval(interval)
  }, [equipmentId])

  const acknowledge = async (alarmId: number) => {
    try {
      await alarmApi.acknowledge(alarmId)
      setAlarms(prev => prev.filter(a => a.id !== alarmId))
    } catch (err) {
      console.error('Failed to acknowledge alarm:', err)
    }
  }

  return { alarms, loading, error, acknowledge }
}
