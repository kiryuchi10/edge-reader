type Tab = 'overview' | 'ocr' | 'tables' | 'llm' | 'logs'

interface JobTabsProps {
  tab: Tab
  onChange: (tab: Tab) => void
}

export default function JobTabs({ tab, onChange }: JobTabsProps) {
  const items = [
    { id: 'overview', label: 'Overview' },
    { id: 'ocr', label: 'OCR Text' },
    { id: 'tables', label: 'Tables' },
    { id: 'llm', label: 'LLM' },
    { id: 'logs', label: 'Logs' },
  ]

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((it) => (
        <button
          key={it.id}
          onClick={() => onChange(it.id as Tab)}
          className={`rounded-xl border px-3 py-2 text-xs transition ${
            tab === it.id
              ? 'border-blue-500/40 bg-blue-500/10 text-blue-200'
              : 'border-slate-800 bg-slate-950/50 text-slate-300 hover:bg-slate-900/60'
          }`}
        >
          {it.label}
        </button>
      ))}
    </div>
  )
}
