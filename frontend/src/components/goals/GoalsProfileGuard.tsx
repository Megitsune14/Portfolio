import { useQuery } from '@tanstack/react-query';
import { Navigate, Outlet } from 'react-router-dom';
import { GoalsPageLayout } from './GoalsPageLayout';
import { goalsApiRequest } from '../../utils/nexus-goals-api';
import type { Profile } from '../../types/goals';

export default function GoalsProfileGuard() {
  const { data, isLoading } = useQuery({
    queryKey: ['nexus-goals-profile'],
    queryFn: () => goalsApiRequest<{ profile: Profile | null }>('/profile'),
  });

  if (isLoading) {
    return (
      <GoalsPageLayout>
        <div className="flex flex-1 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-(--primary)" />
        </div>
      </GoalsPageLayout>
    );
  }

  if (!data?.profile) {
    return <Navigate to="/nexus/goals/onboarding" replace />;
  }

  return <Outlet />;
}
