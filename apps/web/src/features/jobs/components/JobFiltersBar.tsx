
interface JobFiltersBarProps {
  type: string
  status: string
  onType: (type: string) => void
  onStatus: (status: string) => void
}

export default function JobFiltersBar({ type, status, onType, onStatus }: JobFiltersBarProps) {
  return (
    <div className="flex items-center gap-3">
      <select
        value={type}
        onChange={(e) => onType(e.target.value)}
        className="rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-200"
      >
        <option value="all">All Types</option>
        <option value="document">Documents</option>
        <option value="chromatogram">Chromatograms</option>
        <option value="spectrum">Spectra</option>
        <option value="video">Videos</option>
        <option value="panel">Panels</option>
      </select>

      <select
        value={status}
        onChange={(e) => onStatus(e.target.value)}
        className="rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-200"
      >
        <option value="all">All Status</option>
        <option value="completed">Completed</option>
        <option value="processing">Processing</option>
        <option value="queued">Queued</option>
        <option value="failed">Failed</option>
      </select>
    </div>
  )
}
