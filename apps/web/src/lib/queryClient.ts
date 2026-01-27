import { QueryClient } from '@tanstack/react-query'

/**
 * React Query Client Configuration
 * 
 * Provides default options for data fetching:
 * - Refetch on window focus: disabled (for real-time apps)
 * - Retry: 1 attempt for failed requests
 * - Stale time: 5 seconds (data considered fresh for 5s)
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5000,
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    },
    mutations: {
      retry: 1,
    },
  },
})
