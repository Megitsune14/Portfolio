import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { Outlet } from 'react-router-dom'
import { getGoalsProfile } from '../api/nexusApi'
import type { NexusProfile } from '../types/nexus'

interface GoalsProfileContextValue {
  profile: NexusProfile | null
  isConfigured: boolean
  loading: boolean
  refreshProfile: () => Promise<void>
}

const GoalsProfileContext = createContext<GoalsProfileContextValue | null>(null)

export function GoalsProfileProvider({ children }: { children?: ReactNode }) {
  const [profile, setProfile] = useState<NexusProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshProfile = useCallback(async () => {
    try {
      const { profile: data } = await getGoalsProfile()
      setProfile(data)
    } catch {
      setProfile(null)
    }
  }, [])

  useEffect(() => {
    void refreshProfile().finally(() => setLoading(false))
  }, [refreshProfile])

  const value = useMemo(
    () => ({
      profile,
      isConfigured: profile != null,
      loading,
      refreshProfile,
    }),
    [profile, loading, refreshProfile],
  )

  return (
    <GoalsProfileContext.Provider value={value}>
      {children ?? <Outlet />}
    </GoalsProfileContext.Provider>
  )
}

export function useGoalsProfile() {
  const ctx = useContext(GoalsProfileContext)
  if (!ctx) {
    throw new Error('useGoalsProfile must be used within GoalsProfileProvider')
  }
  return ctx
}
