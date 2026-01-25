import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { equipmentApi, Equipment } from '../../lib/api'
import { EquipmentCard } from '../../components/hardware/EquipmentCard'

export default function EquipmentDashboard() {
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEquipment()
    const interval = setInterval(loadEquipment, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadEquipment = async () => {
    try {
      const response = await equipmentApi.list()
      setEquipment(response.data)
    } catch (error) {
      console.error('Failed to load equipment:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading equipment...</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Equipment</h2>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium">
          Add Equipment
        </button>
      </div>

      {equipment.length === 0 ? (
        <div className="text-center py-12 bg-slate-800 border border-slate-700 rounded-lg">
          <p className="text-slate-400 mb-4">No equipment registered</p>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium">
            Register Equipment
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {equipment.map((eq) => (
            <Link key={eq.id} to={`/equipment/${eq.id}`}>
              <EquipmentCard equipment={eq} />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
