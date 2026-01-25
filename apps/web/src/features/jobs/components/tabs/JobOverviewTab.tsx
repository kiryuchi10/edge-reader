import { Download, RefreshCw, X } from 'lucide-react'
import { JobDetail } from '../../../../types/domain'
import { api } from '../../../../lib/api'

interface JobOverviewTabProps {
  job: JobDetail
}

export default function JobOverviewTab({ job }: JobOverviewTabProps) {
  const handleRetry = async () => {
    try {
      await api.post(`/jobs/${job.id}/retry`)
      window.location.reload()
    } catch (error) {
      console.error('Failed to retry job:', error)
    }
  }

  const handleCancel = async () => {
    try {
      await api.post(`/jobs/${job.id}/cancel`)
      window.location.reload()
    } catch (error) {
      console.error('Failed to cancel job:', error)
    }
  }

  const handleExport = async (format: 'json' | 'csv' | 'pdf') => {
    try {
      const response = await api.get(`/jobs/${job.id}/export?format=${format}`, {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${job.id}.${format}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Failed to export:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6">
          <h3 className="text-sm font-semibold mb-4">Job Information</h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-xs text-slate-500">Status</dt>
              <dd className="text-sm text-slate-200 capitalize">{job.status}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Type</dt>
              <dd className="text-sm text-slate-200 capitalize">{job.assetType}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Created</dt>
              <dd className="text-sm text-slate-200">{new Date(job.createdAt).toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Updated</dt>
              <dd className="text-sm text-slate-200">{new Date(job.updatedAt).toLocaleString()}</dd>
            </div>
            {job.progress != null && (
              <div>
                <dt className="text-xs text-slate-500">Progress</dt>
                <dd className="text-sm text-slate-200">{job.progress}%</dd>
                <div className="mt-2 w-full bg-slate-800 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${job.progress}%` }}
                  />
                </div>
              </div>
            )}
          </dl>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6">
          <h3 className="text-sm font-semibold mb-4">Actions</h3>
          <div className="space-y-3">
            <div className="flex gap-2">
              <button
                onClick={() => handleExport('json')}
                className="flex-1 rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2 text-sm hover:bg-slate-800/60 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export JSON
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="flex-1 rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2 text-sm hover:bg-slate-800/60 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
            <button
              onClick={() => handleExport('pdf')}
              className="w-full rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2 text-sm hover:bg-slate-800/60 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </button>
            {(job.status === 'failed' || job.status === 'queued') && (
              <button
                onClick={handleRetry}
                className="w-full rounded-xl border border-blue-500/40 bg-blue-500/10 px-3 py-2 text-sm text-blue-200 hover:bg-blue-500/20 flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Retry Job
              </button>
            )}
            {job.status === 'processing' && (
              <button
                onClick={handleCancel}
                className="w-full rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200 hover:bg-red-500/20 flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel Job
              </button>
            )}
          </div>
        </div>
      </div>

      {job.inputs && job.inputs.length > 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6">
          <h3 className="text-sm font-semibold mb-4">Input Files</h3>
          <div className="space-y-2">
            {job.inputs.map((input, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-900/40 rounded-xl">
                <span className="text-sm text-slate-200">{input.name}</span>
                {input.sizeBytes && (
                  <span className="text-xs text-slate-500">
                    {(input.sizeBytes / 1024 / 1024).toFixed(2)} MB
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {job.outputs && job.outputs.length > 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6">
          <h3 className="text-sm font-semibold mb-4">Output Files</h3>
          <div className="space-y-2">
            {job.outputs.map((output, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-900/40 rounded-xl">
                <span className="text-sm text-slate-200">{output.name}</span>
                <span className="text-xs text-slate-500 capitalize">{output.kind}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
