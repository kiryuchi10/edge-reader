
interface JobLogsTabProps {
  logs?: { lines: string[] }
}

export default function JobLogsTab({ logs }: JobLogsTabProps) {
  const lines = logs?.lines ?? []

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6">
      <div className="text-sm font-semibold mb-4">Job Logs</div>
      <div className="bg-slate-900/60 rounded-xl p-4 max-h-[600px] overflow-auto">
        {lines.length === 0 ? (
          <div className="text-slate-500 text-sm">No logs available</div>
        ) : (
          <pre className="text-xs text-slate-200 font-mono whitespace-pre-wrap">
            {lines.join('\n')}
          </pre>
        )}
      </div>
    </div>
  )
}
