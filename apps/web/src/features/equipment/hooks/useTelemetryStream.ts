import { useEffect, useMemo, useRef, useState } from 'react'
import { getTelemetryStreamUrl, createWebSocket } from '../../../lib/ws'
import { TelemetryPoint } from '../../../types/domain'

interface UseTelemetryStreamParams {
  equipmentId: number
  keys: string[]
  hz: number
}

export function useTelemetryStream({ equipmentId, keys, hz }: UseTelemetryStreamParams) {
  const [status, setStatus] = useState<'connecting' | 'open' | 'closed' | 'error'>('connecting')
  const [latest, setLatest] = useState<Record<string, number>>({})
  const [points, setPoints] = useState<TelemetryPoint[]>([])
  const wsRef = useRef<WebSocket | null>(null)

  const url = useMemo(
    () => getTelemetryStreamUrl(equipmentId, keys, hz),
    [equipmentId, keys.join(','), hz]
  )

  useEffect(() => {
    setStatus('connecting')
    const ws = createWebSocket(url, {
      onMessage: (msg: any) => {
        const ts = msg.timestamp ?? new Date().toISOString()
        const metrics = msg.metrics ?? msg
        setLatest(metrics)
        setPoints((prev) => {
          const next = [...prev, { ts, metrics }]
          return next.slice(-240)
        })
      },
      onError: () => setStatus('error'),
      onClose: () => setStatus('closed'),
    })

    ws.onopen = () => setStatus('open')
    wsRef.current = ws

    return () => {
      ws.close()
      wsRef.current = null
    }
  }, [url])

  return { status, latest, points }
}
