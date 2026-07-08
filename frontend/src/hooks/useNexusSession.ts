import { useEffect, useState } from 'react'
import { clearNexusToken, getNexusToken, nexusMe } from '@/nexus/api/nexusClient'

export function useNexusSession() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function check() {
      const token = getNexusToken()
      if (!token) {
        if (!cancelled) {
          setIsAuthenticated(false)
          setIsLoading(false)
        }
        return
      }

      try {
        await nexusMe()
        if (!cancelled) setIsAuthenticated(true)
      } catch {
        clearNexusToken()
        if (!cancelled) setIsAuthenticated(false)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void check()
    return () => {
      cancelled = true
    }
  }, [])

  return { isAuthenticated, isLoading }
}
