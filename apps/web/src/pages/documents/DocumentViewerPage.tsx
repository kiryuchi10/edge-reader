import { useParams } from 'react-router-dom'
import { PageViewer } from '../../components/common/PageViewer'

export default function DocumentViewerPage() {
  const { id } = useParams<{ id: string }>()

  return <PageViewer documentId={id || '1'} totalPages={5} initialPage={1} />
}
