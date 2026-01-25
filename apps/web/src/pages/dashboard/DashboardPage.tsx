import React, { useMemo, useReducer, useRef } from 'react'
import {
  Upload,
  FileText,
  Activity,
  BarChart3,
  Settings,
  Search,
  Filter,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  TrendingUp,
  Database,
  Video,
  Image,
  FileSpreadsheet,
  Microscope,
  ChevronRight,
  RefreshCw,
  LayoutDashboard,
  Cpu,
  Wrench,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const FILE_TYPE = {
  CHROM: 'chromatogram',
  SPEC: 'spectrum',
  DOC: 'document',
  PANEL: 'panel',
  VIDEO: 'video',
}

const JOB_STATUS = {
  QUEUED: 'queued',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
}

function detectFileType(filename: string): string {
  const lower = filename.toLowerCase()
  if (/\.(mp4|mov|avi|mkv)$/.test(lower)) return FILE_TYPE.VIDEO
  if (lower.includes('hplc') || lower.includes('gc')) return FILE_TYPE.CHROM
  if (lower.includes('nmr') || lower.includes('ir') || lower.includes('ftir')) return FILE_TYPE.SPEC
  if (lower.includes('panel') || lower.includes('temp')) return FILE_TYPE.PANEL
  return FILE_TYPE.DOC
}

function nowHuman(): string {
  return 'Just now'
}

interface Job {
  id: string
  assetName: string
  assetType: string
  status: string
  time: string
  meta?: Record<string, any>
}

interface State {
  selectedFile: File | null
  isProcessing: boolean
  query: string
  filterType: string
  filterStatus: string
  recentJobs: Job[]
}

const initialState: State = {
  selectedFile: null,
  isProcessing: false,
  query: '',
  filterType: 'all',
  filterStatus: 'all',
  recentJobs: [
    {
      id: 'JOB-001',
      assetName: 'HPLC_Sample_A.jpg',
      assetType: FILE_TYPE.CHROM,
      status: JOB_STATUS.COMPLETED,
      meta: { purity: 98.5, peaks: 4 },
      time: '2 min ago',
    },
    {
      id: 'JOB-002',
      assetName: 'Lab_Report_Q4.pdf',
      assetType: FILE_TYPE.DOC,
      status: JOB_STATUS.COMPLETED,
      meta: { tables: 5, pages: 12 },
      time: '15 min ago',
    },
    {
      id: 'JOB-003',
      assetName: 'NMR_Spectrum_B.png',
      assetType: FILE_TYPE.SPEC,
      status: JOB_STATUS.PROCESSING,
      meta: { progress: 67 },
      time: 'Processing...',
    },
    {
      id: 'JOB-004',
      assetName: 'Temperature_Panel.mp4',
      assetType: FILE_TYPE.VIDEO,
      status: JOB_STATUS.COMPLETED,
      meta: { readings: 145 },
      time: '1 hour ago',
    },
    {
      id: 'JOB-005',
      assetName: 'Certificate_Analysis.pdf',
      assetType: FILE_TYPE.DOC,
      status: JOB_STATUS.COMPLETED,
      meta: { validated: true },
      time: '2 hours ago',
    },
  ],
}

type Action =
  | { type: 'UPLOAD_START'; file: File }
  | { type: 'UPLOAD_DONE'; job: Job }
  | { type: 'SET_QUERY'; value: string }
  | { type: 'SET_FILTER_TYPE'; value: string }
  | { type: 'SET_FILTER_STATUS'; value: string }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'UPLOAD_START':
      return { ...state, selectedFile: action.file, isProcessing: true }
    case 'UPLOAD_DONE':
      return {
        ...state,
        isProcessing: false,
        recentJobs: [action.job, ...state.recentJobs],
      }
    case 'SET_QUERY':
      return { ...state, query: action.value }
    case 'SET_FILTER_TYPE':
      return { ...state, filterType: action.value }
    case 'SET_FILTER_STATUS':
      return { ...state, filterStatus: action.value }
    default:
      return state
  }
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { text: string; cls: string; icon: any }> = {
    [JOB_STATUS.COMPLETED]: {
      text: 'Completed',
      cls: 'bg-green-500/10 text-green-400 border-green-500/20',
      icon: CheckCircle,
    },
    [JOB_STATUS.PROCESSING]: {
      text: 'Processing',
      cls: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      icon: Clock,
    },
    [JOB_STATUS.QUEUED]: {
      text: 'Queued',
      cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      icon: Clock,
    },
    [JOB_STATUS.FAILED]: {
      text: 'Failed',
      cls: 'bg-red-500/10 text-red-400 border-red-500/20',
      icon: AlertCircle,
    },
  }
  const item = map[status] || map[JOB_STATUS.QUEUED]
  const Icon = item.icon
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${item.cls}`}
    >
      <Icon className={`h-4 w-4 ${status === JOB_STATUS.PROCESSING ? 'animate-spin' : ''}`} />
      {item.text}
    </span>
  )
}

function TypeIcon({ type }: { type: string }) {
  const map: Record<string, any> = {
    [FILE_TYPE.CHROM]: Activity,
    [FILE_TYPE.SPEC]: Zap,
    [FILE_TYPE.DOC]: FileText,
    [FILE_TYPE.PANEL]: Microscope,
    [FILE_TYPE.VIDEO]: Video,
  }
  const Icon = map[type] || FileText
  return <Icon className="h-4 w-4 text-slate-300" />
}

function SectionCard({
  title,
  icon: Icon,
  children,
  right,
}: {
  title: string
  icon?: any
  children: React.ReactNode
  right?: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-slate-700/60 px-6 py-4">
        <div className="flex items-center gap-2">
          {Icon ? <Icon className="h-5 w-5 text-blue-400" /> : null}
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        {right}
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

export default function DashboardPage() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  const stats = useMemo(
    () => ({
      totalAnalyses: 1247,
      todayAnalyses: 23,
      avgProcessingTime: '1.2s',
      successRate: 98.7,
      activeStreams: 2,
    }),
    []
  )

  const contentTypes = useMemo(
    () => [
      {
        type: FILE_TYPE.CHROM,
        icon: Activity,
        label: 'HPLC/GC',
        count: 342,
        accent: 'from-blue-500/20 to-blue-600/5',
      },
      {
        type: FILE_TYPE.SPEC,
        icon: Zap,
        label: 'Spectra',
        count: 218,
        accent: 'from-purple-500/20 to-purple-600/5',
      },
      {
        type: FILE_TYPE.DOC,
        icon: FileText,
        label: 'Documents',
        count: 524,
        accent: 'from-green-500/20 to-green-600/5',
      },
      {
        type: FILE_TYPE.VIDEO,
        icon: Video,
        label: 'Videos',
        count: 163,
        accent: 'from-orange-500/20 to-orange-600/5',
      },
    ],
    []
  )

  function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    dispatch({ type: 'UPLOAD_START', file })

    setTimeout(() => {
      const type = detectFileType(file.name)
      const newJob: Job = {
        id: `JOB-${String(state.recentJobs.length + 1).padStart(3, '0')}`,
        assetName: file.name,
        assetType: type,
        status: JOB_STATUS.COMPLETED,
        time: nowHuman(),
        meta:
          type === FILE_TYPE.CHROM
            ? { purity: Math.random() * 5 + 95, peaks: Math.floor(Math.random() * 8) + 2 }
            : type === FILE_TYPE.DOC
              ? { tables: Math.floor(Math.random() * 8) + 1, pages: Math.floor(Math.random() * 30) + 1 }
              : type === FILE_TYPE.SPEC
                ? { peaks: Math.floor(Math.random() * 10) + 1 }
                : type === FILE_TYPE.VIDEO
                  ? { readings: Math.floor(Math.random() * 300) + 20 }
                  : { validated: true },
      }

      dispatch({ type: 'UPLOAD_DONE', job: newJob })
    }, 1400)
  }

  const filteredJobs = useMemo(() => {
    const q = state.query.trim().toLowerCase()
    return state.recentJobs.filter((j) => {
      const matchQuery = !q || j.assetName.toLowerCase().includes(q) || j.id.toLowerCase().includes(q)
      const matchType = state.filterType === 'all' || j.assetType === state.filterType
      const matchStatus = state.filterStatus === 'all' || j.status === state.filterStatus
      return matchQuery && matchType && matchStatus
    })
  }, [state.query, state.filterType, state.filterStatus, state.recentJobs])

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 text-white">
      <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
              <Microscope className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                Edge Reader
              </h1>
              <p className="text-xs text-slate-400">OCR • Table Extraction • LLM • Equipment Streaming</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 rounded-xl border border-green-500/20 bg-green-500/10 px-3 py-2">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-green-300">{stats.activeStreams} Active Streams</span>
            </div>
            <button className="rounded-xl border border-slate-800 bg-slate-900/40 p-2 hover:bg-slate-800/60">
              <Settings className="h-5 w-5 text-slate-300" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <KpiCard
            icon={Database}
            title="Total Analyses"
            value={stats.totalAnalyses.toLocaleString()}
            sub={`+${stats.todayAnalyses} today`}
          />
          <KpiCard icon={CheckCircle} title="Success Rate" value={`${stats.successRate}%`} sub="Last 30 days" />
          <KpiCard icon={Clock} title="Avg Processing" value={stats.avgProcessingTime} sub="Per analysis" />
          <KpiCard icon={BarChart3} title="Today's Activity" value={`${stats.todayAnalyses}`} sub="Real-time updates" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SectionCard
            title="Quick Analysis"
            icon={Upload}
            right={
              <button
                onClick={() => fileInputRef.current?.click()}
                className="rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800/60"
              >
                Choose file
              </button>
            }
          >
            <QuickUpload
              isProcessing={state.isProcessing}
              selectedFileName={state.selectedFile?.name}
              onFileChange={handleFileUpload}
              inputRef={fileInputRef}
            />
          </SectionCard>

          <SectionCard title="Pipelines" icon={LayoutDashboard}>
            <div className="grid grid-cols-2 gap-3">
              <PipelineTile
                icon={FileText}
                title="PDF OCR + Tables"
                desc="Extract text & tables, validate fields, export JSON/CSV"
                onClick={() => navigate('/jobs')}
              />
              <PipelineTile
                icon={Zap}
                title="LLM Structuring"
                desc="Schema mapping, entity extraction, QC checks"
                onClick={() => navigate('/jobs')}
              />
              <PipelineTile
                icon={Video}
                title="Video Analysis"
                desc="Realtime experiment video → timestamps, readings, events"
                onClick={() => navigate('/jobs')}
              />
              <PipelineTile
                icon={Cpu}
                title="Equipment Streams"
                desc="OPC UA telemetry → charts, alarms, run tracking"
                onClick={() => navigate('/equipment')}
              />
            </div>
          </SectionCard>

          <SectionCard title="System Health" icon={Wrench}>
            <div className="space-y-3 text-sm text-slate-300">
              <HealthRow label="API" value="OK" ok={true} />
              <HealthRow label="DB" value="OK" ok={true} />
              <HealthRow label="OPC UA Simulator" value="OK" ok={true} />
              <HealthRow label="OCR Worker" value="Ready" ok={true} />
              <HealthRow label="LLM Worker" value="Ready" ok={true} />
            </div>
            <p className="mt-4 text-xs text-slate-500">(MVP) These can be backed by a real /health endpoint + worker status API.</p>
          </SectionCard>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {contentTypes.map((item) => (
            <ContentTypeTile
              key={item.type}
              item={item}
              onClick={() => {
                dispatch({ type: 'SET_FILTER_TYPE', value: item.type })
                navigate('/jobs')
              }}
            />
          ))}
        </div>

        <SectionCard
          title="Recent Jobs"
          icon={Activity}
          right={
            <div className="flex items-center gap-2">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  value={state.query}
                  onChange={(e) => dispatch({ type: 'SET_QUERY', value: e.target.value })}
                  className="w-72 rounded-xl border border-slate-800 bg-slate-950/60 pl-9 pr-3 py-2 text-sm text-slate-200 placeholder:text-slate-600"
                  placeholder="Search job id or filename..."
                />
              </div>

              <select
                value={state.filterStatus}
                onChange={(e) => dispatch({ type: 'SET_FILTER_STATUS', value: e.target.value })}
                className="rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-200"
              >
                <option value="all">All Status</option>
                <option value={JOB_STATUS.COMPLETED}>Completed</option>
                <option value={JOB_STATUS.PROCESSING}>Processing</option>
                <option value={JOB_STATUS.FAILED}>Failed</option>
              </select>

              <button
                className="rounded-xl border border-slate-800 bg-slate-900/50 p-2 hover:bg-slate-800/60"
                title="Filter"
              >
                <Filter className="h-4 w-4 text-slate-300" />
              </button>
            </div>
          }
        >
          <RecentJobsTable jobs={filteredJobs} onJobClick={(jobId) => navigate(`/jobs/${jobId}`)} />
        </SectionCard>
      </main>
    </div>
  )
}

function KpiCard({ icon: Icon, title, value, sub }: { icon: any; title: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-6">
      <div className="flex items-center justify-between">
        <Icon className="h-8 w-8 text-slate-200" />
        <TrendingUp className="h-4 w-4 text-slate-500" />
      </div>
      <div className="mt-4 text-3xl font-bold tracking-tight">{value}</div>
      <div className="mt-1 text-sm text-slate-400">{title}</div>
      <div className="mt-2 text-xs text-slate-500">{sub}</div>
    </div>
  )
}

function QuickUpload({
  isProcessing,
  selectedFileName,
  onFileChange,
  inputRef,
}: {
  isProcessing: boolean
  selectedFileName?: string
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  inputRef: React.RefObject<HTMLInputElement>
}) {
  return (
    <div className="relative rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 p-8 text-center">
      <input
        ref={inputRef}
        type="file"
        onChange={onFileChange}
        className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
        accept="image/*,video/*,.pdf,.csv,.xlsx"
      />

      {isProcessing ? (
        <div className="space-y-4">
          <RefreshCw className="mx-auto h-10 w-10 text-blue-400 animate-spin" />
          <div className="text-sm text-slate-200">Processing</div>
          <div className="text-xs text-slate-500">{selectedFileName}</div>
          <div className="mx-auto h-2 w-full max-w-sm overflow-hidden rounded-full bg-slate-800">
            <div className="h-full w-2/3 bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse" />
          </div>
          <div className="text-xs text-slate-500">(MVP) Replace with real job progress via WS / polling.</div>
        </div>
      ) : (
        <div className="space-y-3">
          <Upload className="mx-auto h-10 w-10 text-slate-400" />
          <div className="text-base font-semibold">Drop files here or click to upload</div>
          <div className="text-sm text-slate-500">Images • Videos • PDFs • CSV • Excel</div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <Image className="h-4 w-4" />Images
            </span>
            <span className="inline-flex items-center gap-1">
              <Video className="h-4 w-4" />Videos
            </span>
            <span className="inline-flex items-center gap-1">
              <FileText className="h-4 w-4" />PDFs
            </span>
            <span className="inline-flex items-center gap-1">
              <FileSpreadsheet className="h-4 w-4" />Data
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

function PipelineTile({
  icon: Icon,
  title,
  desc,
  onClick,
}: {
  icon: any
  title: string
  desc: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 text-left hover:bg-slate-900/60 transition"
    >
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800/60">
          <Icon className="h-5 w-5 text-slate-200" />
        </div>
        <ChevronRight className="h-5 w-5 text-slate-600" />
      </div>
      <div className="mt-3 font-semibold">{title}</div>
      <div className="mt-1 text-xs text-slate-500">{desc}</div>
    </button>
  )
}

function ContentTypeTile({
  item,
  onClick,
}: {
  item: { type: string; icon: any; label: string; count: number; accent: string }
  onClick: () => void
}) {
  const Icon = item.icon
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border border-slate-800 bg-gradient-to-br ${item.accent} p-5 text-left hover:border-slate-700 transition`}
    >
      <div className="flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900/60 border border-slate-800">
          <Icon className="h-6 w-6 text-slate-100" />
        </div>
        <ChevronRight className="h-5 w-5 text-slate-500" />
      </div>
      <div className="mt-3 font-semibold">{item.label}</div>
      <div className="mt-1 text-2xl font-bold text-slate-100">{item.count}</div>
      <div className="mt-1 text-xs text-slate-500">Total processed</div>
    </button>
  )
}

