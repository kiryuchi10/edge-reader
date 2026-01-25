import { useState, useEffect } from 'react'
import { JobDetail } from '../../../types/domain'
import { api } from '../../../lib/api'

export function useJobDetail(jobId: string) {
  const [data, setData] = useState<JobDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setIsLoading(true)
        const response = await api.get<JobDetail>(`/jobs/${jobId}`)
        setData(response.data)
      } catch (err) {
        setError(err as Error)
      } finally {
        setIsLoading(false)
      }
    }

    if (jobId) {
      fetchJob()
      const interval = setInterval(fetchJob, 2000)
      return () => clearInterval(interval)
    }
  }, [jobId])

  return { data, isLoading, error }
}
