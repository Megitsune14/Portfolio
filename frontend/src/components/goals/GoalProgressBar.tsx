type Props = {
  percent: number | null;
  detail?: string;
  emptyLabel?: string;
};

export function GoalProgressBar({ percent, detail, emptyLabel = 'Non estimé' }: Props) {
  const p = percent == null ? null : Math.min(100, Math.max(0, percent));

  return (
    <div className="w-full min-w-0">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[11px] font-bold tabular-nums tracking-tight text-foreground">
          {p == null ? '—' : `${p} %`}
        </span>
        {p == null ? (
          <span className="max-w-32 truncate text-right text-[9px] font-medium uppercase tracking-wider text-muted">
            {emptyLabel}
          </span>
        ) : null}
      </div>
      <div
        className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-(--secondary) ring-1 ring-(--border)"
        role="progressbar"
        aria-valuenow={p ?? undefined}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={p == null ? emptyLabel : `Progression ${p} pourcent`}
      >
        <div
          className="h-full rounded-full bg-(--primary) transition-[width] duration-500 ease-out"
          style={{ width: p == null ? '0%' : `${p}%` }}
        />
      </div>
      {detail ? <p className="mt-1.5 text-[10px] leading-snug text-muted">{detail}</p> : null}
    </div>
  );
}
