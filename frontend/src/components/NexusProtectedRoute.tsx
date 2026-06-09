import { Navigate, Outlet } from 'react-router-dom';
import { useNexusAuth } from '../hooks/useNexusAuth';

export default function NexusProtectedRoute() {
  const { isAuthenticated, isLoading } = useNexusAuth();

  if (isLoading) {
    return (
      <div className="app-shell flex items-center justify-center px-4">
        <div className="surface-panel w-full max-w-md p-8 text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-(--primary)" />
          <p className="text-muted">Vérification de la session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/nexus/login" replace />;
  }

  return <Outlet />;
}
