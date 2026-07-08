import { Navigate, Outlet } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'
import { useGoalsProfile } from './GoalsProfileProvider'

export function GoalsConfiguredRoute() {
  const { isConfigured, loading } = useGoalsProfile()

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    )
  }

  if (!isConfigured) {
    return <Navigate to="/nexus/goals/configuration" replace />
  }

  return <Outlet />
}
