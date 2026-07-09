import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export const statCardClass = 'glass stat-card'

type AccentTone = 'primary' | 'gold' | 'accent'

const iconAccentStyles: Record<AccentTone, string> = {
  primary: 'bg-primary/15 ring-primary/40',
  gold: 'bg-[color-mix(in_srgb,var(--gold)_14%,transparent)] ring-(--gold)/45',
  accent: 'bg-accent/12 ring-accent/40',
}

export function StatCardHeader({
  icon,
  title,
  subtitle,
  accent = 'primary',
  iconVariant = 'default',
}: {
  icon: ReactNode
  title: string
  subtitle?: string
  accent?: AccentTone
  iconVariant?: 'default' | 'brand'
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          'flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl',
          iconVariant === 'default' && cn('ring-1', iconAccentStyles[accent]),
          iconVariant === 'brand' && 'bg-transparent',
        )}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <h3 className="font-heading text-lg font-semibold tracking-tight">{title}</h3>
        {subtitle && (
          <p className="truncate text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </div>
  )
}

export function StatSection({
  title,
  children,
  className,
}: {
  title: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('space-y-3', className)}>
      <p className="text-sm font-medium tracking-wide text-gradient-subtle uppercase">
        {title}
      </p>
      {children}
    </div>
  )
}

export function StatItem({
  label,
  value,
  highlight,
  tone = 'primary',
  className,
}: {
  label: string
  value: ReactNode
  highlight?: boolean
  tone?: AccentTone
  className?: string
}) {
  const toneStyles: Record<AccentTone, string> = {
    primary:
      'border-primary/30 bg-[color-mix(in_srgb,var(--primary)_7%,transparent)]',
    gold: 'border-(--gold)/35 bg-[color-mix(in_srgb,var(--gold)_9%,transparent)]',
    accent:
      'border-accent/35 bg-[color-mix(in_srgb,var(--accent)_8%,transparent)]',
  }

  return (
    <div
      className={cn('rounded-xl border p-4', toneStyles[tone], className)}
    >
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p
        className={cn(
          'mt-1.5 text-xl font-semibold tabular-nums font-heading',
          highlight && 'text-3xl font-bold text-(--gold)',
          !highlight && tone === 'primary' && 'text-primary',
          !highlight && tone === 'accent' && 'text-accent',
        )}
      >
        {value}
      </p>
    </div>
  )
}

export function StatGrid({
  children,
  cols = 2,
}: {
  children: ReactNode
  cols?: 2 | 3 | 4 | 5
}) {
  return (
    <div
      className={cn(
        'grid gap-3',
        cols === 2 && 'sm:grid-cols-2',
        cols === 3 && 'sm:grid-cols-3',
        cols === 4 && 'sm:grid-cols-2 lg:grid-cols-4',
        cols === 5 && 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
      )}
    >
      {children}
    </div>
  )
}

export function StatPanel({
  children,
  className,
  tone = 'accent',
}: {
  children: ReactNode
  className?: string
  tone?: AccentTone
}) {
  const toneStyles: Record<AccentTone, string> = {
    primary:
      'border-primary/30 bg-[color-mix(in_srgb,var(--primary)_6%,transparent)]',
    gold: 'border-(--gold)/30 bg-[color-mix(in_srgb,var(--gold)_7%,transparent)]',
    accent:
      'border-accent/30 bg-[color-mix(in_srgb,var(--accent)_7%,transparent)]',
  }

  return (
    <div className={cn('rounded-xl border p-4', toneStyles[tone], className)}>
      {children}
    </div>
  )
}

export function StatDivider() {
  return <hr className="stat-divider" />
}

export function StatTag({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-md border border-accent/35 bg-accent/10 px-2.5 py-1 text-xs text-accent">
      {children}
    </span>
  )
}

export function StatRankBanner({
  label,
  rank,
  lp,
  record,
  winRate,
  lpLabel,
  recordLabel,
  winRateLabel,
}: {
  label: string
  rank: string
  lp: ReactNode
  record: ReactNode
  winRate: ReactNode
  lpLabel: string
  recordLabel: string
  winRateLabel: string
}) {
  return (
    <div className="glow-gold rounded-xl border border-(--gold)/35 bg-[color-mix(in_srgb,var(--primary)_8%,transparent)] p-4">
      <p className="text-sm font-medium tracking-wide text-gradient-subtle uppercase">
        {label}
      </p>
      <p className="mt-1 text-3xl font-bold font-heading tracking-tight text-gradient">
        {rank}
      </p>
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-primary/30 bg-primary/8 px-2 py-2 text-center">
          <p className="text-[0.65rem] font-medium text-primary uppercase">{lpLabel}</p>
          <p className="mt-0.5 text-sm font-semibold">{lp}</p>
        </div>
        <div className="rounded-lg border border-accent/30 bg-accent/8 px-2 py-2 text-center">
          <p className="text-[0.65rem] font-medium text-accent uppercase">{recordLabel}</p>
          <p className="mt-0.5 text-sm font-semibold">{record}</p>
        </div>
        <div className="rounded-lg border border-(--gold)/35 bg-[color-mix(in_srgb,var(--gold)_10%,transparent)] px-2 py-2 text-center">
          <p className="text-[0.65rem] font-medium text-(--gold) uppercase">{winRateLabel}</p>
          <p className="mt-0.5 text-sm font-bold text-(--gold)">{winRate}</p>
        </div>
      </div>
    </div>
  )
}

export function StatChampionRow({
  rank,
  name,
  masteryLevel,
  masteryPoints,
  masteryLabel,
  pointsLabel,
}: {
  rank: number
  name: string
  masteryLevel: number
  masteryPoints: number
  masteryLabel: string
  pointsLabel: string
}) {
  const isFirst = rank === 1

  return (
    <li
      className={cn(
        'flex items-center gap-4 rounded-xl border px-4 py-3 transition-colors',
        isFirst
          ? 'border-(--gold)/40 bg-[color-mix(in_srgb,var(--gold)_8%,transparent)]'
          : 'border-primary/25 bg-[color-mix(in_srgb,var(--primary)_5%,transparent)]',
      )}
    >
      <span
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-lg font-heading text-sm font-bold ring-1',
          isFirst
            ? 'bg-[color-mix(in_srgb,var(--gold)_18%,transparent)] text-(--gold) ring-(--gold)/45'
            : 'bg-primary/15 text-primary ring-primary/35',
        )}
      >
        {rank}
      </span>
      <p className="min-w-0 flex-1 font-heading text-base font-medium leading-tight">{name}</p>
      <div className="flex shrink-0 gap-6 text-right">
        <div>
          <p className="text-[0.65rem] font-medium tracking-wide text-muted-foreground uppercase">
            {masteryLabel}
          </p>
          <p className="mt-0.5 text-base font-bold font-heading text-(--gold)">
            {masteryLevel}
          </p>
        </div>
        <div>
          <p className="text-[0.65rem] font-medium tracking-wide text-muted-foreground uppercase">
            {pointsLabel}
          </p>
          <p className="mt-0.5 text-base font-semibold tabular-nums text-primary">
            {masteryPoints.toLocaleString()}
          </p>
        </div>
      </div>
    </li>
  )
}
