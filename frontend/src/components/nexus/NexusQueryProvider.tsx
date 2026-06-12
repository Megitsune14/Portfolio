import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

const nexusQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

export function NexusQueryProvider({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={nexusQueryClient}>{children}</QueryClientProvider>;
}
