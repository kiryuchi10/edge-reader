import { useState, useEffect } from 'react'
import { Equipment } from '../../../types/domain'
import { equipmentApi } from '../../../lib/api'

export function useEquipmentDetail(equipmentId: number) {
  const [data, setData] = useState<Equipment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        setIsLoading(true)
        const response = await equipmentApi.get(equipmentId)
        setData(response.data)
      } catch (err) {
        setError(err as Error)
      } finally {
        setIsLoading(false)
      }
    }

    if (equipmentId) {
      fetchEquipment()
      const interval = setInterval(fetchEquipment, 5000)
      return () => clearInterval(interval)
    }
  }, [equipmentId])

  return { data, isLoading, error }
}
