import { useParams } from 'react-router-dom'
import { EDAReport } from '../../components/common/EDAReport'

export default function EDAReportPage() {
  const { id } = useParams<{ id: string }>()

  return <EDAReport jobId={id} />
}
