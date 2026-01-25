import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useJobDetail } from '../../features/jobs/hooks/useJobDetail'
import { useJobArtifacts } from '../../features/jobs/hooks/useJobArtifacts'
import JobTabs from '../../features/jobs/components/JobTabs'
import JobOverviewTab from '../../features/jobs/components/tabs/JobOverviewTab'
import JobOcrTab from '../../features/jobs/components/tabs/JobOcrTab'
import JobTablesTab from '../../features/jobs/components/tabs/JobTablesTab'
import JobLlmTab from '../../features/jobs/components/tabs/JobLlmTab'
import JobLogsTab from '../../features/jobs/components/tabs/JobLogsTab'

const TABS = ['overview', 'ocr', 'tables', 'llm', 'logs'] as const
type Tab = typeof TABS[number]

export default function JobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>()
  const [tab, setTab] = useState<Tab>('overview')

  const { data: job, isLoading, error } = useJobDetail(jobId!)
  const { data: artifacts } = useJobArtifacts(jobId!)

  if (isLoading) return <div className="text-slate-400">Loading...</div>
  if (error) return <div className="text-red-400">Failed to load: {String(error)}</div>
  if (!job) return <div className="text-slate-400">Not found</div>

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs text-slate-500">Job ID</div>
            <div className="text-lg font-mono text-slate-200">{job.id}</div>
            <div className="mt-2 text-sm text-slate-300">{job.assetName}</div>
          </div>
          <JobTabs tab={tab} onChange={setTab} />
        </div>
      </div>

      {tab === 'overview' && <JobOverviewTab job={job} />}
      {tab === 'ocr' && <JobOcrTab ocr={artifacts?.ocr} />}
      {tab === 'tables' && <JobTablesTab tables={artifacts?.tables} />}
      {tab === 'llm' && <JobLlmTab llm={artifacts?.llm} />}
      {tab === 'logs' && <JobLogsTab logs={artifacts?.logs} />}
    </div>
  )
}
