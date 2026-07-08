import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { clearNexusToken, getNexusToken, nexusLogin, nexusMe } from '../api/nexusClient'

interface NexusAuthContextValue {
  isAuthenticated: boolean
  isLoading: boolean
  login: (password: string) => Promise<void>
  logout: () => void
  refresh: () => Promise<boolean>
}

const NexusAuthContext = createContext<NexusAuthContextValue | null>(null)

export function NexusAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(async () => {
    const token = getNexusToken()
    if (!token) {
      setIsAuthenticated(false)
      return false
    }

    try {
      await nexusMe()
      setIsAuthenticated(true)
      return true
    } catch {
      clearNexusToken()
      setIsAuthenticated(false)
      return false
    }
  }, [])

  useEffect(() => {
    void refresh().finally(() => setIsLoading(false))
  }, [refresh])

  const login = useCallback(async (password: string) => {
    await nexusLogin(password)
    setIsAuthenticated(true)
  }, [])

  const logout = useCallback(() => {
    clearNexusToken()
    setIsAuthenticated(false)
  }, [])

  const value = useMemo(
    () => ({ isAuthenticated, isLoading, login, logout, refresh }),
    [isAuthenticated, isLoading, login, logout, refresh],
  )

  return <NexusAuthContext.Provider value={value}>{children}</NexusAuthContext.Provider>
}

export function useNexusAuth() {
  const ctx = useContext(NexusAuthContext)
  if (!ctx) {
    throw new Error('useNexusAuth must be used within NexusAuthProvider')
  }
  return ctx
}
