import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

type UseFetchOptions = {
  enabled?: boolean
  refetchInterval?: number | ((data: unknown) => number | undefined)
  /** Valeurs dont le changement doit relancer le fetch (ex. page, filtres). */
  deps?: readonly unknown[]
}

type UseFetchResult<T> = {
  data: T | null
  error: string | null
  loading: boolean
  refetch: () => void
}

export function useFetch<T>(
  fetcher: () => Promise<T>,
  options: UseFetchOptions = {},
): UseFetchResult<T> {
  const { enabled = true, refetchInterval, deps = [] } = options
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(enabled)
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  const depsKey = useMemo(() => JSON.stringify(deps), [deps])

  const run = useCallback(async () => {
    if (!enabled) return
    try {
      setError(null)
      const result = await fetcherRef.current()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [enabled])

  useEffect(() => {
    if (!enabled) {
      setLoading(false)
      return
    }

    setLoading(true)
    void run()
  }, [enabled, run, depsKey])

  const dataRef = useRef(data)
  dataRef.current = data

  useEffect(() => {
    if (!enabled || !refetchInterval) return

    const getInterval = () => {
      if (typeof refetchInterval === 'function') {
        return refetchInterval(dataRef.current)
      }
      return refetchInterval
    }

    const tick = () => {
      const interval = getInterval()
      if (!interval) return
      void run()
    }

    const interval = getInterval()
    if (!interval) return

    const id = window.setInterval(tick, interval)
    return () => window.clearInterval(id)
  }, [enabled, refetchInterval, run])

  return { data, error, loading, refetch: run }
}
