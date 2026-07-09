import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { putGoalsProfile } from '../../api/nexusApi'
import { useGoalsProfile } from '../../goals/GoalsProfileProvider'
import { useNexusPageTitle } from '../../layout/useNexusPageTitle'
import type { NexusGender } from '../../types/nexus'

const GENDERS: NexusGender[] = ['Homme', 'Femme', 'MTF', 'FTM']

export function GoalsConfigurationPage() {
  useNexusPageTitle('Configuration')
  const navigate = useNavigate()
  const { profile, loading, refreshProfile } = useGoalsProfile()
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [gender, setGender] = useState<NexusGender>('Homme')
  const [heightCm, setHeightCm] = useState('')
  const [weightKg, setWeightKg] = useState('')
  const [targetWeightKg, setTargetWeightKg] = useState('')

  useEffect(() => {
    if (profile) {
      setGender(profile.gender)
      setHeightCm(String(profile.heightCm))
      setWeightKg(String(profile.weightKg))
      setTargetWeightKg(profile.targetWeightKg != null ? String(profile.targetWeightKg) : '')
    }
  }, [profile])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      await putGoalsProfile({
        gender,
        heightCm: Number(heightCm),
        weightKg: Number(weightKg),
        targetWeightKg: targetWeightKg ? Number(targetWeightKg) : undefined,
      })
      await refreshProfile()
      setMessage('Profil enregistré')
      if (!profile) {
        navigate('/nexus/goals/dashboard')
      } else {
        navigate('/nexus/goals/profile')
      }
    } catch {
      setMessage('Erreur lors de l’enregistrement')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-heading tracking-tight">Configuration Goals</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Genre, taille, poids de référence et poids ciblé
        </p>
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle className="font-heading">Profil physique</CardTitle>
          <CardDescription>
            Ces valeurs servent de base au dashboard et au calcul de l'IMC.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gender">Genre</Label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value as NexusGender)}
                className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
              >
                {GENDERS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Taille (cm)</Label>
              <Input
                id="height"
                type="number"
                min={100}
                max={250}
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Poids de référence (kg)</Label>
              <Input
                id="weight"
                type="number"
                min={30}
                max={350}
                step="0.1"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target">Poids ciblé (kg)</Label>
              <Input
                id="target"
                type="number"
                min={30}
                max={350}
                step="0.1"
                value={targetWeightKg}
                onChange={(e) => setTargetWeightKg(e.target.value)}
              />
            </div>
            {message && (
              <p className={`text-sm ${message.includes('Erreur') ? 'text-destructive' : 'text-primary'}`}>
                {message}
              </p>
            )}
            <Button type="submit" disabled={saving} className="glow-primary">
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground">
        {profile && (
          <Link to="/nexus/goals/profile" className="text-primary hover:underline">
            Retour au profil →
          </Link>
        )}
      </p>
    </div>
  )
}
