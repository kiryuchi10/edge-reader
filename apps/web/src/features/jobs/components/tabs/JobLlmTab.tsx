
interface JobLlmTabProps {
  llm?: { summary: string; extractedFields?: Record<string, any>; schema?: any }
}

export default function JobLlmTab({ llm }: JobLlmTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-950/40 p-6">
        <div className="text-sm font-semibold mb-3">LLM Summary</div>
        <div className="text-sm text-slate-200 whitespace-pre-wrap">
          {llm?.summary ?? 'No LLM summary yet.'}
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6">
          <div className="text-sm font-semibold mb-3">Extracted Fields</div>
          <pre className="text-xs text-slate-200 whitespace-pre-wrap overflow-auto max-h-64">
            {JSON.stringify(llm?.extractedFields ?? {}, null, 2)}
          </pre>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6">
          <div className="text-sm font-semibold mb-3">Schema Mapping</div>
          <pre className="text-xs text-slate-200 whitespace-pre-wrap overflow-auto max-h-64">
            {JSON.stringify(llm?.schema ?? {}, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}
