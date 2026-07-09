import { useFetch } from '@/hooks/useFetch'
import { StatItem } from '@/components/stats/StatCardUi'
import { getSpotifyMood } from '../api/nexusApi'

function MoodCard({
  label,
  mood,
  loading,
  error,
}: {
  label: string
  mood: string | null
  loading: boolean
  error: string | null
}) {
  if (loading) {
    return (
      <StatItem
        label={label}
        value={
          <span className="text-base font-normal text-muted-foreground">Analyse en cours</span>
        }
        tone="gold"
        className="min-h-20"
      />
    )
  }

  if (error) {
    return (
      <StatItem
        label={label}
        value={<span className="text-base font-normal text-muted-foreground">{error}</span>}
        tone="accent"
      />
    )
  }

  return (
    <StatItem
      label={label}
      value={mood ?? '—'}
      tone="gold"
      className="min-h-20"
    />
  )
}

export function SpotifyMoodCards() {
  const mood = useFetch(getSpotifyMood)

  const errorMessage = mood.error
    ? mood.error.includes('openai:login') || mood.error.includes('.env.auth')
      ? 'IA non configurée'
      : mood.error
    : null

  const dayMood = mood.data?.day.mood ?? null
  const monthMood = mood.data?.month.mood ?? null

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <MoodCard
        label="Mood du jour"
        mood={dayMood}
        loading={mood.loading}
        error={errorMessage}
      />
      <MoodCard
        label="Mood du mois"
        mood={monthMood}
        loading={mood.loading}
        error={errorMessage}
      />
    </div>
  )
}
