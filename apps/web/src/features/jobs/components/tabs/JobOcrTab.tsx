import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'

interface JobOcrTabProps {
  ocr?: { pages: { page: number; text: string }[] }
}

export default function JobOcrTab({ ocr }: JobOcrTabProps) {
  const [q, setQ] = useState('')
  const pages = ocr?.pages ?? []

  const filtered = useMemo(() => {
    if (!q.trim()) return pages
    const s = q.toLowerCase()
    return pages.filter((p) => (p.text ?? '').toLowerCase().includes(s))
  }, [q, pages])

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Search className="w-4 h-4 text-slate-500" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500"
          placeholder="Search inside OCR text..."
        />
      </div>

      <div className="space-y-3 max-h-[520px] overflow-auto">
        {filtered.map((p) => (
          <div key={p.page} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="text-xs text-slate-500 mb-2">Page {p.page}</div>
            <pre className="whitespace-pre-wrap text-sm text-slate-200">{p.text}</pre>
          </div>
        ))}
        {filtered.length === 0 && <div className="text-slate-500 text-sm">No matches</div>}
      </div>
    </div>
  )
}
