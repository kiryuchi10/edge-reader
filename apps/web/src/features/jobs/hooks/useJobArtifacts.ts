import { useState, useEffect } from 'react'
import { JobArtifacts } from '../../../types/domain'
import { api } from '../../../lib/api'

export function useJobArtifacts(jobId: string) {
  const [data, setData] = useState<JobArtifacts | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchArtifacts = async () => {
      try {
        setIsLoading(true)
        const response = await api.get<JobArtifacts>(`/jobs/${jobId}/artifacts`)
        setData(response.data)
      } catch (err) {
        setError(err as Error)
      } finally {
        setIsLoading(false)
      }
    }

    if (jobId) {
      fetchArtifacts()
    }
  }, [jobId])

  return { data, isLoading, error }
}
