import { useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { useNexusAuth } from '../hooks/useNexusAuth';

export default function NexusLogin() {
  const { isAuthenticated, isLoading, error, login } = useNexusAuth();
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/nexus" replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await login(password);
    } catch {
      // Error handled in hook
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-shell flex items-center justify-center px-4">
      <div className="surface-panel w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <h1 className="font-jp text-3xl font-bold text-foreground">Nexus</h1>
          <p className="mt-2 text-sm text-muted">Dashboard privé — authentification requise</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-foreground">
              Mot de passe maître
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="focus-ring w-full rounded-xl border border-theme bg-(--input) px-4 py-3 text-foreground"
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <p className="rounded-xl border border-(--primary)/30 bg-(--primary)/10 px-4 py-3 text-sm text-foreground">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="focus-ring w-full rounded-xl bg-(--primary) px-4 py-3 font-semibold text-(--primary-foreground) transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}
