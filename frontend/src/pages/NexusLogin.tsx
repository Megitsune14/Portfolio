import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useNexusAuth } from '@/hooks/useNexusAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
      // Error handled in provider
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-shell relative flex min-h-screen items-center justify-center px-4">
      <div
        className="app-backdrop pointer-events-none -z-30 hidden dark:block"
        aria-hidden
        style={{
          background:
            'linear-gradient(168deg, oklch(0.09 0.08 292) 0%, oklch(0.11 0.09 288) 42%, oklch(0.06 0.055 305) 100%)',
        }}
      />
      <div
        className="app-backdrop pointer-events-none -z-30 dark:hidden"
        aria-hidden
        style={{
          background:
            'linear-gradient(168deg, oklch(0.97 0.02 296) 0%, oklch(0.985 0.013 82) 43%, oklch(0.92 0.05 292) 100%)',
        }}
      />

      <Card className="relative z-10 w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="font-jp text-3xl">Nexus</CardTitle>
          <CardDescription>Dashboard privé - authentification requise</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe maître</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>

            {error ? (
              <p className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-foreground">
                {error}
              </p>
            ) : null}

            <Button type="submit" className="w-full" disabled={isSubmitting || isLoading}>
              {isSubmitting ? 'Connexion…' : 'Se connecter'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button variant="ghost" asChild>
              <Link to="/">Retour au portfolio</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
