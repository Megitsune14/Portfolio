import { Navigate, Outlet } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { useNexusAuth } from '@/hooks/useNexusAuth';

export default function NexusProtectedRoute() {
  const { isAuthenticated, isLoading } = useNexusAuth();

  if (isLoading) {
    return (
      <div className="app-shell flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
            <p className="text-muted-foreground">Vérification de la session…</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/nexus/login" replace />;
  }

  return <Outlet />;
}
