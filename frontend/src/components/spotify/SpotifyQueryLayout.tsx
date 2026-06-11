import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Outlet } from 'react-router-dom';

const spotifyQueryClient = new QueryClient();

export default function SpotifyQueryLayout() {
  return (
    <QueryClientProvider client={spotifyQueryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
