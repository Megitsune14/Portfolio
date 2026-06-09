import { useQuery } from '@tanstack/react-query';
import { Navigate, Outlet } from 'react-router-dom';
import { goalsApiRequest } from '../../utils/nexus-goals-api';
import type { Profile } from '../../types/goals';

export default function GoalsProfileGuard() {
  const { data, isLoading } = useQuery({
    queryKey: ['nexus-goals-profile'],
    queryFn: () => goalsApiRequest<{ profile: Profile | null }>('/profile'),
  });

  if (isLoading) {
    return (
      <div className="app-shell flex items-center justify-center px-4">
        <div className="surface-panel w-full max-w-md p-8 text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-(--primary)" />
          <p className="text-muted">Chargement du profil…</p>
        </div>
      </div>
    );
  }

  if (!data?.profile) {
    return <Navigate to="/nexus/goals/onboarding" replace />;
  }

  return <Outlet />;
}
