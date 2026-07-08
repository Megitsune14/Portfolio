import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useFetch } from '@/hooks/useFetch'
import { getVisitors, getVisitorStats } from '../api/nexusApi'
import { useNexusPageTitle } from '../layout/useNexusPageTitle'

const PAGE_SIZE = 25

export function NexusAnalyticsPage() {
  useNexusPageTitle('Analytics')
  const [page, setPage] = useState(1)
  const stats = useFetch(getVisitorStats)
  const visitors = useFetch(() => getVisitors(page, PAGE_SIZE), { deps: [page] })

  const pagination = visitors.data?.pagination
  const visitorList = visitors.data?.visitors ?? []
  const showPagination = pagination && pagination.total > 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-heading tracking-tight">Analytics</h2>
        <p className="mt-1 text-sm text-muted-foreground">Visiteurs du portfolio</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total visites</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <p className="text-3xl font-bold font-heading text-primary">
                {stats.data?.totalVisits ?? 0}
              </p>
            )}
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">IP uniques</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <p className="text-3xl font-bold font-heading text-accent">
                {stats.data?.uniqueIps ?? 0}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="glass overflow-hidden">
        <CardHeader>
          <CardTitle className="font-heading">Visites récentes</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          {visitors.loading ? (
            <div className="space-y-2 p-6">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : visitorList.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">Aucune visite enregistrée.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">IP</th>
                  <th className="px-4 py-3 font-medium">Lieu</th>
                  <th className="px-4 py-3 font-medium">Navigateur</th>
                  <th className="px-4 py-3 font-medium">Appareil</th>
                </tr>
              </thead>
              <tbody>
                {visitorList.map((v) => (
                  <tr key={v.id} className="border-b border-border/40">
                    <td className="px-4 py-3 whitespace-nowrap">
                      {new Date(v.createdAt).toLocaleString('fr-FR')}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{v.ip}</td>
                    <td className="px-4 py-3">{v.location}</td>
                    <td className="px-4 py-3">{v.browser ?? '-'}</td>
                    <td className="px-4 py-3">{v.device}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
        {showPagination && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 px-4 py-3">
            <p className="text-xs text-muted-foreground">
              {pagination.total} visite{pagination.total > 1 ? 's' : ''} · page {pagination.page}{' '}
              sur {pagination.totalPages} · {PAGE_SIZE} par page
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || visitors.loading}
                onClick={() => setPage(1)}
              >
                Début
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || visitors.loading}
                onClick={() => setPage((p) => p - 1)}
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.totalPages || visitors.loading}
                onClick={() => setPage((p) => p + 1)}
              >
                Suivant
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.totalPages || visitors.loading}
                onClick={() => setPage(pagination.totalPages)}
              >
                Fin
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
