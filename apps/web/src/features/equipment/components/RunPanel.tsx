import { useState } from 'react'
import { Play, Square, Clock } from 'lucide-react'
import { useRuns } from '../hooks/useRuns'
import { api } from '../../../lib/api'

interface RunPanelProps {
  equipmentId: number
}

export default function RunPanel({ equipmentId }: RunPanelProps) {
  const [runName, setRunName] = useState('')
  const [notes, setNotes] = useState('')
  const [tags, setTags] = useState('')
  const { data: runs } = useRuns(equipmentId)
  const [activeRun, setActiveRun] = useState<string | null>(null)

  const handleStartRun = async () => {
    try {
      const response = await api.post(`/hardware/equipment/${equipmentId}/runs/start`, {
        name: runName || undefined,
        notes: notes || undefined,
        tags: tags ? tags.split(',').map((t) => t.trim()) : undefined,
      })
      setActiveRun(response.data.id)
      setRunName('')
      setNotes('')
      setTags('')
    } catch (error) {
      console.error('Failed to start run:', error)
    }
  }

  const handleEndRun = async (runId: string) => {
    try {
      await api.post(`/hardware/equipment/${equipmentId}/runs/${runId}/end`)
      setActiveRun(null)
    } catch (error) {
      console.error('Failed to end run:', error)
    }
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <Clock className="w-6 h-6 mr-2 text-blue-400" />
        Run Management
      </h2>

      {!activeRun ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Run Name (optional)</label>
            <input
              type="text"
              className="w-full bg-slate-900/60 border border-slate-800 rounded px-3 py-2 text-sm text-white"
              placeholder="e.g., Batch-001"
              value={runName}
              onChange={(e) => setRunName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Notes (optional)</label>
            <textarea
              className="w-full bg-slate-900/60 border border-slate-800 rounded px-3 py-2 text-sm text-white"
              placeholder="Add notes..."
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Tags (comma-separated)</label>
            <input
              type="text"
              className="w-full bg-slate-900/60 border border-slate-800 rounded px-3 py-2 text-sm text-white"
              placeholder="tag1, tag2"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
          <button
            onClick={handleStartRun}
            className="w-full bg-green-600 hover:bg-green-700 rounded py-3 font-semibold flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4" />
            Start Run
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
            <div className="text-sm text-green-400 mb-2">Active Run</div>
            <div className="text-lg font-semibold">{activeRun}</div>
          </div>
          <button
            onClick={() => handleEndRun(activeRun)}
            className="w-full bg-red-600 hover:bg-red-700 rounded py-3 font-semibold flex items-center justify-center gap-2"
          >
            <Square className="w-4 h-4" />
            End Run
          </button>
        </div>
      )}

      {runs && runs.length > 0 && (
        <div className="mt-6">
          <div className="text-sm font-semibold mb-3">Recent Runs</div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {runs.slice(0, 5).map((run) => (
              <div key={run.id} className="bg-slate-900/40 rounded-xl p-3 text-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{run.name || run.id}</div>
                    <div className="text-xs text-slate-400">
                      {new Date(run.startedAt).toLocaleString()}
                    </div>
                  </div>
                  {run.tags && run.tags.length > 0 && (
                    <div className="flex gap-1">
                      {run.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
