import { JobType } from '../../../types/domain'

interface JobMetaProps {
  meta?: Record<string, any>
  type: JobType
}

export default function JobMeta({ meta, type }: JobMetaProps) {
  if (!meta) return <span className="text-slate-500">-</span>

  if (type === 'chromatogram' && meta.purity != null) {
    return (
      <span className="text-green-400">
        Purity: {Number(meta.purity).toFixed(1)}% · Peaks: {meta.peaks ?? '-'}
      </span>
    )
  }
  if (type === 'document' && meta.tables != null) {
    return (
      <span className="text-blue-400">
        {meta.tables} tables · {meta.pages ?? '-'} pages
      </span>
    )
  }
  if (type === 'spectrum' && meta.peaks != null) {
    return <span className="text-purple-400">Peaks: {meta.peaks}</span>
  }
  if (type === 'video' && meta.readings != null) {
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
