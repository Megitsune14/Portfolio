import { MONTH_LABELS } from '@/lib/spotify/labels';
import type { SpotifyPeriods, WrappedPeriodSelection } from '@/types/spotify-wrapped';

const selectClass =
  'focus-ring w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground';

type Props = {
  periods: SpotifyPeriods | undefined;
  selection: WrappedPeriodSelection;
  onChange: (selection: WrappedPeriodSelection) => void;
};

function getMonthValue(selection: WrappedPeriodSelection): string {
  if (selection.kind !== 'month') return 'year';
  if (selection.month === 'current') return 'current';
  return String(selection.month);
}

export function SpotifyWrappedPeriodSelect({ periods, selection, onChange }: Props) {
  const currentYear = new Date().getFullYear();
  const selectedYear = selection.kind === 'all-time' ? null : selection.year;
  const monthsForYear =
    selectedYear != null ? (periods?.monthsByYear[String(selectedYear)] ?? []) : [];

  const primaryValue =
    selection.kind === 'all-time' ? 'all-time' : `year:${selection.year}`;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="min-w-[220px]">
        <label htmlFor="spotify-period" className="mb-1 block text-xs font-medium text-muted-foreground">
          Période
        </label>
        <select
          id="spotify-period"
          value={primaryValue}
          onChange={(event) => {
            const value = event.target.value;
            if (value === 'all-time') {
              onChange({ kind: 'all-time' });
              return;
            }
            const year = parseInt(value.replace('year:', ''), 10);
            onChange({ kind: 'year', year });
          }}
          className={selectClass}
        >
          <option value="all-time">Depuis le début</option>
          {(periods?.years ?? [currentYear]).map((year) => (
            <option key={year} value={`year:${year}`}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {selection.kind !== 'all-time' ? (
        <div className="min-w-[220px]">
          <label htmlFor="spotify-month" className="mb-1 block text-xs font-medium text-muted-foreground">
            Détail
          </label>
          <select
            id="spotify-month"
            value={selection.kind === 'year' ? 'year' : getMonthValue(selection)}
            onChange={(event) => {
              const value = event.target.value;
              const year = selection.kind === 'month' ? selection.year : selection.year;

              if (value === 'year') {
                onChange({ kind: 'year', year });
                return;
              }

              if (value === 'current') {
                onChange({ kind: 'month', year, month: 'current' });
                return;
              }

              onChange({ kind: 'month', year, month: parseInt(value, 10) });
            }}
            className={selectClass}
          >
            <option value="year">Toute l&apos;année</option>
            {selectedYear === currentYear ? (
              <option value="current">Ce mois-ci</option>
            ) : null}
            {monthsForYear.map((month) => (
              <option key={month} value={String(month)}>
                {MONTH_LABELS[month - 1]} {selectedYear}
              </option>
            ))}
          </select>
        </div>
      ) : null}
    </div>
  );
}
