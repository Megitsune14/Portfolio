import { useQuery } from '@tanstack/react-query';
import { Navigate, Outlet } from 'react-router-dom';
import { NexusLoadingState } from '@/components/nexus/NexusStates';
import { goalsApiRequest } from '@/utils/nexus-goals-api';
import type { Profile } from '@/types/goals';

export default function GoalsProfileGuard() {
  const { data, isLoading } = useQuery({
    queryKey: ['nexus-goals-profile'],
    queryFn: () => goalsApiRequest<{ profile: Profile | null }>('/profile'),
  });

  if (isLoading) {
    return <NexusLoadingState />;
  }

  if (!data?.profile) {
    return <Navigate to="/nexus/goals/onboarding" replace />;
  }

  return <Outlet />;
}
