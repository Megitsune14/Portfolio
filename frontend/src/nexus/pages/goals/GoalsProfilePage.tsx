import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useFetch } from '@/hooks/useFetch'
import { getGoalsProfile } from '../../api/nexusApi'
import { useNexusPageTitle } from '../../layout/useNexusPageTitle'

export function GoalsProfilePage() {
  useNexusPageTitle('Profil')
  const { data, loading } = useFetch(getGoalsProfile)
  const profile = data?.profile

  if (loading) {
    return <Skeleton className="h-48 w-full max-w-lg rounded-xl" />
  }

  if (!profile) {
    return (
      <Card className="glass mx-auto max-w-lg">
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Profil non configuré.</p>
          <Button asChild className="mt-4 glow-primary">
            <Link to="/nexus/goals/configuration">Configurer le profil</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  const rows = [
    { label: 'Genre', value: profile.gender },
    { label: 'Taille', value: `${profile.heightCm} cm` },
    { label: 'Poids de référence', value: `${profile.weightKg} kg` },
    {
      label: 'Poids ciblé',
      value: profile.targetWeightKg != null ? `${profile.targetWeightKg} kg` : '-',
    },
    {
      label: 'Dernière mise à jour',
      value: new Date(profile.updatedAt).toLocaleString('fr-FR'),
    },
  ]

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-heading tracking-tight">Profil</h2>
          <p className="mt-1 text-sm text-muted-foreground">Informations physiques enregistrées</p>
        </div>
        <Button asChild variant="outline">
          <Link to="/nexus/goals/configuration">Modifier</Link>
        </Button>
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle className="font-heading">Détails</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between border-b border-border/40 py-2 last:border-0"
            >
              <span className="text-sm text-muted-foreground">{row.label}</span>
              <span className="font-medium">{row.value}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
