import { useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useEquipmentDetail } from '../../features/equipment/hooks/useEquipmentDetail'
import { useTelemetryStream } from '../../features/equipment/hooks/useTelemetryStream'
import TelemetryKpis from '../../features/equipment/components/TelemetryKpis'
import TelemetryCharts from '../../features/equipment/components/TelemetryCharts'
import CommandPanel from '../../features/equipment/components/CommandPanel'
import RunPanel from '../../features/equipment/components/RunPanel'
import EventsTimeline from '../../features/equipment/components/EventsTimeline'
import TelemetryStreamIndicator from '../../features/equipment/components/TelemetryStreamIndicator'

export default function EquipmentLivePage() {
  const { id } = useParams<{ id: string }>()
  const equipmentId = Number(id)

  if (!id || isNaN(equipmentId)) {
    return <div className="text-center py-12 text-red-400">Invalid equipment ID</div>
  }

  const { data: eq } = useEquipmentDetail(equipmentId)

  const keys = useMemo(() => ['temperature', 'pressure'], [])
  const [hz, setHz] = useState(2)

  const { status, latest, points } = useTelemetryStream({ equipmentId, keys, hz })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <Link to={`/equipment/${id}`} className="text-blue-400 hover:text-blue-300 text-sm">
          ← Back to Equipment
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6 flex items-start justify-between">
        <div>
          <div className="text-xs text-slate-500">Equipment</div>
          <div className="text-xl font-semibold text-slate-200">{eq?.name ?? `Equipment #${equipmentId}`}</div>
          <div className="text-sm text-slate-400">
            {eq?.type ?? 'Unknown'} · {eq?.protocol ?? 'Unknown'}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <TelemetryStreamIndicator status={status} />
          <select
            value={hz}
            onChange={(e) => setHz(Number(e.target.value))}
            className="rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-200"
          >
            <option value={1}>1 Hz</option>
            <option value={2}>2 Hz</option>
            <option value={5}>5 Hz</option>
            <option value={10}>10 Hz</option>
          </select>
        </div>
      </div>

      <TelemetryKpis latest={latest} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <TelemetryCharts points={points} keys={keys} />
          <EventsTimeline equipmentId={equipmentId} />
        </div>
        <div className="space-y-6">
          <CommandPanel equipmentId={equipmentId} />
          <RunPanel equipmentId={equipmentId} />
        </div>
      </div>
    </div>
  )
}
