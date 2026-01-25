import { Equipment } from '../../lib/api'
import { CheckCircle, XCircle, Settings, Power } from 'lucide-react'

interface EquipmentCardProps {
  equipment: Equipment
}

export function EquipmentCard({ equipment }: EquipmentCardProps) {
  const statusColors = {
    running: 'bg-green-500',
    idle: 'bg-blue-500',
    error: 'bg-red-500',
    maintenance: 'bg-yellow-500',
    offline: 'bg-gray-500',
  }

  const statusIcons = {
    running: Power,
    idle: CheckCircle,
    error: XCircle,
    maintenance: Settings,
    offline: Power,
  }

  const StatusIcon = statusIcons[equipment.status] || CheckCircle

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg mb-1">{equipment.name}</h3>
          <p className="text-sm text-slate-400">{equipment.location || 'No location'}</p>
        </div>
        <div className={`w-3 h-3 rounded-full ${statusColors[equipment.status]} animate-pulse`}></div>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <StatusIcon className={`w-5 h-5 ${
          equipment.status === 'running' ? 'text-green-400' : 
          equipment.status === 'idle' ? 'text-blue-400' :
          equipment.status === 'error' ? 'text-red-400' :
          'text-slate-400'
        }`} />
        <span className="text-sm capitalize">{equipment.status}</span>
      </div>

      <div className="text-xs text-slate-400 space-y-1">
        <p>Type: {equipment.type}</p>
        <p>Protocol: {equipment.protocol.toUpperCase()}</p>
      </div>
    </div>
  )
}
