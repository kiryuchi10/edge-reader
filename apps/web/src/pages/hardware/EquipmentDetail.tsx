import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { equipmentApi, type EquipmentDetail } from '../../lib/api'
import { ControlPanel } from '../../components/hardware/ControlPanel'

export default function EquipmentDetail() {
  const { id } = useParams<{ id: string }>()
  const [equipment, setEquipment] = useState<EquipmentDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      loadEquipment()
    }
  }, [id])

  const loadEquipment = async () => {
    if (!id) return
    try {
      const response = await equipmentApi.get(parseInt(id))
      setEquipment(response.data)
    } catch (error) {
      console.error('Failed to load equipment:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async () => {
    if (!id) return
    try {
      await equipmentApi.connect(parseInt(id))
      loadEquipment()
    } catch (error) {
      console.error('Failed to connect:', error)
    }
  }

  const handleDisconnect = async () => {
    if (!id) return
    try {
      await equipmentApi.disconnect(parseInt(id))
      loadEquipment()
    } catch (error) {
      console.error('Failed to disconnect:', error)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  if (!equipment) {
    return <div className="text-center py-12">Equipment not found</div>
  }

  const statusColors: Record<typeof equipment.status, string> = {
    running: 'bg-green-500',
    idle: 'bg-blue-500',
    error: 'bg-red-500',
    offline: 'bg-gray-500',
    maintenance: 'bg-yellow-500',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link to="/equipment" className="text-blue-400 hover:text-blue-300 mb-2 inline-block">
            ← Back to Equipment
          </Link>
          <h2 className="text-2xl font-bold">{equipment.name}</h2>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${statusColors[equipment.status]} animate-pulse`}></div>
          <span className="capitalize">{equipment.status}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Equipment Info */}
        <div className="col-span-2 space-y-6">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Equipment Information</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-slate-400">Type</dt>
                <dd className="font-medium">{equipment.type}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-400">Protocol</dt>
                <dd className="font-medium">{equipment.protocol}</dd>
              </div>
              {equipment.location && (
                <div>
                  <dt className="text-sm text-slate-400">Location</dt>
                  <dd className="font-medium">{equipment.location}</dd>
                </div>
              )}
              {equipment.config?.endpoint_url && (
                <div>
                  <dt className="text-sm text-slate-400">Endpoint</dt>
                  <dd className="font-medium text-sm">{equipment.config.endpoint_url}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Actions</h3>
              <Link
                to={`/equipment/${id}/live`}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium"
              >
                View Live Telemetry
              </Link>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleConnect}
                disabled={equipment.status === 'running' || equipment.status === 'idle'}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium"
              >
                Connect
              </button>
              <button
                onClick={handleDisconnect}
                disabled={equipment.status === 'offline'}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div>
          <ControlPanel equipmentId={parseInt(id!)} />
        </div>
      </div>
    </div>
  )
}
