import { useState, useEffect } from 'react'
import { equipmentApi } from '@/lib/api'
import { Equipment } from '@/types'

export function useEquipmentList() {
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        setLoading(true)
        const response = await equipmentApi.list()
        setEquipment(response.data)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchEquipment()
    // Refresh every 5 seconds
    const interval = setInterval(fetchEquipment, 5000)
    return () => clearInterval(interval)
  }, [])

  return { equipment, loading, error, refetch: () => equipmentApi.list().then(res => setEquipment(res.data)) }
}
