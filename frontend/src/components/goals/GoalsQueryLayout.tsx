import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Outlet } from 'react-router-dom';

const goalsQueryClient = new QueryClient();

export default function GoalsQueryLayout() {
  return (
    <QueryClientProvider client={goalsQueryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
