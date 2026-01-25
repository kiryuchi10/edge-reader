import { JobType } from '../../../types/domain'

interface JobTypeBadgeProps {
  type: JobType
}

export default function JobTypeBadge({ type }: JobTypeBadgeProps) {
  return (
    <span className="rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 text-xs text-slate-300 capitalize">
      {type}
    </span>
  )
}
