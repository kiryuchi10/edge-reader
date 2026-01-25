import { CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { JobStatus } from '../../../types/domain'

interface JobStatusPillProps {
  status: JobStatus
}

export default function JobStatusPill({ status }: JobStatusPillProps) {
  const map: Record<JobStatus, { text: string; cls: string; icon: any }> = {
    completed: {
      text: 'Completed',
      cls: 'bg-green-500/10 text-green-400 border-green-500/20',
      icon: CheckCircle,
    },
    processing: {
      text: 'Processing',
      cls: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      icon: Clock,
    },
    queued: {
      text: 'Queued',
      cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      icon: Clock,
    },
    failed: {
      text: 'Failed',
      cls: 'bg-red-500/10 text-red-400 border-red-500/20',
      icon: AlertCircle,
    },
  }

  const item = map[status] || map.queued
  const Icon = item.icon

  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${item.cls}`}>
      <Icon className={`h-4 w-4 ${status === 'processing' ? 'animate-spin' : ''}`} />
      {item.text}
    </span>
  )
}
