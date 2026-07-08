import { useMemo } from 'react'
import type { NexusWeightEntry } from '../types/nexus'

export interface WeightTargetLine {
  id: string
  label: string
  weight: number
  kind: 'profile' | 'goal'
}

interface WeightJourneyChartProps {
  weightHistory: NexusWeightEntry[]
  weightTargets?: {
    profile: number | null
    goals: { id: string; title: string; weightKg: number }[]
  }
}

interface ChartPoint {
  date: Date
  weight: number
}

const WIDTH = 800
const HEIGHT = 300
const PADDING = { top: 24, right: 120, bottom: 44, left: 52 }

function formatAxisDate(date: Date) {
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

function formatTooltipDate(date: Date) {
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function buildTargetLines(
  weightTargets?: WeightJourneyChartProps['weightTargets'],
): WeightTargetLine[] {
  if (!weightTargets) return []

  const lines: WeightTargetLine[] = []

  if (weightTargets.profile != null) {
    lines.push({
      id: 'profile-target',
      label: 'Cible profil',
      weight: weightTargets.profile,
      kind: 'profile',
    })
  }

  for (const goal of weightTargets.goals) {
    lines.push({
      id: goal.id,
      label: goal.title,
      weight: goal.weightKg,
      kind: 'goal',
    })
  }

  return lines
}

export function WeightJourneyChart({ weightHistory, weightTargets }: WeightJourneyChartProps) {
  const targetLines = useMemo(() => buildTargetLines(weightTargets), [weightTargets])

  const points = useMemo<ChartPoint[]>(
    () =>
      [...weightHistory]
        .sort((a, b) => new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime())
        .map((entry) => ({
          date: new Date(entry.measuredAt),
          weight: entry.weightKg,
        })),
    [weightHistory],
  )

  if (points.length === 0) {
    return <p className="text-sm text-muted-foreground">Aucune pesée enregistrée.</p>
  }

  const startWeight = points[0]!.weight
  const currentWeight = points[points.length - 1]!.weight
  const delta = Math.round((currentWeight - startWeight) * 10) / 10

  const chartWidth = WIDTH - PADDING.left - PADDING.right
  const chartHeight = HEIGHT - PADDING.top - PADDING.bottom

  const allWeights = [
    ...points.map((p) => p.weight),
    ...targetLines.map((line) => line.weight),
  ]
  const rawMin = Math.min(...allWeights)
  const rawMax = Math.max(...allWeights)
  const spread = Math.max(rawMax - rawMin, 2)
  const minWeight = Math.floor((rawMin - spread * 0.15) * 2) / 2
  const maxWeight = Math.ceil((rawMax + spread * 0.15) * 2) / 2
  const weightRange = maxWeight - minWeight || 1

  const xAt = (index: number) =>
    PADDING.left + (index / Math.max(points.length - 1, 1)) * chartWidth

  const yAt = (weight: number) =>
    PADDING.top + chartHeight - ((weight - minWeight) / weightRange) * chartHeight

  const linePath =
    points.length === 1
      ? ''
      : points
          .map((point, index) => {
            const cmd = index === 0 ? 'M' : 'L'
            return `${cmd} ${xAt(index)} ${yAt(point.weight)}`
          })
          .join(' ')

  const yTicks = 4
  const yTickValues = Array.from({ length: yTicks + 1 }, (_, i) =>
    Math.round((minWeight + (weightRange * i) / yTicks) * 10) / 10,
  )

  const xTickIndexes =
    points.length <= 4
      ? points.map((_, i) => i)
      : [0, Math.floor((points.length - 1) / 2), points.length - 1]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-6 text-sm">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Départ</p>
          <p className="text-2xl font-bold font-heading text-(--gold)">{startWeight} kg</p>
          <p className="text-xs text-muted-foreground">{formatTooltipDate(points[0]!.date)}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Actuel</p>
          <p className="text-2xl font-bold font-heading text-primary">{currentWeight} kg</p>
          <p className="text-xs text-muted-foreground">
            {formatTooltipDate(points[points.length - 1]!.date)}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Évolution</p>
          <p
            className={`text-2xl font-bold font-heading ${
              delta < 0 ? 'text-primary' : delta > 0 ? 'text-accent' : 'text-muted-foreground'
            }`}
          >
            {delta > 0 ? '+' : ''}
            {delta} kg
          </p>
        </div>
        {weightTargets?.profile != null && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Cible profil
            </p>
            <p className="text-2xl font-bold font-heading text-accent">{weightTargets.profile} kg</p>
          </div>
        )}
      </div>

      {targetLines.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {targetLines.map((line) => (
            <span
              key={line.id}
              className={`rounded-md border px-2.5 py-1 text-xs font-medium ${
                line.kind === 'profile'
                  ? 'border-accent/35 bg-accent/10 text-accent'
                  : 'border-primary/35 bg-primary/10 text-primary'
              }`}
            >
              {line.label} · {line.weight} kg
            </span>
          ))}
        </div>
      )}

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="h-auto w-full min-w-[320px]"
          role="img"
          aria-label="Graphique du parcours de poids"
        >
          {yTickValues.map((value) => {
            const y = yAt(value)
            return (
              <g key={value}>
                <line
                  x1={PADDING.left}
                  y1={y}
                  x2={WIDTH - PADDING.right}
                  y2={y}
                  className="stroke-border/50"
                  strokeWidth={1}
                  strokeDasharray="4 6"
                />
                <text
                  x={PADDING.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-muted-foreground text-[11px]"
                >
                  {value}
                </text>
              </g>
            )
          })}

          {targetLines.map((line) => {
            const y = yAt(line.weight)
            const strokeClass = line.kind === 'profile' ? 'stroke-accent' : 'stroke-primary'
            const fillClass = line.kind === 'profile' ? 'fill-accent' : 'fill-primary'

            return (
              <g key={`target-${line.id}`}>
                <line
                  x1={PADDING.left}
                  y1={y}
                  x2={WIDTH - PADDING.right}
                  y2={y}
                  className={strokeClass}
                  strokeWidth={1.5}
                  strokeDasharray="8 5"
                  opacity={0.85}
                />
                <text
                  x={WIDTH - PADDING.right + 6}
                  y={y + 4}
                  className={`text-[10px] font-medium ${fillClass}`}
                >
                  {line.label} ({line.weight})
                </text>
              </g>
            )
          })}

          {points.length > 1 && (
            <path
              d={linePath}
              fill="none"
              className="stroke-primary"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {points.map((point, index) => {
            const x = xAt(index)
            const y = yAt(point.weight)
            const isStart = index === 0
            const isEnd = index === points.length - 1

            return (
              <g key={`${point.date.toISOString()}-${index}`}>
                <circle
                  cx={x}
                  cy={y}
                  r={isStart || isEnd ? 6 : 4}
                  className={isStart ? 'fill-(--gold)' : 'fill-primary'}
                  stroke="var(--background)"
                  strokeWidth={2}
                />
                {(isStart || isEnd) && (
                  <text
                    x={x}
                    y={y - 14}
                    textAnchor="middle"
                    className={`text-[11px] font-medium ${isStart ? 'fill-(--gold)' : 'fill-primary'}`}
                  >
                    {point.weight} kg
                  </text>
                )}
              </g>
            )
          })}

          {xTickIndexes.map((index) => {
            const point = points[index]!
            return (
              <text
                key={index}
                x={xAt(index)}
                y={HEIGHT - 14}
                textAnchor="middle"
                className="fill-muted-foreground text-[11px]"
              >
                {formatAxisDate(point.date)}
              </text>
            )
          })}

          <text
            x={14}
            y={HEIGHT / 2}
            textAnchor="middle"
            transform={`rotate(-90 14 ${HEIGHT / 2})`}
            className="fill-muted-foreground text-[11px]"
          >
            kg
          </text>
        </svg>
      </div>
    </div>
  )
}
