import { useState } from 'react'
import { Settings } from 'lucide-react'
import { commandApi } from '../../lib/api'

interface ControlPanelProps {
  equipmentId: number
}

export function ControlPanel({ equipmentId }: ControlPanelProps) {
  const [selectedCommand, setSelectedCommand] = useState('')
  const [parameters, setParameters] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const commands = [
    { id: 'set', name: 'Set Value', params: ['node', 'value'] },
  ]

  const handleSendCommand = async () => {
    if (!selectedCommand) return

    setLoading(true)
    try {
      const cmd = {
        command: selectedCommand,
        parameters: Object.fromEntries(
          Object.entries(parameters).map(([k, v]) => [
            k,
            k === 'value' ? parseFloat(v) : v,
          ])
        ),
      }
      await commandApi.send(equipmentId, cmd)
      alert('Command sent successfully')
      setParameters({})
    } catch (error) {
      console.error('Failed to send command:', error)
      alert('Command failed')
    } finally {
      setLoading(false)
    }
  }

  const selectedCommandObj = commands.find((c) => c.id === selectedCommand)

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <Settings className="w-6 h-6 mr-2 text-blue-400" />
        Equipment Control
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm mb-2">Select Command</label>
          <select
            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
            value={selectedCommand}
            onChange={(e) => setSelectedCommand(e.target.value)}
          >
            <option value="">-- Select Command --</option>
            {commands.map((cmd) => (
              <option key={cmd.id} value={cmd.id}>
                {cmd.name}
              </option>
            ))}
          </select>
        </div>

        {selectedCommandObj && selectedCommandObj.params.length > 0 && (
          <div className="space-y-3">
            {selectedCommandObj.params.map((param) => (
              <div key={param}>
                <label className="block text-sm mb-1 capitalize">
                  {param.replace('_', ' ')}
                </label>
                <input
                  type="text"
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                  placeholder={`Enter ${param}`}
                  value={parameters[param] || ''}
                  onChange={(e) =>
                    setParameters({ ...parameters, [param]: e.target.value })
                  }
                />
              </div>
            ))}
          </div>
        )}

        <button
          className="w-full bg-blue-600 hover:bg-blue-700 rounded py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!selectedCommand || loading}
          onClick={handleSendCommand}
        >
          {loading ? 'Sending...' : 'Send Command'}
        </button>
      </div>
    </div>
  )
}
