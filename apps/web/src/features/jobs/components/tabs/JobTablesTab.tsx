import { useState } from 'react'
import { Download } from 'lucide-react'

interface JobTablesTabProps {
  tables?: {
    tables: { id: string; title?: string; rows: any[][]; columns?: string[] }[]
  }
}

export default function JobTablesTab({ tables }: JobTablesTabProps) {
  const list = tables?.tables ?? []
  const [selected, setSelected] = useState(list[0]?.id)

  const table = list.find((t) => t.id === selected)

  const handleExport = (format: 'csv' | 'json') => {
    if (!table) return

    if (format === 'csv') {
      const csv = [
        table.columns?.join(',') || '',
        ...table.rows.map((row) => row.map((cell) => `"${String(cell)}"`).join(',')),
      ].join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `table-${selected}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } else {
      const json = JSON.stringify(table, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `table-${selected}.json`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6">
        <div className="text-sm font-semibold mb-3">Tables</div>
        <div className="space-y-2">
          {list.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelected(t.id)}
              className={`w-full text-left rounded-xl border px-3 py-2 text-sm transition ${
                selected === t.id
                  ? 'border-blue-500/40 bg-blue-500/10 text-blue-200'
                  : 'border-slate-800 bg-slate-950/50 text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              {t.title ?? `Table ${t.id}`}
            </button>
          ))}
          {list.length === 0 && <div className="text-slate-500 text-sm">No tables extracted</div>}
        </div>
      </div>

      <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-950/40 p-6 overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-semibold">Preview</div>
          {table && (
            <div className="flex gap-2">
              <button
                onClick={() => handleExport('csv')}
                className="rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2 text-xs hover:bg-slate-800/60 flex items-center gap-2"
              >
                <Download className="w-3 h-3" />
                CSV
              </button>
              <button
                onClick={() => handleExport('json')}
                className="rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2 text-xs hover:bg-slate-800/60 flex items-center gap-2"
              >
                <Download className="w-3 h-3" />
                JSON
              </button>
            </div>
          )}
        </div>

        {!table ? (
          <div className="text-slate-500 text-sm">Select a table to preview</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-900/60">
                <tr>
                  {table.columns?.map((col, idx) => (
                    <th key={idx} className="px-3 py-2 text-left text-xs text-slate-400 border-r border-slate-800">
                      {col}
                    </th>
                  ))}
                  {!table.columns && table.rows[0]?.map((_, idx) => (
                    <th key={idx} className="px-3 py-2 text-left text-xs text-slate-400 border-r border-slate-800">
                      Column {idx + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {table.rows.slice(0, 30).map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40">
                    {row.slice(0, 12).map((cell, c) => (
                      <td key={c} className="px-3 py-2 text-slate-200 border-r border-slate-900/60">
                        {String(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {table.rows.length > 30 && (
              <div className="mt-2 text-xs text-slate-500 text-center">
                Showing first 30 rows of {table.rows.length}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
