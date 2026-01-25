import { useState, useEffect, useRef } from 'react'
import { getTelemetryStreamUrl, createWebSocket } from '@/lib/ws'
import { TelemetryData } from '@/types'

export function useTelemetryStream(
  equipmentId: number | null,
  keys?: string[],
  hz: number = 2.0,
  enabled: boolean = true
) {
  const [data, setData] = useState<TelemetryData | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (!equipmentId || !enabled) {
      return
    }

    const url = getTelemetryStreamUrl(equipmentId, keys, hz)
    const ws = createWebSocket(url, {
      onMessage: (message: TelemetryData) => {
        setData(message)
        setError(null)
      },
      onError: (err: Event) => {
        setError(new Error('WebSocket error'))
        console.error('WebSocket error:', err)
      },
      onClose: () => {
        console.log('WebSocket closed')
      },
    })

    wsRef.current = ws

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [equipmentId, keys?.join(','), hz, enabled])

  return { data, error }
}
