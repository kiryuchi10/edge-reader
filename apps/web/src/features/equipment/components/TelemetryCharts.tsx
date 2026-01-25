import { useEffect, useRef } from 'react'
import { TelemetryPoint } from '../../../types/domain'

interface TelemetryChartsProps {
  points: TelemetryPoint[]
  keys: string[]
}

export default function TelemetryCharts({ points, keys }: TelemetryChartsProps) {
  return (
    <div className="space-y-6">
      {keys.map((key) => (
        <TelemetryChart key={key} points={points} parameter={key} />
      ))}
    </div>
  )
}

function TelemetryChart({ points, parameter }: { points: TelemetryPoint[]; parameter: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || points.length < 2) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

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
    if (points.length > 0) {
      const values = points.map((p) => p.metrics[parameter] ?? 0).filter((v) => v != null)
      if (values.length > 0) {
        const maxValue = Math.max(...values)
        const minValue = Math.min(...values)
        const range = maxValue - minValue || 1

        ctx.strokeStyle = '#3b82f6'
        ctx.lineWidth = 2
        ctx.beginPath()

        values.forEach((value, index) => {
          const x = (width / (values.length - 1)) * index
          const y = height - ((value - minValue) / range) * height

          if (index === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        })

        ctx.stroke()
      }
    }
  }, [points, parameter])

  const latestValue = points[points.length - 1]?.metrics[parameter] ?? 0

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold capitalize">{parameter.replace('_', ' ')}</h3>
        <span className="text-2xl font-bold text-blue-400">{latestValue.toFixed(2)}</span>
      </div>
      <canvas ref={canvasRef} width={600} height={200} className="w-full h-48 bg-slate-900 rounded" />
    </div>
  )
}
