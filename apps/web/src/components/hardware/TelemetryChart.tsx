import { useEffect, useRef, useState } from 'react'
import { getTelemetryStreamUrl, createWebSocket } from '../../lib/ws'

interface TelemetryChartProps {
  equipmentId: number
  parameter: string
}

interface DataPoint {
  time: string
  value: number
}

export function TelemetryChart({ equipmentId, parameter }: TelemetryChartProps) {
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    const url = getTelemetryStreamUrl(equipmentId, [parameter], 2)
    wsRef.current = createWebSocket(url, {
      onMessage: (data) => {
        const value = data.metrics?.[parameter]
        if (value !== undefined) {
          setDataPoints((prev) => {
            const newPoints = [...prev, { time: new Date().toLocaleTimeString(), value }]
            return newPoints.slice(-50) // Keep last 50 points
          })
        }
      },
      onError: (error) => {
        console.error('WebSocket error:', error)
      },
    })

    return () => {
      wsRef.current?.close()
    }
  }, [equipmentId, parameter])

  useEffect(() => {
    if (!canvasRef.current || dataPoints.length < 2) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw grid
    ctx.strokeStyle = '#334155'
    ctx.lineWidth = 1
    for (let i = 0; i <= 5; i++) {
      const y = (height / 5) * i
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    // Draw data line
    if (dataPoints.length > 0) {
      const values = dataPoints.map((d) => d.value)
      const maxValue = Math.max(...values)
      const minValue = Math.min(...values)
      const range = maxValue - minValue || 1

      ctx.strokeStyle = '#3b82f6'
      ctx.lineWidth = 2
      ctx.beginPath()

      dataPoints.forEach((point, index) => {
        const x = (width / (dataPoints.length - 1)) * index
        const y = height - ((point.value - minValue) / range) * height

        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })

      ctx.stroke()
    }
  }, [dataPoints])

  const latestValue = dataPoints[dataPoints.length - 1]?.value || 0

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold capitalize">{parameter.replace('_', ' ')}</h3>
        <span className="text-2xl font-bold text-blue-400">{latestValue.toFixed(2)}</span>
      </div>
      <canvas
        ref={canvasRef}
        width={600}
        height={200}
        className="w-full h-48 bg-slate-900 rounded"
      />
    </div>
  )
}
