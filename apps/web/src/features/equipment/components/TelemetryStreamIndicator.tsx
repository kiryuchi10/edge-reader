
interface TelemetryStreamIndicatorProps {
  status: 'connecting' | 'open' | 'closed' | 'error'
}

export default function TelemetryStreamIndicator({ status }: TelemetryStreamIndicatorProps) {
  const statusConfig = {
    connecting: { color: 'bg-yellow-500', text: 'Connecting' },
    open: { color: 'bg-green-500', text: 'Connected' },
    closed: { color: 'bg-gray-500', text: 'Disconnected' },
    error: { color: 'bg-red-500', text: 'Error' },
  }

  const config = statusConfig[status] || statusConfig.closed

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${config.color} ${status === 'open' ? 'animate-pulse' : ''}`} />
      <span className="text-sm text-slate-300">{config.text}</span>
    </div>
  )
}
