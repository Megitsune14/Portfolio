import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNexusAuth } from '../hooks/useNexusAuth';
import {
  fetchVisitorStats,
  fetchVisitors,
  type VisitorRecord,
  type VisitorStats,
} from '../utils/nexus-api';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function truncate(value: string, max = 60): string {
  return value.length > max ? `${value.slice(0, max)}…` : value;
}

export default function NexusDashboard() {
  const { logout } = useNexusAuth();
  const [stats, setStats] = useState<VisitorStats | null>(null);
  const [visitors, setVisitors] = useState<VisitorRecord[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const [statsData, visitorsData] = await Promise.all([
          fetchVisitorStats(),
          fetchVisitors(page),
        ]);

        if (!cancelled) {
          setStats(statsData);
          setVisitors(visitorsData.visitors);
          setTotalPages(visitorsData.pagination.totalPages || 1);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Impossible de charger les données');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [page]);

  return (
    <div className="app-shell min-h-screen px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-jp text-3xl font-bold text-foreground sm:text-4xl">Nexus</h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/nexus/goals/dashboard"
              className="focus-ring rounded-xl border border-theme px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-(--secondary)"
            >
              Goals
            </Link>
            <Link
              to="/"
              className="focus-ring rounded-xl border border-theme px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-(--secondary)"
            >
              Retour au site
            </Link>
            <button
              type="button"
              onClick={logout}
              className="focus-ring rounded-xl bg-(--primary) px-4 py-2 text-sm font-semibold text-(--primary-foreground) transition-opacity hover:opacity-90"
            >
              Déconnexion
            </button>
          </div>
        </header>

        {error && (
          <div className="surface-panel mb-6 p-4 text-sm text-foreground">{error}</div>
        )}

        {isLoading && !stats ? (
          <div className="surface-panel flex items-center justify-center p-12">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-(--primary)" />
          </div>
        ) : (
          <>
            {stats && (
              <section className="mb-8 grid gap-4 sm:grid-cols-2">
                <StatCard label="Visites totales" value={stats.totalVisits} />
                <StatCard label="IPs uniques" value={stats.uniqueIps} />
              </section>
            )}

            <section className="surface-panel overflow-hidden">
              <div className="border-b border-theme px-6 py-4">
                <h2 className="font-jp text-xl font-bold text-foreground">Visites récentes</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-(--secondary)/40 text-muted">
                    <tr>
                      <th className="px-6 py-3 font-medium">Date</th>
                      <th className="px-6 py-3 font-medium">IP</th>
                      <th className="px-6 py-3 font-medium">Page</th>
                      <th className="px-6 py-3 font-medium">Provenance</th>
                      <th className="px-6 py-3 font-medium">User-Agent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visitors.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-muted">
                          Aucune visite enregistrée pour le moment
                        </td>
                      </tr>
                    ) : (
                      visitors.map((visitor) => (
                        <tr key={visitor.id} className="border-t border-theme/60">
                          <td className="px-6 py-4 whitespace-nowrap text-foreground">
                            {formatDate(visitor.createdAt)}
                          </td>
                          <td className="px-6 py-4 font-mono text-foreground">{visitor.ip}</td>
                          <td className="px-6 py-4 font-mono text-foreground">{visitor.path}</td>
                          <td className="px-6 py-4 text-foreground">
                            {visitor.referrer ? truncate(visitor.referrer, 40) : '—'}
                          </td>
                          <td className="px-6 py-4 text-muted" title={visitor.userAgent}>
                            {truncate(visitor.userAgent, 50)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-theme px-6 py-4">
                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    disabled={page <= 1 || isLoading}
                    className="focus-ring rounded-lg border border-theme px-3 py-1.5 text-sm disabled:opacity-50"
                  >
                    Précédent
                  </button>
                  <span className="text-sm text-muted">
                    Page {page} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                    disabled={page >= totalPages || isLoading}
                    className="focus-ring rounded-lg border border-theme px-3 py-1.5 text-sm disabled:opacity-50"
                  >
                    Suivant
                  </button>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="surface-panel p-6">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 font-jp text-3xl font-bold text-foreground">{value.toLocaleString('fr-FR')}</p>
    </div>
  );
}
