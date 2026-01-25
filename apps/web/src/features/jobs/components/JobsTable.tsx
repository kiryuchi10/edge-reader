import { FileText, Download } from 'lucide-react'
import { Job } from '../../../types/domain'
import JobStatusPill from './JobStatusPill'
import JobTypeBadge from './JobTypeBadge'
import JobMeta from './JobMeta'

interface JobsTableProps {
  jobs: Job[]
  loading?: boolean
  error?: string
  onJobClick: (jobId: string) => void
}

export default function JobsTable({ jobs, loading, error, onJobClick }: JobsTableProps) {
  if (loading) {
    return <div className="text-center py-12 text-slate-400">Loading jobs...</div>
  }

  if (error) {
    return <div className="text-center py-12 text-red-400">Error: {error}</div>
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800">
      <table className="min-w-full">
        <thead className="bg-slate-950/70">
          <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
            <th className="px-5 py-4">Job</th>
            <th className="px-5 py-4">Asset</th>
            <th className="px-5 py-4">Type</th>
            <th className="px-5 py-4">Status</th>
            <th className="px-5 py-4">Result</th>
            <th className="px-5 py-4">Time</th>
            <th className="px-5 py-4">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-800 bg-slate-950/20">
          {jobs.map((j) => (
            <tr key={j.id} className="hover:bg-slate-900/40 transition">
              <td className="px-5 py-4 text-xs font-mono text-slate-400">{j.id}</td>
              <td className="px-5 py-4">
                <button
                  onClick={() => onJobClick(j.id)}
                  className="flex items-center gap-3 hover:text-blue-400 transition-colors"
                >
                  <div className="text-sm font-medium text-slate-200">{j.assetName}</div>
                </button>
              </td>
              <td className="px-5 py-4">
                <JobTypeBadge type={j.assetType} />
              </td>
              <td className="px-5 py-4">
                <JobStatusPill status={j.status} />
              </td>
              <td className="px-5 py-4 text-sm">
                <JobMeta meta={j.meta} type={j.assetType} />
              </td>
              <td className="px-5 py-4 text-sm text-slate-400">
                {new Date(j.createdAt).toLocaleString()}
              </td>
              <td className="px-5 py-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onJobClick(j.id)}
                    className="rounded-lg border border-slate-800 bg-slate-900/50 p-2 hover:bg-slate-800/70"
                    title="View"
                  >
                    <FileText className="h-4 w-4 text-slate-300" />
                  </button>
                  <button
                    className="rounded-lg border border-slate-800 bg-slate-900/50 p-2 hover:bg-slate-800/70"
                    title="Download"
                  >
                    <Download className="h-4 w-4 text-slate-300" />
                  </button>
                </div>
              </td>
            </tr>
          ))}

          {jobs.length === 0 && (
            <tr>
              <td className="px-5 py-10 text-center text-sm text-slate-500" colSpan={7}>
                No jobs found. Try clearing filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
