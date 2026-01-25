import { useState, useEffect } from 'react'
import { Run } from '../../../types/domain'
import { api } from '../../../lib/api'

export function useRuns(equipmentId: number) {
  const [data, setData] = useState<Run[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchRuns = async () => {
      try {
        setIsLoading(true)
        const response = await api.get<Run[]>(`/hardware/equipment/${equipmentId}/runs?limit=10`)
        setData(response.data)
      } catch (err) {
        setError(err as Error)
      } finally {
        setIsLoading(false)
      }
    }

    if (equipmentId) {
      fetchRuns()
      const interval = setInterval(fetchRuns, 10000)
      return () => clearInterval(interval)
    }
  }, [equipmentId])

  return { data, isLoading, error }
}
