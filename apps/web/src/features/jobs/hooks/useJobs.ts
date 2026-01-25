import { useState, useEffect } from 'react'
import { Job } from '../../../types/domain'
import { api } from '../../../lib/api'

interface UseJobsParams {
  query?: string
  type?: string
  status?: string
}

interface JobsResponse {
  items: Job[]
  total: number
  cursor?: string
}

export function useJobs(params: UseJobsParams) {
  const [data, setData] = useState<JobsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoading(true)
        const queryParams = new URLSearchParams()
        if (params.query) queryParams.append('query', params.query)
        if (params.type && params.type !== 'all') queryParams.append('type', params.type)
        if (params.status && params.status !== 'all') queryParams.append('status', params.status)

        const response = await api.get<JobsResponse>(`/jobs?${queryParams.toString()}`)
        setData(response.data)
      } catch (err) {
        setError(err as Error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchJobs()
    const interval = setInterval(fetchJobs, 5000)
    return () => clearInterval(interval)
  }, [params.query, params.type, params.status])

  return { data, isLoading, error }
}
