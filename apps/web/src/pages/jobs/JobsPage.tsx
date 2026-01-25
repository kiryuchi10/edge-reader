import { useState } from 'react'
import { Search, Filter } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useJobs } from '../../features/jobs/hooks/useJobs'
import JobsTable from '../../features/jobs/components/JobsTable'
import JobFiltersBar from '../../features/jobs/components/JobFiltersBar'

export default function JobsPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [type, setType] = useState<'all' | string>('all')
  const [status, setStatus] = useState<'all' | string>('all')

  const { data, isLoading, error } = useJobs({ query, type, status })

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">Jobs</h1>
          <p className="text-sm text-slate-400">OCR • Tables • LLM • Video • Equipment ingestion jobs</p>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-80 rounded-xl border border-slate-800 bg-slate-950/60 pl-9 pr-3 py-2 text-sm text-slate-200 placeholder:text-slate-500"
              placeholder="Search job id / filename..."
            />
          </div>
          <button className="rounded-xl border border-slate-800 bg-slate-900/50 p-2 hover:bg-slate-800/60">
            <Filter className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </div>

      <JobFiltersBar type={type} status={status} onType={setType} onStatus={setStatus} />

      <JobsTable
        jobs={data?.items ?? []}
        loading={isLoading}
        error={error?.message}
        onJobClick={(jobId) => navigate(`/jobs/${jobId}`)}
      />
    </div>
  )
}
