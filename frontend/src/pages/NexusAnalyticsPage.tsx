import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { NexusPageHeader } from '@/components/nexus/NexusPageHeader';
import { NexusStatCard } from '@/components/nexus/NexusStatCard';
import { NexusEmptyState, NexusErrorState, NexusLoadingState } from '@/components/nexus/NexusStates';
import { Badge } from '@/components/ui/badge';
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

function deviceLabel(deviceType: string | null): string {
  if (deviceType === 'mobile') return 'Mobile';
  if (deviceType === 'tablet') return 'Tablette';
  if (deviceType === 'desktop') return 'Desktop';
  return '—';
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
          description="Statistiques de visites du portfolio — géolocalisation, appareils et navigateurs."
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
        description="Statistiques de visites du portfolio — géolocalisation, appareils et navigateurs."
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
                <TableHead>Localisation</TableHead>
                <TableHead>Appareil</TableHead>
                <TableHead className="hidden md:table-cell">Navigateur</TableHead>
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
                    <TableCell className="font-mono text-xs">{visitor.ip}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span>{visitor.location}</span>
                        {visitor.region ? (
                          <span className="text-xs text-muted-foreground">{visitor.region}</span>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline" className="w-fit text-[10px]">
                          {deviceLabel(visitor.deviceType)}
                        </Badge>
                        {visitor.os ? (
                          <span className="text-xs text-muted-foreground">{visitor.os}</span>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {visitor.browser ?? '—'}
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
