import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { NexusPageHeader } from '@/components/nexus/NexusPageHeader';
import { NexusStatCard } from '@/components/nexus/NexusStatCard';
import { NexusEmptyState, NexusErrorState, NexusLoadingState } from '@/components/nexus/NexusStates';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { fetchVisitorStats, fetchVisitors } from '@/utils/nexus-api';

const VISITORS_PAGE_SIZE = 25;

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

export default function NexusAnalyticsPage() {
  const [page, setPage] = useState(1);

  const statsQuery = useQuery({
    queryKey: ['nexus-visitor-stats'],
    queryFn: fetchVisitorStats,
  });

  const visitorsQuery = useQuery({
    queryKey: ['nexus-visitors', page],
    queryFn: () => fetchVisitors(page, VISITORS_PAGE_SIZE),
  });

  const totalPages = visitorsQuery.data?.pagination.totalPages ?? 1;
  const visitors = visitorsQuery.data?.visitors ?? [];

  if (statsQuery.isLoading && visitorsQuery.isLoading) {
    return (
      <>
        <NexusPageHeader
          title="Analytics"
          description="Statistiques de visites du portfolio — pages vues, IPs uniques et provenance."
        />
        <NexusLoadingState />
      </>
    );
  }

  if (statsQuery.isError || visitorsQuery.isError) {
    return (
      <>
        <NexusPageHeader title="Analytics" />
        <NexusErrorState message="Impossible de charger les données analytics." />
      </>
    );
  }

  return (
    <>
      <NexusPageHeader
        title="Analytics"
        description="Statistiques de visites du portfolio — pages vues, IPs uniques et provenance."
      />

      {statsQuery.data ? (
        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <NexusStatCard label="Visites totales" value={statsQuery.data.totalVisits} />
          <NexusStatCard label="IPs uniques" value={statsQuery.data.uniqueIps} />
        </section>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Visites récentes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Page</TableHead>
                <TableHead>Provenance</TableHead>
                <TableHead className="hidden lg:table-cell">User-Agent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visitors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <NexusEmptyState message="Aucune visite enregistrée pour le moment." />
                  </TableCell>
                </TableRow>
              ) : (
                visitors.map((visitor) => (
                  <TableRow key={visitor.id}>
                    <TableCell className="whitespace-nowrap">{formatDate(visitor.createdAt)}</TableCell>
                    <TableCell className="font-mono">{visitor.ip}</TableCell>
                    <TableCell className="font-mono">{visitor.path}</TableCell>
                    <TableCell>
                      {visitor.referrer ? truncate(visitor.referrer, 40) : '—'}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground lg:table-cell" title={visitor.userAgent}>
                      {truncate(visitor.userAgent, 50)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {totalPages > 1 ? (
            <div className="flex items-center justify-between border-t border-border px-6 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1 || visitorsQuery.isFetching}
              >
                Précédent
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={page >= totalPages || visitorsQuery.isFetching}
              >
                Suivant
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </>
  );
}