function HealthRow({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3">
      <div className="text-slate-300">{label}</div>
      <div className={`text-xs ${ok ? 'text-green-400' : 'text-red-400'}`}>{value}</div>
    </div>
  )
}

function RecentJobsTable({ jobs, onJobClick }: { jobs: Job[]; onJobClick: (jobId: string) => void }) {
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
                  <TypeIcon type={j.assetType} />
                  <div className="text-sm font-medium text-slate-200">{j.assetName}</div>
                </button>
              </td>
              <td className="px-5 py-4">
                <span className="rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 text-xs text-slate-300 capitalize">
                  {j.assetType}
                </span>
              </td>
              <td className="px-5 py-4">
                <StatusPill status={j.status} />
              </td>
              <td className="px-5 py-4 text-sm">
                <JobMeta meta={j.meta} type={j.assetType} />
              </td>
              <td className="px-5 py-4 text-sm text-slate-400">{j.time}</td>
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

          {jobs.length === 0 ? (
            <tr>
              <td className="px-5 py-10 text-center text-sm text-slate-500" colSpan={7}>
                No jobs found. Try clearing filters.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  )
}

function JobMeta({ meta, type }: { meta?: Record<string, any>; type: string }) {
  if (!meta) return <span className="text-slate-500">-</span>

  if (type === FILE_TYPE.CHROM && meta.purity != null) {
    return (
      <span className="text-green-400">
        Purity: {Number(meta.purity).toFixed(1)}% · Peaks: {meta.peaks ?? '-'}
      </span>
    )
  }
  if (type === FILE_TYPE.DOC && meta.tables != null) {
    return (
      <span className="text-blue-400">
        {meta.tables} tables · {meta.pages ?? '-'} pages
      </span>
    )
  }
  if (type === FILE_TYPE.SPEC && meta.peaks != null) {
    return <span className="text-purple-400">Peaks: {meta.peaks}</span>
  }
  if (type === FILE_TYPE.VIDEO && meta.readings != null) {
    return <span className="text-orange-400">{meta.readings} readings</span>
  }
  if (meta.validated) {
    return <span className="text-green-400">Validated</span>
  }
  if (meta.progress != null) {
    return <span className="text-yellow-400">{meta.progress}% complete</span>
  }
  return <span className="text-slate-500">-</span>
}
