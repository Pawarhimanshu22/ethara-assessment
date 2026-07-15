import { useState, useCallback, useEffect, useRef } from 'react'

/**
 * Wraps an async fetcher function with consistent loading/error/data state.
 *
 * const { data, loading, error, refetch } = useApiState(
 *   () => employeeService.list(params),
 *   [params]
 * )
 */
export function useApiState(fetcher, deps = [], { immediate = true } = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(immediate)
  const [error, setError] = useState(null)
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  const run = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetcherRef.current()
      setData(result)
      return result
    } catch (err) {
      setError(err?.message || 'Failed to load data.')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (immediate) {
      run().catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, setData, loading, error, refetch: run }
}